# 🧩 Fullstack Express App — CI/CD + Ciberseguridad Profesional  
### Desarrollado por **Ignacio Alcañiz — 2025**
<!-- 🧩 STATUS BADGES -->
<p align="center">

  <!-- 🔍 ZAP dinámico (estado real del workflow) -->
  <img src="https://img.shields.io/github/actions/workflow/status/ignacioalcaniz/fullstack-express-app/zap-fullscan.yml?label=OWASP%20ZAP%20Scan&logo=owasp&style=for-the-badge" />

  <!-- 🧪 ZAP estático (Full Scan CI integrado) -->
  <img src="https://img.shields.io/badge/ZAP-Full%20Scan%20CI-brightgreen?logo=owasp&style=for-the-badge" />

  <!-- 🔄 CI/CD -->
  <img src="https://img.shields.io/github/actions/workflow/status/ignacioalcaniz/fullstack-express-app/ci-cd.yml?label=CI%2FCD&style=for-the-badge" />

  <!-- 🐳 Docker -->
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&style=for-the-badge" />

  <!-- 🛡️ DevSecOps -->
  <img src="https://img.shields.io/badge/Security-DevSecOps-blue?style=for-the-badge&logo=shield" />

</p>


---

## 🚀 Descripción general / Overview

🇪🇸  
Aplicación Fullstack con **Node.js + Express + MongoDB**, arquitectura modular y **ciberseguridad a nivel empresarial**.  
Integra **Docker**, **CI/CD**, **DevSecOps** con escaneo OWASP ZAP, autenticación JWT con rotación segura, cookies httpOnly, rate limiting y auditorías automáticas.

🇬🇧  
Fullstack app built with **Node.js + Express + MongoDB**, modular architecture and **enterprise-grade security**.  
Includes **Docker**, **CI/CD**, **DevSecOps** with OWASP ZAP scanning, secure JWT rotation, httpOnly cookies, rate limiting and automated auditing.

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

yaml
Copiar código

---

## ⚙️ Entornos / Environments

| Entorno | DB | Variables clave | Ejecución |
|---|---|---|---|
| Desarrollo | Mongo local (`127.0.0.1`) | `DOCKER_ENV=false` | `npm run dev` |
| CI/CD (tests) | Mongo en memoria | `USE_MEMORY_DB=true` | `npm run test:ci` |
| Producción | Mongo en contenedor | `DOCKER_ENV=true` | `docker compose up --build` |

---

## 🧩 CI/CD — Integración y Despliegue / Continuous Integration & Deployment

🇪🇸  
Cada push/PR a `main` ejecuta:
- ✅ Tests (Jest + Supertest)  
- 🧱 Build Docker (backend + frontend)  
- 🧪 Auditoría (Dependabot + npm audit)  
- 🛡️ Escaneo OWASP ZAP  
- 🤖 Revisión AI (Copilot)  
- 📦 Push a Docker Hub  

🇬🇧  
Every push/PR to `main` runs:
- ✅ Tests (Jest + Supertest)  
- 🧱 Docker build (backend + frontend)  
- 🧪 Dependency audit (Dependabot + npm audit)  
- 🛡️ OWASP ZAP scan  
- 🤖 AI review (Copilot)  
- 📦 Docker Hub image push  

---

## 🛡️ Ciberseguridad por capas / Layered Security Model

🇪🇸  
Implementación de defensa en profundidad (*Defense in Depth*) inspirada en estándares OWASP y prácticas de empresas como Mercado Libre, Auth0 y GitHub.

🇬🇧  
Layered security model based on OWASP standards and real enterprise practices.

| Capa / Layer | Mecanismos / Mechanisms | Riesgos mitigados / Mitigates | Nivel / Level |
|---|---|---|---|
| **Transporte** | HTTPS, HSTS, cookies secure | MITM, sniffing | AWS / Mercado Pago |
| **CORS/CSP** | CORS estricto, CSP reforzado | XSS, CSRF de recursos externos | ML Frontend |
| **Middleware** | Helmet, HPP, xss-clean, mongoSanitize | XSS, NoSQLi, pollution | Netflix Node |
| **Rate/Abuso** | Rate Limit + Slow Down | DoS, brute force | Cloudflare |
| **Auth/Sesión** | JWT httpOnly, rotación, revocación | Hijack, replay | Auth0 / Cognito |
| **Contraseñas** | bcrypt + pepper | Brute force, stuffing | OWASP ASVS |
| **Validación** | Joi + sanitización | Injection, tampering | OWASP Top 10 |
| **CSRF** | csurf + SameSite | CSRF clásico | Banca |
| **Auditoría** | Winston + máscara | Forensics, fraude | Meli SRE |
| **CI/CD Security** | CodeQL, ZAP, Dependabot | Supply chain | GitHub Advanced Security |

---

## 🔐 Funciones clave / Key Security Features

🇪🇸 / 🇬🇧  
- JWT Access + Refresh httpOnly con rotación y revocación  
- Helmet + CSP reforzada  
- Rate limiting por endpoint  
- Slow-down para abuso leve  
- Sanitización + validación con Joi  
- CSRF en producción  
- Bcrypt + pepper  
- Auditoría avanzada con Winston  
- Integración con Dependabot, CodeQL y ZAP  

---

# 🔍 OWASP ZAP — DevSecOps Pipeline (Versión Profesional)  
*(bilingüe completo, sin duplicados)*

## 🇪🇸 Descripción  
El proyecto incluye un **OWASP ZAP Full Scan** completamente automatizado dentro del pipeline CI/CD.  
Este análisis ejecuta **escaneo activo + pasivo**, equivalente al usado por empresas como Mercado Libre, Auth0 o Globant.

**Quality Gate empresarial:**
- ❌ El pipeline falla SOLO ante vulnerabilidades **HIGH o MEDIUM**  
- ℹ️ Las LOW/INFO se registran pero NO bloquean  
- 📄 Reportes automáticos: **HTML, JSON, Markdown**

## 🇬🇧 Description  
The project integrates a fully automated **OWASP ZAP Full Scan** in the CI/CD pipeline.  
It performs **active + passive scanning** at enterprise level.

**Enterprise Quality Gate:**
- ❌ Pipeline fails ONLY on **HIGH or MEDIUM** vulnerabilities  
- ℹ️ LOW/INFO findings do not block deployment  
- 📄 Reports generated: **HTML, JSON, Markdown**

---

## 📁 Archivos generados / Generated Files

- `zap_report.html`  
- `zap_report.json`  
- `zap_report.md`

---

## 🧪 Proceso / Process

🇪🇸  
1. Se crea red Docker aislada  
2. Se levanta MongoDB  
3. Se construye el backend  
4. Se inicia backend con variables especiales  
5. Se verifica `/health`  
6. ZAP ejecuta Full Scan (`-a -d`)  
7. Se procesan hallazgos  
8. Se aplica el Quality Gate  
9. Se suben reportes como artefactos  

🇬🇧  
1. Isolated Docker network created  
2. MongoDB container started  
3. Backend image built  
4. Backend started with ZAP environment variables  
5. `/health` verified  
6. ZAP runs a Full Scan (`-a -d`)  
7. Findings processed  
8. Quality Gate applied  
9. Reports uploaded as artifacts  

---

## 🚫 Exclusiones / Exclusions (False Positives)

- `/health`  
- `/api/docs`  
- `/sitemap.xml`  
- `/robots.txt`

---

## 📊 Security Dashboard

| Métrica / Metric | Estado / Status |
|---|---|
| OWASP ZAP Full Scan | 🟢 Passing |
| Quality Gate | HIGH/MED strict |
| Reportes | HTML / JSON / MD |
| Escaneo automático | Cada push/PR |
| Contenedores | Backend + Mongo |

---

## 🧪 Testing Automático / Automated Testing

- MongoMemoryServer  
- Supertest (endpoints)  
- Jest (servicios, controladores)  
- CI ejecuta `npm run test:ci` con cobertura  

---

## ▶️ Scripts útiles / Useful Scripts

```bash
# Dev
npm run dev

# Tests locales / Local tests
npm run test

# CI tests (memoria + cobertura)
npm run test:ci

# Producción / Production
npm run start
👨‍💻 Autor / Author
Ignacio Alcañiz
Fullstack Developer — DevSecOps | CI/CD | Docker | MongoDB | React | AWS (en progreso)

📬 ignaalcaniz@gmail.com
🐙 GitHub: @ignacioalcaniz
