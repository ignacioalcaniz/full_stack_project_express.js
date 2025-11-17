# 🧩 Fullstack Express App — CI/CD + Ciberseguridad Profesional  
### Desarrollado por **Ignacio Alcañiz — 2025**

---

## 🚀 Descripción general / Overview

🇪🇸  
Aplicación Fullstack con **Node.js + Express + MongoDB**, arquitectura modular y **ciberseguridad a nivel empresarial**.  
Integra **Docker**, **CI/CD**, **DevSecOps** con escaneo OWASP ZAP, autenticación JWT con rotación segura, cookies httpOnly, rate limiting y auditorías automáticas.

🇬🇧  
Fullstack app built with **Node.js + Express + MongoDB**, modular architecture and **enterprise-grade security**.  
Includes **Docker**, **CI/CD**, **DevSecOps** with OWASP ZAP scans, secure JWT rotation, httpOnly cookies, rate limiting and automatic auditing.

---

## 🧠 Tecnologías / Technologies

| Categoría / Category | Tecnologías / Technologies |
|---|---|
| **Backend** | Node.js, Express, Mongoose, Passport JWT, Joi, Socket.io |
| **Security** | Helmet, HPP, CSP, xss-clean, express-mongo-sanitize, csurf, express-rate-limit, express-slow-down, bcrypt (+ pepper), JWT rotation |
| **Email** | Resend, React Email |
| **Testing** | Jest, Supertest, MongoMemoryServer |
| **Docs** | Swagger (swagger-jsdoc + swagger-ui-express) |
| **DevOps** | Docker, GitHub Actions, Dependabot, CodeQL, OWASP ZAP, Copilot Review |

---

## 🧱 Estructura / Project Structure

fullstack-express-app/
│
├── backend/
│ ├── src/
│ │ ├── config/
│ │ ├── controllers/
│ │ ├── db/
│ │ ├── Middlewares/
│ │ ├── model/
│ │ ├── routes/
│ │ ├── services/
│ │ ├── utils/
│ │ └── server.js
│ ├── tests/
│ ├── package.json
│ ├── .env / .env.test
│ └── Dockerfile
│
├── frontend/
│ ├── src/
│ ├── package.json
│ └── Dockerfile
│
└── .github/workflows/
├── ci-cd.yml
└── zap-fullscan.yml

markdown
Copiar código

---

## ⚙️ Entornos / Environments

| Entorno | DB | Variables clave | Ejecución |
|---|---|---|---|
| Desarrollo | Mongo local (`127.0.0.1`) | `DOCKER_ENV=false` | `npm run dev` |
| CI/CD (tests) | Mongo en memoria (RAM) | `USE_MEMORY_DB=true` | `npm run test:ci` |
| Producción | Mongo en contenedor | `DOCKER_ENV=true` | `docker compose up --build` |

---

## 🧩 CI/CD — Integración y Despliegue / Continuous Integration & Deployment

🇪🇸  
Cada push/PR a `main` ejecuta:
- ✅ Tests (Jest + Supertest)  
- 🧱 Build Docker (backend y frontend)  
- 🧪 Auditoría de dependencias (Dependabot + `npm audit`)  
- 🛡️ Escaneo OWASP ZAP  
- 🤖 Revisión AI (Copilot)  
- 📦 Push de imágenes a Docker Hub

🇬🇧  
Every push/PR to `main` runs:
- ✅ Tests (Jest + Supertest)  
- 🧱 Docker build (backend & frontend)  
- 🧪 Dependency audit (Dependabot + `npm audit`)  
- 🛡️ OWASP ZAP scan  
- 🤖 AI review (Copilot)  
- 📦 Push images to Docker Hub

---

## 🛡️ Ciberseguridad por capas / Layered Security Model

| Capa / Layer | Mecanismos | Riesgos mitigados | Nivel comparativo |
|---|---|---|---|
| **Transporte** | HTTPS opcional + HSTS, cookies `secure` | MITM, sniffing, downgrade | AWS / Mercado Pago |
| **CORS/CSP** | CORS estricto por `FRONTEND_URL`, CSP reforzada | CSRF, XSS de recursos externos | Mercado Libre Frontend |
| **Middleware** | Helmet, HPP, xss-clean, mongoSanitize | XSS, NoSQLi, Parameter Pollution | Netflix Node Services |
| **Rate/Abuso** | `express-rate-limit`, `express-slow-down`, limiters por endpoint | Brute force, DoS, scraping | Cloudflare / GitHub API |
| **Auth/Sesión** | JWT access + refresh httpOnly, rotación y revocación, SameSite | Hijack, replay, fixation | Auth0 / Cognito |
| **Contraseñas** | `bcrypt` (12-14) + pepper, política fuerte | Credential stuffing, fuerza bruta | OWASP ASVS |
| **Validación** | `Joi` en body/query/params + sanitización | Inyección, data tampering | OWASP Top 10 |
| **CSRF** | `csurf` (prod) + SameSite | CSRF clásico | Banking-grade |
| **Auditoría** | Winston + mascara de secretos, IP/UA, tiempos | Forensics, fraude, cumplimiento | Meli SRE |
| **CI/CD Security** | `npm audit`, Dependabot, CodeQL, ZAP | Supply chain, libs vulnerables | GitHub Advanced Security |

---

## 🔐 Funciones clave / Key Security Features

- 🔒 **JWT + Refresh httpOnly** con **rotación y revocación** (cookie `SameSite`, `secure` en prod).  
- 🧱 **Helmet + CSP** endureciendo cabeceras HTTP.  
- 🚦 **Rate limiters** globales y específicos (login/registro).  
- 🐢 **Slow-down** dinámico para abuso leve.  
- 🧼 **Sanitización** (mongoSanitize + xss-clean) y **validación con Joi**.  
- 🧩 **CSRF** en producción.  
- 🔑 **Bcrypt + pepper** y política de contraseñas robusta.  
- 🧾 **Auditoría estructurada** con Winston y redacción de secretos.  
- 🛠 **OWASP ZAP** integrado en pipeline + **CodeQL** + **Dependabot**.

---

## 🧪 Testing Automático / Automated Testing

- Base de datos en memoria (MongoMemoryServer)  
- Tests de endpoints (Supertest) y servicios  
- Jobs de CI ejecutan `npm run test:ci` con cobertura

---

## 🔍 OWASP ZAP (CI)

1. Se levantan backend + Mongo en contenedores  
2. Se espera `/health`  
3. ZAP Full Scan contra la URL del backend  
4. Se publican artefactos (HTML, JSON, MD)

> Si tu workflow de ZAP falla, primero confirmá que `/health` responde dentro del tiempo de espera y que la app **no** requiere autenticación para poder recorrer rutas públicas.

---

## ▶️ Scripts útiles

```bash
# Dev
npm run dev

# Tests locales
npm run test

# Tests CI (usa memoria y flags de cobertura)
npm run test:ci

# Build en producción
npm run start
👨‍💻 Autor / Author
Ignacio Alcañiz
Fullstack Developer — DevSecOps | CI/CD | Docker | MongoDB | React | AWS (en progreso)

📬 ignaalcaniz@gmail.com
🐙 GitHub: @ignacioalcaniz
