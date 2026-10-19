#validar lo que llega a las APIs
from datetime import date,datetime
from decimal import Decimal
from typing import Literal
from pydantic import BaseModel,ConfigDict,EmailStr,Field
#esquema para registrar un usuario
class RegistrarUsuario(BaseModel):
    name:str= Field(min_length=2,max_length=100)
    email:EmailStr
    password:str=Field(min_length=8,max_length=128)
    
#esquema para iniciar sesion
class InicioSesion(BaseModel):
    email:EmailStr
    password:str=Field(min_length=1,max_length=128)#evitamos que tenga entradas demasiado grandes
    
#esquema para un usuario
class UsuarioPublico(BaseModel):
    model_config=ConfigDict(from_attributes=True)    
    id_user:int
    name:str
    email:str


#categorias y metodos de pago concuerdo a las reglas
CategoriaGasto=Literal["Papelería", "Transporte", "Alimentos", "Servicios", "Otros"]

MetododePagoGasto=Literal["Efectivo", "Transferencia", "Tarjeta"]

#Esquema para crear gasto Dar de alta un gasto
class RegistrarGasto(BaseModel):
    dates:date
    concept: str=Field(min_length=3,max_length=120)
    category:CategoriaGasto 
    amount:Decimal=Field(gt=0,max_digits=10,decimal_places=2) 
    payment_method:MetododePagoGasto
    invoice:bool=False
    
#Esquema para consultar gastos
class ListarGasto(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id_bill:int
    dates:date
    concept: str
    category:str 
    amount:Decimal 
    payment_method:str
    invoice:bool
    deducible:bool
    created:datetime


# Esquema para actualizar un gasto
class GastoActualizar(BaseModel):
    dates: date
    concept: str = Field(min_length=3, max_length=120)
    category: CategoriaGasto
    amount: Decimal = Field(gt=0, max_digits=10, decimal_places=2)
    payment_method: MetododePagoGasto
    invoice: bool = False