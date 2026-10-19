# Sistema de Control de Gastos

Aplicación web Full Stack para la gestión, el control y la clasificación de gastos personales, con cálculo automático de deducibilidad de ISR.

## 🛠️ Tecnologías utilizadas

- **Backend:** FastAPI, Python 3.10+, SQLAlchemy 2.0, PostgreSQL y Pytest.
- **Frontend:** React, Vite, Tailwind CSS, Lucide React y Axios.
- **Control de versiones:** Git y GitHub.
- **Documentación de API:** Swagger UI mediante FastAPI.

## 🚀 Requisitos previos

- Python 3.10 o superior.
- Node.js 18 o superior y npm.
- Base de datos PostgreSQL activa.
- Git.

## ⚙️ Configuración e instalación

### 1. Clonar el repositorio

```bash
git clone URL_DEL_REPOSITORIO
cd NOMBRE_DEL_REPOSITORIO
```

### 2. Configurar el backend

Desde la carpeta raíz del proyecto:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

Configura las variables de entorno necesarias para la conexión a PostgreSQL y asegúrate de que la base de datos exista.

Inicia el servidor:

```bash
uvicorn app.main:app --reload
```

La documentación interactiva de la API estará disponible normalmente en:

http://127.0.0.1:8000/docs

### 3. Configurar el frontend

Abre una segunda terminal desde la carpeta raíz del proyecto:

```powershell
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```

Configura las variables necesarias para la comunicación con el backend.

Vite mostrará la dirección local de la aplicación, normalmente:

http://localhost:5173

### 4. Ejecución de pruebas

Desde la carpeta `backend`, con el entorno virtual activado:

```bash
pytest
```

Para ver el detalle de las pruebas ejecutadas:

```bash
pytest -v
```
