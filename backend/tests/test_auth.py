#test autenticacion   
#comando prueba
# python -m pytest tests/test_auth.py -v 
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

#inicio de sesion
def test_gastos_sin_sesion_devuelve_401():
    response = client.get("/api/gastos")
    assert response.status_code == 401

#usuario actual para verificar que usuairo estamos usando
def test_usuario_actual_sin_sesion_devuelve_401():
    response = client.get("/api/usuario_actual")

    assert response.status_code == 401

#cerrar sesion
def test_cerrar_sesion_sin_autenticacion_devuelve_401():
    response = client.delete("/api/sesion")

    assert response.status_code == 401

#insercion pero con sesion cerrada
def test_registro_rechaza_datos_invalidos():
    response = client.post(
        "/api/registro",
        json={
            "name": "Victor",
            "email": "correo-no-valido",
            "password": "123",
        },
    )

    assert response.status_code == 422
