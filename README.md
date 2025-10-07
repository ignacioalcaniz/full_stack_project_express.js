# 🧩 Full Stack Express + React App

## 📦 1. Estructura del proyecto

fullstack-express-app/
├── backend/
│ ├── src/
│ ├── tests/
│ ├── Dockerfile
│ ├── Dockerfile.dev
│ ├── package.json
│ └── .env
├── frontend/
│ ├── src/
│ ├── Dockerfile
│ ├── Dockerfile.dev
│ └── package.json
├── docker-compose.yml
├── docker-compose.prod.yml
└── .github/workflows/ci-cd.yml

yaml
Copiar código

---

## ⚙️ 2. Comandos principales

### 🧠 Desarrollo local
```bash
# Levantar backend con nodemon
cd backend
npm run dev

# Levantar frontend (React)
cd frontend
npm start
🐳 Docker (entorno de producción)
bash
Copiar código
# Crear y levantar contenedores
docker compose -f docker-compose.prod.yml up -d --build

# Ver logs
docker compose logs -f backend
docker compose logs -f frontend

# Apagar y limpiar todo
docker compose -f docker-compose.prod.yml down -v
🧪 Testing
bash
Copiar código
# Tests locales con Jest
cd backend
npm run test

# Tests CI/CD (con Mongo en memoria)
npm run test:ci
📧 Emails automáticos
Usa Resend API con RESEND_API_KEY desde el .env.

Templates React están en src/emails/entries/

welcome.entry.js → email de bienvenida

purchase.entry.js → confirmación de compra

Render local manual:

bash
Copiar código
npm run build:emails
npm run render:emails
📚 Swagger Docs
Accedé en tu navegador a:

bash
Copiar código
http://localhost:8080/api/docs
🧱 CI/CD con GitHub Actions
El flujo:

Corre tests (npm run test:ci)

Si pasan → construye imágenes Docker

Publica a Docker Hub:

fullstack-backend:latest

fullstack-frontend:latest

Configuración:

Secrets:

DOCKER_HUB_USERNAME

DOCKER_HUB_TOKEN


🚀 Deploy
Una vez que CI/CD suba las imágenes:

bash
Copiar código
docker pull ignacioalcaniz/fullstack-backend:latest
docker pull ignacioalcaniz/fullstack-frontend:latest

docker compose -f docker-compose.prod.yml up -d
