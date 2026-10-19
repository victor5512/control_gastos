Sistema de Control de Gastos
Aplicación web Full Stack para la gestión, control y clasificación de gastos personales con cálculo automático de deducibilidad de ISR.


🛠️ Tecnologías Utilizadas
- **Backend:** FastAPI (Python 3.10+), SQLAlchemy 2.0, PostgreSQL, Pytest.
- **Frontend:** React, Vite, Tailwind CSS, Lucide React,Axios.
- **Control de Versiones:** Git & GitHub.
🚀 Requisitos Previos
- Python 3.10 o superior
- Node.js 18.x o superior y npm
- Base de datos PostgreSQL activa
-Git


⚙️ Configuración e Instalación
1. Clonar el repositorio
git clone URL_DEL_REPOSITORIO
cd NOMBRE_DEL_REPOSITORIO

2. Configurar el backend
#Desde la carpeta raíz del proyecto:
cd backend
python -m venv .venv
# En Windows (PowerShell):
.\.venv\Scripts\Activate.ps1
#Instalar las dependencias:
pip install -r requirements.txt
#Crear el archivo de variables de entorno a partir del ejemplo:
cp .env.example .env
#Configura en backend/.env las variables necesarias para la conexión a PostgreSQL y el funcionamiento del backend.
#Asegúrate de que la base de datos exista y de que la configuración coincida con la utilizada por la aplicación.
#Iniciar el servidor:
uvicorn app.main:app --reload
#La documentación interactiva de FastAPI estará disponible normalmente en:
http://127.0.0.1:8000/docs

3. Configurar el frontend
#terminal
cd frontend
npm install
#Si el frontend utiliza un archivo .env.example, crea el archivo local:
cp .env.example .env
#Configura las variables necesarias para que el frontend se comunique con el backend.
#Inicia la aplicación:
npm run dev
#vite muestra la direccion local para abrir la aplicacion en el navegador:
http://localhost:5173

4. Ejecución de pruebas
#Para ejecutar las pruebas automatizadas del backend, entra en la carpeta backend y activa el entorno virtual.
pytest
#Para ejecutar las pruebas con un resumen detallado:
pytest -v