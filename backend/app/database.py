#configuracion para la base de datos
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError(
        "Falta configurar la variable DATABASE_URL."
    )
#configura la conexion a la BD
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
)
#sesion local de BD
SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
)

#Base la clase que heredan nuestros modelos 
class Base(DeclarativeBase):
    pass

#sesion para las peticiones de BD administra las operaciones
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
