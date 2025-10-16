🧩 Fullstack Express App
🚀 Descripción general

Este proyecto es una aplicación Fullstack modular desarrollada en Node.js + Express, con arquitectura en capas, integración con MongoDB, autenticación JWT, envío de correos con Resend, y un pipeline de CI/CD automatizado en GitHub Actions.

Está diseñada para ser mantenible, escalable y fácilmente desplegable mediante Docker.
Incluye pruebas automáticas con Jest y base de datos en memoria para CI/CD.

🧠 Tecnologías utilizadas
🔹 Backend

Node.js (v20+)

Express.js

Mongoose (ODM para MongoDB)

connect-mongo + express-session

Passport.js (estrategia JWT)

Swagger UI (documentación interactiva)

Socket.io (tiempo real)

Resend API (emails transaccionales)

dotenv (variables de entorno)

cross-env (entornos multiplataforma)

Jest + Supertest + MongoMemoryServer (testing)

Logger middleware personalizado (JSON + consola)

🔹 DevOps / Infraestructura

Docker y Docker Compose (backend, frontend, MongoDB)

GitHub Actions (pipeline CI/CD)

MongoMemoryServer (tests aislados)

ESM Modules + imports limpios

Git Flow + Commits semánticos

🔹 Frontend

React (estructura preparada)

Comunicación por API REST (FRONTEND_URL)

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
│   ├── package.json
│   ├── .env
│   └── Dockerfile.dev / Dockerfile
│
├── frontend/
│   ├── src/
│   ├── package.json
│   └── Dockerfile.dev / Dockerfile
│
├── docker-compose.yml                # Base (Mongo)
├── docker-compose.override.yml       # Desarrollo local
├── docker-compose-prod.yml           # Producción
└── .github/workflows/ci-cd.yml

⚙️ Configuración de entorno (.env)

Ejemplo de .env (⚠️ nunca subir datos sensibles públicos):

# 🌍 Server
PORT=8080
DOCKER_ENV=false

# 🧩 Base de datos
MONGO_URL_LOCAL=mongodb://127.0.0.1:27017/fullstackdb
MONGO_URL=mongodb://mongo:27017/fullstackdb

JWT_SECRET=Secu2015$

# 👤 Admin
EMAIL_ADMIN=ignaalcaniz@gmail.com
PASS_ADMIN=1245

# 📬 Resend
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=Mi App <onboarding@resend.dev>

# 🌐 Frontend
FRONTEND_URL=http://localhost:3000

# 🔐 Tokens
ACCESS_TOKEN_EXPIRES=15m
REFRESH_TOKEN_EXPIRES=7d


📌 Notas

En local: usá mongodb://127.0.0.1:27017/fullstackdb.

En Docker: se usa mongodb://mongo:27017/fullstackdb.

En CI/CD: usa base en memoria, sin Mongo real.

🧠 Scripts disponibles
📍 Entorno de desarrollo (sin Docker)
cd backend
npm install
npm run dev


Levanta Express con recarga automática (nodemon) y MongoDB local.

🧪 Testing
npm run test


Ejecuta tests con base real.
Para entorno CI/CD o pruebas aisladas:

npm run test:ci


Esto activa USE_MEMORY_DB=true y corre sobre MongoDB en memoria.

🐳 Entornos Docker
🧩 1️⃣ Base común (docker-compose.yml)

Solo define el servicio MongoDB compartido por todos los entornos.
No se ejecuta solo.

⚙️ 2️⃣ Desarrollo local (docker-compose.override.yml)

👉 Ideal cuando querés probar backend y frontend juntos en Docker, pero seguir editando el código localmente.

docker compose up --build


Esto levanta:

MongoDB (mongo:6)

Backend (Dockerfile.dev con nodemon)

Frontend (Dockerfile.dev)

Se montan los volúmenes locales (./backend:/app) para autorecarga.
Docker inyecta automáticamente DOCKER_ENV=true en el backend.

📤 Para detener:

docker compose down -v

🚀 3️⃣ Producción (docker-compose-prod.yml)

Usa imágenes ya publicadas en Docker Hub y sin volúmenes locales.

docker compose -f docker-compose.prod.yml up -d


Esto levanta:

ignacioalcaniz/fullstack-backend:latest

ignacioalcaniz/fullstack-frontend:latest

mongo:6 (con volumen persistente)

📤 Para detener:

docker compose -f docker-compose-prod.yml down -v

🧭 Resumen de entornos Docker
Entorno	Archivo	Comando	Uso	Características
Local dev	docker-compose.override.yml	docker compose up --build	Desarrollo con recarga automática	Monta código + DOCKER_ENV=true
Producción	docker-compose-prod.yml	docker compose -f docker-compose-prod.yml up -d	Despliegue final	Usa imágenes buildadas
Base común	docker-compose.yml	(se combina con override)	Soporte de Mongo	Define volúmenes y contenedor Mongo
🔄 CI/CD en GitHub Actions

Workflow automático en .github/workflows/ci-cd.yml:

Instala dependencias (npm ci)

Ejecuta tests (npm run test:ci)

Si pasa todo ✅:

Construye imágenes Docker

Publica en Docker Hub:

ignacioalcaniz/fullstack-backend:latest

ignacioalcaniz/fullstack-frontend:latest

Resumen de los entornos = 3 entornos bien separados =
Entorno	||	Base de datos que usa	|| Variables clave  ||	Cómo se ejecuta

🧑‍💻 Desarrollo local:	Cuando programás y probás cosas en tu PC	|| Mongo local (127.0.0.1)	|| DOCKER_ENV=false, USE_MEMORY_DB=false ||	npm run dev

🧪 CI/CD (Testing automático):	GitHub Actions ejecuta los tests ||	Mongo en memoria (RAM) || 	USE_MEMORY_DB=true, NODE_ENV=test ||	npm run test:ci

🚀 Producción / Docker Compose:	Cuando levantás la app completa con Mongo + backend + frontend	Mongo en contenedor (mongo:27017)  ||DOCKER_ENV=true ||	docker compose up --build



📊 Endpoints principales
Método	Ruta	Descripción
GET	/	Verifica API activa
GET	/api/docs	Swagger Docs
POST	/users/register	Registro de usuario
POST	/users/login	Login JWT
GET	/products	Listado de productos
POST	/carts/:cid/products/:pid	Agrega producto
POST	/email/welcome	Envío de correo
POST	/ticket	Generar ticket de compra
📬 Email Transaccional (Resend API)

En modo test (NODE_ENV=test), el servicio usa mock seguro:

🧪 “Mock de Resend activo (modo test)”

En producción → usa la clave real RESEND_API_KEY.

🧠 Arquitectura general

app.js → inicializa middlewares, rutas, sesiones y Passport

server.js → levanta servidor HTTP y Socket.io

db/db.conection.js → conexión MongoDB

tests/setup.js → usa MongoMemoryServer

controllers / services / daos → capas limpias

Middlewares → validación, logs, errores

🔒 Seguridad aplicada (hasta ahora)

✅ Variables de entorno con dotenv
✅ JWT para autenticación
✅ Sanitización y validación de inputs
✅ Mock seguro de Resend
✅ Docker aislando servicios
✅ Secretos en GitHub (JWT, DockerHub)
✅ Tests en entorno aislado

🧱 Próxima fase (Ciberseguridad avanzada):

Rate limiting / brute-force protection

Helmet + Content Security Policy

Hashing avanzado (bcrypt)

Escaneo de vulnerabilidades (npm audit / Dependabot)

Pruebas OWASP / ZAP

Cache y balanceador de carga (para escalabilidad)

👨‍💻 Autor

Ignacio Alcañiz
Proyecto Fullstack Express.js — 2025
Automatización CI/CD • Docker • MongoDB • Resend

📬 ignaalcaniz@gmail.com

🐙 GitHub: @ignacioalcaniz

