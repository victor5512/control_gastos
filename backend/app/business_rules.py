#archivo donde se define la regla de 2000.00
#se puede modificar la cantidad
from decimal import Decimal
#limite es 2000.00
#usamos decimal y no flotante para evitar el redondeo de flotante y existan fallos 

LIMITE_DEDUCIBILIDAD = Decimal("2000.00")

#funcion recibimos el objeto gasto  y bool recibe true o false
# true o false para deducible o no
def es_deducible(gasto) -> bool:
    #factura 
    if not gasto.invoice: # si es false
        return False# regresa true  o viceversa

#revisa el importa
    if (
        gasto.amount > LIMITE_DEDUCIBILIDAD
        and gasto.payment_method == "Efectivo"
    ):
        #solo rechaza el importe cuando se cumplen ambas condiciones si supera 2000 y pago en efectivo
        return False
#si no se rechaza es deducible
    return True