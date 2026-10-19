#proteger rutas privadas
from datetime import datetime,timezone
from fastapi import Depends,HTTPException,Request,status
from sqlalchemy import select
from sqlalchemy.orm import Session as DBSession
#archivos de  app/
from app.database import get_db
from app.models import Sesiones as ModelSession,Usuario
from app.security import hash_session_token

#funcion que sirve para obtener el id del usuario autenticado 
def get_current_user(
    request:Request, 
    db:DBSession=Depends(get_db),
    )-> Usuario:
    token=request.cookies.get("session_token")
    if not token:
        raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Debes iniciar sesión.")
    token_hash=hash_session_token(token)

    sesion = db.scalar(
        select(ModelSession).where(
            ModelSession.token_hash == token_hash
            )
    )
    
    #la sesion no existe o no es valida
    if sesion is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="La sesión no es valida.",
            )
     #tiempo de sesion   
    ahora =datetime.now(timezone.utc)
    if sesion.expired<=ahora:
        db.delete(sesion)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="La sesión ha expirado. Inicia sesión nuevamente.",
            )

    #validacion usuario    
    usuario=db.get(Usuario,sesion.user_id)
    if usuario is None:
           raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="La sesión no es válida.",
        )
    return usuario

        
    

                     