-- tabla para usuarios
create table users(
    id_user BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name varchar(100) NOT NULL,
    email varchar(255)NOT NULL,
    password_hash varchar(255) NOT NULL,
    created TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

--Evita los correos duplicados 
CREATE UNIQUE INDEX uq_email
ON users (LOWER(email));

--tabla para gastos 
CREATE table bills(
    id_bill BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    --llave foranea de tabla usuarios y eliminar ek registro en cascada (sobre el id eliminado) para no tener datos obsoletos
    user_id BIGINT NOT NULL
    REFERENCES users(id_user)ON DELETE CASCADE,

    dates DATE NOT NULL,
    concept varchar(120) NOT NULL,
    category varchar(20) NOT NULL,
    amount numeric(10,2) NOT NULL,
    payment_method varchar(20) NOT NULL,
    invoice boolean NOT NULL DEFAULT FALSE,
    created TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Restricciones para concepto,categoria, monto,pagos,
    
    -- limpiar concept y caracteres de 3 a 120
    CONSTRAINT chk_concept CHECK(CHAR_LENGTH(TRIM(concept))BETWEEN 3 AND 120),
    --categorias en solo las 5 categorias especificadas
    CONSTRAINT chk_category CHECK(category IN ('Papelería', 'Transporte', 'Alimentos','Servicios', 'Otros')),
    --monto mayor a 0 
    CONSTRAINT chk_amount CHECK(amount >0),
    --metodos de pagos
    CONSTRAINT chk_payment_method CHECK (payment_method IN ('Efectivo', 'Transferencia', 'Tarjeta'))
    );

--INDEX para optimizar los registros y tener los nuevos registros de los usuarios de la tabla users (id_user)
CREATE INDEX id_gastos_usuario_fecha
ON bills (user_id, dates DESC);



--tabla de sesiones el cual creay  elimina la sesion para mas seguridad con vencimiento de los token
CREATE TABLE sessiones(
    id_session BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    -- id usuario llave foranea tabla de users
    user_id BIGINT NOT NULL REFERENCES users(id_user)ON DELETE CASCADE,
    token_hash CHAR(64) NOT NULL UNIQUE,
    created  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expired TIMESTAMPTZ NOT NULL, 
    
    -- restriccion para los tokens 
      CONSTRAINT chk_session_expiracion
        CHECK (expired > created)
);

-- INDEX para los usarios con sesiones mas recientes
CREATE INDEX idx_sesiones_usuario
ON sessiones (user_id);