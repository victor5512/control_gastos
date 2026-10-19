
import os

import pytest
from dotenv import load_dotenv
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base, get_db
from app import models  # Registra los modelos en Base.metadata
from app.main import app


load_dotenv()

TEST_DATABASE_URL = os.getenv("DATABASE_URL_TEST")

if not TEST_DATABASE_URL:
    raise RuntimeError(
        "Configura DATABASE_URL_TEST en el archivo .env"
    )

if "control_gastos_test" not in TEST_DATABASE_URL:
    raise RuntimeError(
        "Las pruebas solo pueden usar control_gastos_test"
    )

test_engine = create_engine(TEST_DATABASE_URL)

TestingSessionLocal = sessionmaker(
    bind=test_engine,
    autoflush=False,
    autocommit=False,
)


@pytest.fixture
def client():
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=test_engine)
