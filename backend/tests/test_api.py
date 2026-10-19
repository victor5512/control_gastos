from fastapi.testclient import TestClient


def registrar_usuario(client: TestClient, email: str):
    response = client.post(
        "/api/registro",
        json={
            "name": "Usuario Prueba",
            "email": email,
            "password": "ClaveSegura123",
        },
    )
    assert response.status_code == 201
    return response.json()


def iniciar_sesion(client: TestClient, email: str):
    response = client.post(
        "/api/sesion",
        json={
            "email": email,
            "password": "ClaveSegura123",
        },
    )
    assert response.status_code == 200
    assert "session_token" in response.cookies


def crear_gasto(client: TestClient, concept="Gasto de prueba"):
    return client.post(
        "/api/gastos",
        json={
            "dates": "2026-10-18",
            "concept": concept,
            "category": "Transporte",
            "amount": "1500.00",
            "payment_method": "Efectivo",
            "invoice": True,
        },
    )


def test_registro_y_login_correctos(client):
    registrar_usuario(client, "usuario1@example.com")
    iniciar_sesion(client, "usuario1@example.com")

    response = client.get("/api/usuario_actual")

    assert response.status_code == 200
    assert response.json()["email"] == "usuario1@example.com"


def test_registro_rechaza_correo_duplicado(client):
    registrar_usuario(client, "usuario1@example.com")

    response = client.post(
        "/api/registro",
        json={
            "name": "Otro Usuario",
            "email": "USUARIO1@example.com",
            "password": "ClaveSegura123",
        },
    )

    assert response.status_code == 409


def test_login_rechaza_contrasena_incorrecta(client):
    registrar_usuario(client, "usuario1@example.com")

    response = client.post(
        "/api/sesion",
        json={
            "email": "usuario1@example.com",
            "password": "ContrasenaIncorrecta",
        },
    )

    assert response.status_code == 401


def test_crear_gasto_y_listarlo(client):
    registrar_usuario(client, "usuario1@example.com")
    iniciar_sesion(client, "usuario1@example.com")

    creado = crear_gasto(client)

    assert creado.status_code == 201
    assert creado.json()["deducible"] is True

    listado = client.get("/api/gastos")

    assert listado.status_code == 200
    assert len(listado.json()) == 1
    assert listado.json()[0]["concept"] == "Gasto de prueba"


def test_filtro_mensual_y_resumen(client):
    registrar_usuario(client, "usuario1@example.com")
    iniciar_sesion(client, "usuario1@example.com")

    assert crear_gasto(client).status_code == 201

    listado = client.get(
        "/api/gastos",
        params={"mes": 10, "anio": 2026, "categoria": "Transporte"},
    )
    assert listado.status_code == 200
    assert len(listado.json()) == 1

    resumen = client.get(
        "/api/resumen",
        params={"mes": "2026-10"},
    )

    assert resumen.status_code == 200
    datos = resumen.json()
    assert float(datos["total_gastado"]) == 1500.00
    assert float(datos["total_deducible"]) == 1500.00
    assert datos["cantidad_gastos"] == 1


def test_usuario_no_ve_gastos_de_otro_usuario(client):
    registrar_usuario(client, "usuario1@example.com")
    iniciar_sesion(client, "usuario1@example.com")

    gasto = crear_gasto(client)
    assert gasto.status_code == 201
    id_gasto = gasto.json()["id_bill"]

    registrar_usuario(client, "usuario2@example.com")
    iniciar_sesion(client, "usuario2@example.com")

    listado = client.get("/api/gastos")

    assert listado.status_code == 200
    assert listado.json() == []

    resumen = client.get(
        "/api/resumen",
        params={"mes": "2026-10"},
    )

    assert resumen.status_code == 200
    assert float(resumen.json()["total_gastado"]) == 0.0

    intento_editar = client.put(
        f"/api/gastos/{id_gasto}",
        json={
            "dates": "2026-10-18",
            "concept": "Intento de modificar",
            "category": "Transporte",
            "amount": "200.00",
            "payment_method": "Tarjeta",
            "invoice": True,
        },
    )
    # Se acepta 404 (no encontrado por pertenecer a otro usuario)
    assert intento_editar.status_code in (404, 403, 422)

    intento_borrar = client.delete(f"/api/gastos/{id_gasto}")
    assert intento_borrar.status_code in (404, 403, 422)


def test_actualizar_y_eliminar_gasto(client):
    registrar_usuario(client, "usuario1@example.com")
    iniciar_sesion(client, "usuario1@example.com")

    creado = crear_gasto(client)
    assert creado.status_code == 201
    id_gasto = creado.json()["id_bill"]

    actualizado = client.put(
        f"/api/gastos/{id_gasto}",
        json={
            "dates": "2026-10-18",
            "concept": "Gasto actualizado",
            "category": "Alimentos",
            "amount": "250.00",
            "payment_method": "Tarjeta",
            "invoice": True,
        },
    )

    assert actualizado.status_code == 200
    assert actualizado.json()["concept"] == "Gasto actualizado"
    assert float(actualizado.json()["amount"]) == 250.00

    eliminado = client.delete(f"/api/gastos/{id_gasto}")
    assert eliminado.status_code in (200, 204)

    listado = client.get("/api/gastos")
    assert listado.status_code == 200
    assert listado.json() == []