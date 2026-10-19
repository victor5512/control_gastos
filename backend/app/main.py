
from fastapi import Depends, FastAPI, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.database import get_db
from app.routers.auth import router as auth_router
from app.routers.bills import router as bill_router
# CORSmiddleware
from fastapi.middleware.cors import CORSMiddleware



#apis
app = FastAPI(
    title="APIs de Control de Gastos",
    version="1.0.0",
)
app.include_router(auth_router)
app.include_router(bill_router)  

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],#puerto react
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/")
def inicio():
    return {
        "mensaje": "API de Control de Gastos funcionando"
    }

#comprobar base de datos
@app.get("/api/health/db")
def comprobar_base_de_datos(
    db: Session = Depends(get_db),
):
    try:
        db.execute(text("SELECT 1"))
        return {"database": "connected"}
    except Exception:
        raise HTTPException(
            status_code=503,
            detail="La base de datos no está disponible.",
        )

