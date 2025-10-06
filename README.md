# Fullstack Express + React App 🚀

Proyecto **Fullstack** con **Backend en Express**, **Frontend en React** y **MongoDB** como base de datos.  
Está dockerizado para correr tanto en **desarrollo** como en **producción**, y tiene CI/CD con GitHub Actions (en construcción).

---

## 📦 Tecnologías principales

- **Backend**: Node.js + Express
- **Frontend**: React + Vite
- **Base de datos**: MongoDB
- **Autenticación**: JWT (access/refresh tokens)
- **Emails**: Resend (Welcome + Purchase)
- **Tests**: Jest + Supertest
- **Swagger**: Documentación de la API en `/api/docs`
- **Docker**: Contenedores para backend, frontend y base de datos

---

## 🛠️ Variables de entorno

El backend requiere un archivo `.env` en `./backend/.env` con al menos:

```ini
# Server
PORT=8080
MONGO_URL=mongodb://mongo:27017/fullstackdb
JWT_SECRET=Secu2015$

# Admin user
EMAIL_ADMIN=ignaalcaniz@gmail.com
PASS_ADMIN=1245

# Resend
RESEND_API_KEY=tu_api_key_de_resend
EMAIL_FROM=Mi App <onboarding@resend.dev>

# Frontend
FRONTEND_URL=http://localhost:3000

# Tokens
ACCESS_TOKEN_EXPIRES=15m
REFRESH_TOKEN_EXPIRES=7d
⚠️ En producción, MONGO_URL debe usar mongo (nombre del contenedor) en lugar de localhost.

🚀 Desarrollo con Docker
Levantar stack en modo desarrollo (con hot reload en backend y frontend):

bash
Copiar código
docker compose -f docker-compose.yml up -d --build
Parar todo:

bash
Copiar código
docker compose -f docker-compose.yml down -v
Ver logs de un servicio:

bash
Copiar código
docker logs -f backend
docker logs -f frontend
docker logs -f mongo
Entrar en un contenedor:

bash
Copiar código
docker exec -it backend sh
🌐 Producción con Docker
Levantar stack en modo producción (imágenes preconstruidas):

bash
Copiar código
docker compose -f docker-compose.prod.yml up -d --build
Parar todo:

bash
Copiar código
docker compose -f docker-compose.prod.yml down -v
📖 Swagger (API Docs)
Una vez levantado el backend:

Desarrollo → http://localhost:8080/api/docs

Producción → http://localhost:8080/api/docs

📧 Emails
La app envía correos de bienvenida y compra usando Resend.
No es necesario levantar nada extra en Docker: los correos se envían directamente con la API de Resend.

🧪 Tests
Ejecutar tests locales:

bash
Copiar código
cd backend
npm test
Ejecutar tests en modo CI (con coverage):

bash
Copiar código
npm run test:ci
🐳 Comandos Docker útiles
Ver contenedores activos:

bash
Copiar código
docker ps
Ver imágenes:

bash
Copiar código
docker images
Reconstruir solo backend:

bash
Copiar código
docker compose build backend
Reconstruir solo frontend:

bash
Copiar código
docker compose build frontend
