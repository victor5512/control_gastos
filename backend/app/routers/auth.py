#autenticacion
import os 
from datetime import datetime,timedelta,timezone
from fastapi import APIRouter,Depends,HTTPException,Request,Response,status
from sqlalchemy import delete, func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session as DBSession

from app.database import get_db
from app.security import(generate_session_token,hash_session_token,hash_session_token,verify_password,hash_password)
from app.models import Sesiones,Usuario
from app.dependencies import get_current_user
from app.schemas import InicioSesion, RegistrarUsuario, UsuarioPublico

router=APIRouter(prefix="/api",tags=["Autenticación"])

duracion_sesion=timedelta(hours=8)
cookie_secure=(os.getenv("COOKIE_SECURE","false").lower()=="true")

#crear POST  /api/registro: Crear una cuenta
#si registrar un usuario con correo valida si existe uno igual en la BD en caso de que si manda el mensaje con codigo 409
#todo correo se convierte a minusculas y asi entra a la BD
@router.post(
    "/registro",
    response_model=UsuarioPublico,
    status_code=status.HTTP_201_CREATED,
    )
def crear_cuenta(
    datos:RegistrarUsuario,
    db:DBSession=Depends(get_db),
    ): 
    correo=str(datos.email).lower()

    existente=db.scalar(
        select(Usuario).where(
            func.lower(Usuario.email)==correo
            )
        )
    if existente:
        raise HTTPException(
            status_code=409,
            detail="Ya existe una cuenta con ese correo.",)
    usuario=Usuario(
        name=datos.name.strip(),
        email=correo,
        password_hash=hash_password(datos.password),
        )  
    try:
        db.add(usuario)
        db.commit()
        db.refresh(usuario)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
        status_code=409,
        detail="No fue posible registrar la cuenta.",
        )
    return usuario


#POST /api/sesion Iniciar sesión
@router.post ("/sesion")
def iniciar_sesion(
    datos:InicioSesion,
    response:Response,
    db:DBSession=Depends(get_db),
    ):
    correo=str(datos.email).lower()
    usuario = db.scalar(
        select(Usuario).where(
            func.lower(Usuario.email) == correo
        )
    )
    #si el usuario no contiene password
    if (
        usuario is None
        or not verify_password(
            datos.password,
            usuario.password_hash,
        )
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos.",
        )
    # El token se obtiene de la cookie en la petición.
    token = generate_session_token()
    ahora = datetime.now(timezone.utc)

    sesion = Sesiones(
        user_id=usuario.id_user,
        token_hash=hash_session_token(token),
        created=ahora,
        expired=ahora + duracion_sesion,
    )

    db.add(sesion)
    db.commit()

    response.set_cookie(
        key="session_token",
        value=token,
        httponly=True,#evita que js del navegador lea directamente la cookie
        secure=cookie_secure,
        samesite="lax",
        max_age=int(duracion_sesion.total_seconds()),
        path="/",
    )

    return {
        "mensaje": "Sesión iniciada correctamente.",
        "usuario": UsuarioPublico.model_validate(usuario),
    }

# DELETE /api/sesion: cerrar sesión
@router.delete(
    "/sesion",
    status_code=status.HTTP_204_NO_CONTENT,
)
def cerrar_sesion(
    request: Request,
    response: Response,
    usuario: Usuario = Depends(get_current_user),
    db: DBSession = Depends(get_db),
):
    token = request.cookies.get("session_token")

    if token:
        db.execute(
            delete(Sesiones).where(
                Sesiones.user_id == usuario.id_user,
                Sesiones.token_hash == hash_session_token(token),
            )
        )
        db.commit()

    response.delete_cookie(
        key="session_token",
        path="/",
        httponly=True,
        secure=cookie_secure,
        samesite="lax",
    )

# GET /api/me: consultar el usuario autenticado
@router.get("/usuario_actual", response_model=UsuarioPublico)
def obtener_usuario_actual(
    usuario: Usuario = Depends(get_current_user),
):
    return usuario
