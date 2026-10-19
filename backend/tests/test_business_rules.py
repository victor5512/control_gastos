#tests
#comando para la prueba test
#python -m pytest tests/test_business_rules.py -v
from pydantic import ValidationError
from decimal  import Decimal
from types  import SimpleNamespace
import pytest 
from app.schemas import RegistrarGasto
from app.business_rules import es_deducible

#pytest.mark.parametrize ejecuta la misma prueba los 6 casos existentes
@pytest.mark.parametrize(
    "amount,payment_method,invoice,esperado",
    [   (Decimal("1500.00"), "Efectivo", True, True),
        (Decimal("1500.00"), "Efectivo", False, False),
        (Decimal("2000.00"), "Efectivo", True, True),
        (Decimal("2000.01"), "Efectivo", True, False),
        (Decimal("5000.00"), "Transferencia", True, True),
        (Decimal("5000.00"), "Tarjeta", False, False),
        ],
    )

def test_es_deducible(amount, payment_method, invoice, esperado):
    #SimpleNamespace crea un objeto de prueba con los tres atributos que necesita la función.
    gasto = SimpleNamespace(
        #solo necesitamos tres datos para comprobar el monto, tipo de pago, y si tiene factura o no
        amount=amount,
        payment_method=payment_method,
        invoice=invoice,
    )
    #compara el resultado real con el esperado
    assert es_deducible(gasto) is esperado#is esperado comprueba si es true o false 



#prueba que valide que la Api rechace un gasto con monto  0
def test_rechaza_gasto_con_importe_cero():
    with pytest.raises(ValidationError):
        RegistrarGasto(
            dates="2026-10-18",
            concept="Prueba de validacion a 0",
            category="Transporte",
            amount=Decimal("0.00"),
            payment_method="Efectivo",
            invoice=True,
        )

