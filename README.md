Fullstack Express App
🚀 Descripción general

Este proyecto es una aplicación fullstack modular desarrollada en Node.js + Express, con arquitectura en capas, integración de MongoDB, sistema de autenticación JWT, envío de correos mediante Resend, y pipeline de CI/CD automatizado en GitHub Actions.

La app está diseñada para ser mantenible, escalable y fácilmente desplegable mediante Docker.
Incluye pruebas automáticas con Jest y un entorno de base de datos en memoria para CI/CD.

🧩 Tecnologías utilizadas
🔹 Backend

Node.js (v20+)

Express.js

Mongoose (ODM para MongoDB)

connect-mongo y express-session

Passport.js con estrategia JWT

Swagger UI (documentación de API)

Socket.io (para tiempo real)

Resend API (envío de emails transaccionales)

dotenv (manejo de variables de entorno)

cross-env (entornos multiplataforma)

jest + supertest + mongodb-memory-server (testing)

logger middleware personalizado (logs en consola y formato JSON)

🔹 DevOps / Infraestructura

Docker y Docker Compose (backend, frontend y MongoDB)

GitHub Actions (pipeline CI/CD completo)

MongoMemoryServer para tests aislados

ESM modules + imports limpios

Git Flow + Commits semánticos

🔹 Frontend

React (estructura preparada)

Comunicación por API REST con el backend (FRONTEND_URL)

🧱 Estructura del proyecto
fullstack-express-app/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── daos/
│   │   ├── db/
│   │   ├── dto/
│   │   ├── Middlewares/
│   │   ├── model/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── app.js
│   │   └── server.js
│   ├── tests/
│   │   ├── setup.js
│   │   ├── users.test.js
│   │   ├── products.test.js
│   │   ├── carts.test.js
│   │   └── ...
│   ├── package.json
│   ├── .env
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   ├── package.json
│   └── Dockerfile
│
├── docker-compose.yml
└── .github/workflows/ci-cd.yml

⚙️ Configuración de entorno (.env)

Ejemplo de archivo .env (no incluir datos sensibles en repositorios públicos):

# Server
PORT=8080
MONGO_URL=mongodb://mongo:27017/fullstackdb
JWT_SECRET=Secu2015$

# Admin
EMAIL_ADMIN=ignaalcaniz@gmail.com
PASS_ADMIN=1245

# Resend (correo transaccional)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=Mi App <onboarding@resend.dev>

# Frontend
FRONTEND_URL=http://localhost:3000

# Tokens
ACCESS_TOKEN_EXPIRES=15m
REFRESH_TOKEN_EXPIRES=7d


📌 Importante:

En local, podés usar mongodb://127.0.0.1:27017/fullstackdb si no usás Docker.

En CI/CD, Mongo se reemplaza por una base en memoria (no se usa este valor).

🧠 Scripts disponibles
📍 Entorno de desarrollo
cd backend
npm install
npm run dev


Esto levanta el servidor Express en modo desarrollo y se conecta a MongoDB local o del contenedor.

🧪 Testing local
npm run test


Ejecuta los tests con Jest y base de datos real.
Para CI/CD o tests aislados:

npm run test:ci


Esto fuerza USE_MEMORY_DB=true, ejecutando en una base Mongo en memoria.

🐳 Entorno Docker (producción local)
1️⃣ Construir e iniciar servicios
docker compose up --build


Esto levanta:

MongoDB

Backend (ignacioalcaniz/fullstack-backend)

Frontend (ignacioalcaniz/fullstack-frontend)

2️⃣ Detener y limpiar
docker compose down -v

🔄 CI/CD en GitHub Actions

El workflow se ejecuta automáticamente al hacer push a main.

Pasos:

Instala dependencias (npm ci)

Ejecuta tests (npm run test:ci)

Si pasa todo ✅ → construye y publica las imágenes Docker:

ignacioalcaniz/fullstack-backend:latest

ignacioalcaniz/fullstack-frontend:latest

Archivo clave: .github/workflows/ci-cd.yml

📊 Endpoints principales
Método	Ruta	Descripción
GET	/	Verifica que la API esté activa
GET	/api/docs	Documentación Swagger
POST	/users/register	Registro de usuario
POST	/users/login	Login con JWT
GET	/products	Listado de productos
POST	/carts/:cid/products/:pid	Agrega producto al carrito
POST	/email/welcome	Envío de correo de bienvenida
POST	/ticket	Generar ticket de compra
📫 Email Transaccional (Resend API)

El módulo email.services.js implementa un mock automático en modo test (NODE_ENV=test), evitando llamadas reales a la API Resend durante CI/CD.

Producción → usa la clave RESEND_API_KEY real.
Testing → muestra "🧪 Mock de Resend activo (modo test)".

🧠 Arquitectura general

app.js → inicializa middlewares, rutas, sesiones y Passport.

server.js → levanta el servidor HTTP y Socket.io.

db/db.conection.js → conexión a MongoDB.

tests/setup.js → conexión a MongoMemoryServer para pruebas CI/CD.

controllers / services / daos → capas limpias y separadas.

Middlewares → validación, logs y manejo de errores centralizado.

🔒 Seguridad básica aplicada (hasta ahora)

✅ Variables de entorno con dotenv
✅ Secretos en GitHub (secrets.JWT_SECRET, secrets.DOCKER_HUB_TOKEN)
✅ JWT para autenticación
✅ Sanitización de inputs y validación de esquemas
✅ Mock seguro en entorno de test
✅ Aislamiento de servicios con Docker
✅ Evita exponer claves API reales en el código

🧱 En la siguiente fase aplicaremos Ciberseguridad avanzada:

Rate limiting y brute-force protection

Helmet y CSP

Hashing avanzado de contraseñas

Escaneo de vulnerabilidades (npm audit + GitHub dependabot)

Pruebas de seguridad (ZAP, OWASP)

🧩 Dev y Prod en resumen
Entorno	MongoDB	Sesiones	Tests	Emails	Despliegue
Dev local	localhost	MongoStore	reales	reales	manual (npm run dev)
CI/CD	In-memory	memoria	simulados	mock	GitHub Actions
Prod (Docker)	mongo container	MongoStore	desactivados	reales	Docker Hub + Compose

👨‍💻 Autor:
Ignacio Alcañiz
Proyecto Fullstack Express.js — 2025
Automatización CI/CD, Docker, MongoDB y Resend

📬 Contacto: ignaalcaniz@gmail.com

🐙 GitHub: @ignacioalcaniz
