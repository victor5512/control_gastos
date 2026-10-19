#Gastos
from typing import Optional
from fastapi import APIRouter,Depends,HTTPException,status,Query
from sqlalchemy import  select
from sqlalchemy.orm import Session as DBSession
from datetime import date
from decimal import Decimal

from app.business_rules import es_deducible
from app.database import get_db
from app.models import Gasto,Usuario
from app.schemas import RegistrarGasto, ListarGasto, GastoActualizar
from app.dependencies import get_current_user

router=APIRouter(prefix="/api",tags=["Gastos"])

# POST /api/gastos Dar de alta un gasto
@router.post(
    "/gastos",
    response_model=ListarGasto,
    status_code=status.HTTP_201_CREATED,
)
def dar_alta_gasto(
    datos:RegistrarGasto,
    db:DBSession=Depends(get_db),
    usuario:Usuario=Depends(get_current_user),
    ): 
    gasto=Gasto(
        user_id=usuario.id_user,#<- determina quien es el propietario del gasto
        dates=datos.dates,
        concept=datos.concept.strip(),
        category=datos.category, 
        amount=datos.amount,
        payment_method=datos.payment_method,
        invoice=datos.invoice,
        )
    db.add(gasto)
    db.commit()
    db.refresh(gasto)
    return gasto


# GET /api/gastos Listar todos los gastos
# GET /api/gastos con filtros opcionales mes y categoria
@router.get("/gastos", response_model=list[ListarGasto])
def listar_gastos(
    mes: Optional[int] = Query(default=None, ge=1, le=12),
    anio: Optional[int] = Query(default=None, ge=2000, le=2100),
    categoria: Optional[str] = Query(default=None),
    db: DBSession = Depends(get_db),
    usuario: Usuario = Depends(get_current_user),
):
    consulta = select(Gasto).where(Gasto.user_id == usuario.id_user)

    #  Filtro opcional por mes y año
    if mes is not None or anio is not None:
        if mes is None or anio is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Debes indicar mes y año juntos.",
            )
        desde = date(anio, mes, 1)
        if mes == 12:
            hasta = date(anio + 1, 1, 1)
        else:
            hasta = date(anio, mes + 1, 1)
            
        consulta = consulta.where(
            Gasto.dates >= desde,
            Gasto.dates < hasta,
        )

    #Filtro por categoría
    if categoria is not None:
        categorias_validas = {
            "Papeleria",
            "Transporte",
            "Alimentos",
            "Servicios",
            "Otros",
        }
        if categoria not in categorias_validas:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="La categoría no es válida.",
            )
        consulta = consulta.where(Gasto.category == categoria)

    #Ordenamiento y ejecución de la consulta para todos los casos
    consulta = consulta.order_by(Gasto.dates.desc(), Gasto.id_bill.desc())
    return db.scalars(consulta).all()

 
# PUT /api/gastos/{id} Editar un gasto
@router.put(
    "/gastos/{id_bill}",
    response_model=ListarGasto,
)
def editar_gasto(
    id_bill: int,
    datos: GastoActualizar,
    db: DBSession = Depends(get_db),
    usuario: Usuario = Depends(get_current_user),
):
    gasto=db.scalar(
        select(Gasto).where(
            Gasto.id_bill==id_bill,
            Gasto.user_id==usuario.id_user,
        )
    )
    if gasto is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gasto no encontrado",
        )
    gasto.dates = datos.dates
    gasto.concept = datos.concept.strip()
    gasto.category = datos.category
    gasto.amount = datos.amount
    gasto.payment_method = datos.payment_method
    gasto.invoice = datos.invoice
    db.commit()
    db.refresh(gasto)
    return gasto


# DELETE /api/gastos/{id} Eliminar un gasto
@router.delete(
    "/gastos/{id_bill}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def eliminar_gasto(
    id_bill: int,
    db: DBSession = Depends(get_db),
    usuario: Usuario = Depends(get_current_user),
):
    gasto = db.scalar(
        select(Gasto).where(
            Gasto.id_bill == id_bill,
            Gasto.user_id == usuario.id_user,
        )
    )

    if gasto is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gasto no encontrado.",
        )

    db.delete(gasto)
    db.commit()


#GET /api/resumen?mes=AAAA-MM Total del mes
@router.get("/resumen")
def resumen_mensual(
    mes: str = Query(
        ...,
        pattern=r"^\d{4}-(0[1-9]|1[0-2])$",
        description="Mes a consultar en formato AAAA-MM",
    ),
    db: DBSession = Depends(get_db),
    usuario: Usuario = Depends(get_current_user),
):
    inicio = date.fromisoformat(f"{mes}-01")

    if inicio.month == 12:
        fin = date(inicio.year + 1, 1, 1)
    else:
        fin = date(inicio.year, inicio.month + 1, 1)

    consulta = select(Gasto).where(
        Gasto.user_id == usuario.id_user,
        Gasto.dates >= inicio,
        Gasto.dates < fin,
    )

    gastos = db.scalars(consulta).all()

    total = Decimal("0.00")
    total_deducible = Decimal("0.00")
    por_categoria = {}

    for gasto in gastos:
        total += gasto.amount

        por_categoria[gasto.category] = (
            por_categoria.get(gasto.category, Decimal("0.00"))
            + gasto.amount
        )
#funcion de bussiness_rules.py llega aqui
        if es_deducible(gasto):
            total_deducible += gasto.amount

    return {
        "mes": mes,
        "total_gastado": total,
        "total_deducible": total_deducible,
        "por_categoria": por_categoria,
        "cantidad_gastos": len(gastos),
    }
