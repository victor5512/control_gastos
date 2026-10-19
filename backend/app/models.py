#Representaciones de las tablas de la base de datos 
#librerias 
from datetime import date, datetime
from decimal import Decimal
from sqlalchemy import (
    BigInteger,
    Boolean,
    CHAR,
    Date,
    DateTime,
    ForeignKey,
    Numeric,
    String,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base
from app.business_rules import es_deducible
#clase usuario con herdacion Base
class Usuario(Base):
    __tablename__="users"
    id_user: Mapped[int] = mapped_column(
        BigInteger, primary_key=True
    )
    name: Mapped[str] = mapped_column(
        String(100), nullable=False
    )
    email: Mapped[str] = mapped_column(
        String(255), nullable=False
    )
    password_hash: Mapped[str] = mapped_column(
        String(255), nullable=False
    )
    created: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    #listas para Gastos y Sesiones
    bills:Mapped[list["Gasto"]]=relationship(back_populates="user",cascade="all,delete-orphan",)
    sessiones: Mapped[list["Sesiones"]] = relationship(back_populates="user",cascade="all, delete-orphan",)

class Gasto(Base):
    __tablename__="bills"
    id_bill:Mapped[int]=mapped_column(BigInteger,primary_key=True)
    user_id:Mapped[int]=mapped_column(BigInteger,ForeignKey("users.id_user",ondelete="CASCADE"))
    dates:Mapped[date]=mapped_column(Date,nullable=False)
    concept:Mapped [str]=mapped_column(String(120),nullable=False) 
    category:Mapped[str]=mapped_column(String(20),nullable=False)
    amount:Mapped[Decimal]=mapped_column(Numeric(10,2),nullable=False)
    payment_method:Mapped[str]=mapped_column(String(20),nullable=False)
    invoice:Mapped[bool]=mapped_column(Boolean,nullable=False, default=False)
    created: Mapped[datetime] = mapped_column(
            DateTime(timezone=True),
            nullable=False,
            server_default=func.now(),
        )
  
    #Buscar gastos por usuario id
    user: Mapped["Usuario"] = relationship(
        back_populates="bills"
    )
    # Propiedad calculada
    @property
    def deducible(self) -> bool:
        return es_deducible(self)


class Sesiones(Base):
    __tablename__="sessiones"
    id_session: Mapped[int] = mapped_column(
        BigInteger, primary_key=True
    )
    user_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("users.id_user", ondelete="CASCADE"),
        nullable=False,
    )
    token_hash: Mapped[str] = mapped_column(
        CHAR(64), nullable=False, unique=True
    )
    created: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    expired: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )

    user: Mapped["Usuario"] = relationship(
        back_populates="sessiones"
    )

