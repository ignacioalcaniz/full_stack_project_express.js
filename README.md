# 🧩 Fullstack Express App — CI/CD + Ciberseguridad Profesional + Admin Panel
### Desarrollado por **Ignacio Alcañiz — 2025**

<p align="center">

  <img src="https://img.shields.io/github/actions/workflow/status/ignacioalcaniz/fullstack-express-app/zap-fullscan.yml?label=OWASP%20ZAP%20Scan&logo=owasp&style=for-the-badge" />

  <img src="https://img.shields.io/badge/ZAP-Full%20Scan%20CI-brightgreen?logo=owasp&style=for-the-badge" />

  <img src="https://img.shields.io/github/actions/workflow/status/ignacioalcaniz/fullstack-express-app/ci-cd.yml?label=CI%2FCD&style=for-the-badge" />

  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&style=for-the-badge" />

  <img src="https://img.shields.io/badge/Security-DevSecOps-blue?style=for-the-badge&logo=shield" />

  <img src="https://img.shields.io/badge/Admin%20Panel-Professional-111827?style=for-the-badge" />

  <img src="https://img.shields.io/badge/Realtime-Socket.IO-010101?style=for-the-badge&logo=socketdotio" />

</p>

---

## 🚀 Descripción general / Overview

🇪🇸  
Aplicación Fullstack profesional con **Node.js + Express + MongoDB + React**, arquitectura modular, enfoque **DevSecOps** y funcionalidades reales de e-commerce.  
Incluye autenticación segura con JWT y refresh tokens, cookies httpOnly, panel administrativo completo, auditoría de acciones, dashboard con métricas, chatbot configurable, import/export masivo y actualizaciones en tiempo real con Socket.IO.

El proyecto fue diseñado con enfoque de **calidad empresarial**, inspirado en prácticas de plataformas como **Mercado Libre, Auth0, GitHub y AWS-ready deployments**.

🇬🇧  
Professional Fullstack application built with **Node.js + Express + MongoDB + React**, modular architecture, **DevSecOps mindset**, and real e-commerce features.  
It includes secure JWT authentication with refresh tokens, httpOnly cookies, a complete admin panel, action auditing, metrics dashboard, configurable chatbot, bulk import/export, and real-time updates with Socket.IO.

This project was designed with an **enterprise-grade quality approach**, inspired by platforms such as **Mercado Libre, Auth0, GitHub, and AWS-ready deployments**.

---

## 🎯 Objetivo del proyecto / Project Goal

🇪🇸  
Construir una aplicación e-commerce profesional, segura, escalable y demostrable para:
- portfolio técnico
- entrevistas laborales
- venta del proyecto como solución real
- despliegue futuro en AWS

🇬🇧  
Build a professional, secure, scalable and demo-ready e-commerce application for:
- technical portfolio
- job interviews
- selling the project as a real solution
- future AWS deployment

---

## 🧠 Tecnologías / Technologies

| Categoría / Category | Tecnologías / Technologies |
|---|---|
| **Frontend** | React, React Router, Zustand, Axios, Socket.IO Client |
| **Backend** | Node.js, Express, MongoDB, Mongoose, Passport JWT, Joi, Socket.IO |
| **Security** | Helmet, HPP, CSP, xss-clean, express-mongo-sanitize, csurf, express-rate-limit, express-slow-down, bcrypt + pepper, JWT rotation |
| **Admin Panel** | Dashboard, Users, Products, Tickets, Logs, Settings, Chatbot |
| **Realtime** | Socket.IO (productos y dashboard en vivo) |
| **Email** | Resend, React Email |
| **Testing** | Jest, Supertest, MongoMemoryServer |
| **Docs** | Swagger (swagger-jsdoc + swagger-ui-express) |
| **DevOps** | Docker, GitHub Actions, Dependabot, CodeQL, OWASP ZAP, Copilot Review |

---

## 🧱 Estructura / Project Structure

```txt
fullstack-express-app/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── db/
│   │   ├── Middlewares/
│   │   ├── middlewares/
│   │   ├── model/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── app.js
│   │   └── server.js
│   ├── tests/
│   ├── package.json
│   ├── .env / .env.test
│   ├── Dockerfile
│   └── Dockerfile.dev
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── store/
│   │   └── App.jsx
│   ├── package.json
│   ├── Dockerfile
│   └── Dockerfile.dev
│
├── docker-compose.yml
├── docker-compose.override.yml
├── docker-compose.prod.yml
└── .github/workflows/
    ├── ci-cd.yml
    └── zap-fullscan.yml
⚙️ Entornos / Environments
Entorno	DB	Variables clave	Ejecución
Desarrollo	Mongo local (127.0.0.1)	DOCKER_ENV=false	npm run dev
CI/CD (tests)	Mongo en memoria	USE_MEMORY_DB=true	npm run test:ci
Producción	Mongo en contenedor	DOCKER_ENV=true	docker compose up --build
🛍️ Funcionalidades principales / Main Features
🇪🇸 Frontend / Cliente

Home profesional con destacados y más buscados

Catálogo completo con filtros avanzados

Búsqueda de libros y resultados relacionados

Vista de detalle de producto

Carrito persistente por usuario

Checkout real con creación de ticket

Perfil de usuario

Chatbot web integrado

Actualización en vivo del catálogo cuando un admin modifica productos

🇬🇧 Frontend / Client

Professional home page with featured and popular products

Full catalog with advanced filters

Search results with related books

Product detail page

Persistent cart per user

Real checkout flow with ticket generation

User profile

Integrated web chatbot

Live catalog updates when an admin modifies products

🛠️ Panel de administración / Admin Panel

🇪🇸
El proyecto incluye un Admin Panel completo, con enfoque empresarial y experiencia tipo marketplace.

Módulos incluidos

Dashboard: KPIs, ingresos, órdenes, top productos, alertas de stock, insights

Users: búsqueda, cambio de roles, eliminación segura

Products: CRUD completo, edición profesional, import/export, bulk update

Tickets: ventas, filtros, detalle de compra, exportación

Logs: auditoría administrativa, filtros, export CSV/PDF

Settings: configuración dinámica del sistema

Chatbot: gestión de FAQs desde panel

🇬🇧
The project includes a complete Admin Panel, designed with an enterprise marketplace mindset.

Included modules

Dashboard: KPIs, revenue, orders, top products, stock alerts, insights

Users: search, role changes, secure deletion

Products: full CRUD, professional editing, import/export, bulk update

Tickets: sales, filters, purchase details, export

Logs: admin auditing, filters, CSV/PDF export

Settings: dynamic system configuration

Chatbot: FAQ management from the admin panel

📡 Funcionalidad en tiempo real / Realtime Features

🇪🇸
El sistema integra Socket.IO para actualizaciones en vivo:

cambios de productos visibles en la tienda sin recargar

dashboard administrativo que se refresca automáticamente ante cambios clave

arquitectura preparada para eventos de negocio en tiempo real

🇬🇧
The system integrates Socket.IO for live updates:

product changes reflected in the storefront without page reload

admin dashboard auto-refreshes on key changes

architecture prepared for real-time business events

🤖 Chatbot administrable / Admin-Managed Chatbot

🇪🇸
El chatbot no es un bloque estático: puede administrarse desde el panel.

FAQs configurables desde Admin

respuestas por similitud y lógica de intención

soporte para preguntas frecuentes de tienda

base preparada para expansión a WhatsApp

🇬🇧
The chatbot is not static: it can be managed from the admin panel.

configurable FAQs from Admin

similarity-based and intent-based responses

support for store FAQs

architecture ready for WhatsApp expansion

⚙️ Settings dinámicos / Dynamic Settings

🇪🇸
La aplicación ya soporta configuración dinámica desde panel, sin tocar código:

maintenance mode

password policy

inactive user days

rate limit max

external integrations

Esto permite una base más profesional y preparada para entornos reales.

🇬🇧
The app already supports dynamic configuration from the panel, without editing code:

maintenance mode

password policy

inactive user days

rate limit max

external integrations

This creates a more professional and production-ready foundation.

🧾 Auditoría y trazabilidad / Audit & Traceability

🇪🇸
Cada acción administrativa importante puede quedar registrada:

cambios de rol

eliminaciones

modificaciones de productos

exportaciones

acciones críticas del panel

Esto es clave para:

seguridad

debugging

trazabilidad

soporte técnico

compliance básico

🇬🇧
Important admin actions can be recorded:

role changes

deletions

product updates

exports

critical panel actions

This is key for:

security

debugging

traceability

technical support

basic compliance

🧩 CI/CD — Integración y Despliegue / Continuous Integration & Deployment

🇪🇸
Cada push/PR a main ejecuta:

✅ Tests (Jest + Supertest)

🧱 Build Docker (backend + frontend)

🧪 Auditoría de dependencias

🛡️ Escaneo OWASP ZAP

🤖 Revisión AI

📦 Push de imágenes a Docker Hub

🇬🇧
Every push/PR to main runs:

✅ Tests (Jest + Supertest)

🧱 Docker build (backend + frontend)

🧪 Dependency audit

🛡️ OWASP ZAP scan

🤖 AI review

📦 Docker Hub image push

🛡️ Ciberseguridad por capas / Layered Security Model

🇪🇸
Implementación de defensa en profundidad (Defense in Depth), con enfoque real de producto profesional.

🇬🇧
Defense-in-depth implementation with a real production-oriented mindset.

Capa / Layer	Mecanismos / Mechanisms	Riesgos mitigados / Mitigates	Nivel / Level
Transporte	HTTPS, HSTS, secure cookies	MITM, sniffing	AWS / Mercado Pago
CORS/CSP	CORS estricto, CSP reforzada	XSS, third-party abuse	Enterprise frontend
Middleware	Helmet, HPP, xss-clean, mongoSanitize	XSS, NoSQLi, pollution	Node hardening
Rate/Abuso	Rate Limit + Slow Down	DoS, brute force	Cloudflare style
Auth/Sesión	JWT + Refresh + cookies httpOnly	Hijacking, replay	Auth0/Cognito style
Contraseñas	bcrypt + pepper + policy	Brute force, weak secrets	OWASP ASVS
Validación	Joi + sanitización	Injection, tampering	OWASP Top 10
CSRF	csurf + SameSite	CSRF clásico	Banking style
Auditoría	Logs administrativos + Winston	Forensics, misuse	Enterprise ops
CI/CD Security	CodeQL, ZAP, Dependabot	Supply chain	DevSecOps
🔐 Funciones clave de seguridad / Key Security Features

JWT Access + Refresh con rotación segura

Cookies httpOnly

Helmet + CSP

CORS controlado

Rate limiting + slow down

CSRF en producción

bcrypt + pepper

password policy

sanitización y validación

auditoría administrativa

ZAP + CodeQL + Dependabot



-Autenticación adaptativa para inicios de sesión sensibles
-Verificación por código OTP enviado por email
-Flujo de login en dos pasos para cuentas administrativas y acciones de mayor riesgo
-Protección adicional sin afectar la experiencia de usuarios comunes
-Integración de seguridad por contexto: login sensible, cambio de contraseña y acciones críticas
-Estado de autenticación gestionado con Zustand + JWT + refresh token en cookie httpOnly



-Adaptive authentication for sensitive sign-in flows
-Email-delivered OTP verification
-Two-step login flow for administrative accounts and higher-risk actions
-Extra protection without harming the regular user experience
-Context-aware security for sensitive login, password changes, and critical actions
-Authentication state managed with Zustand + JWT + refresh token stored in an httpOnly cookie

🔍 OWASP ZAP — DevSecOps Pipeline
🇪🇸 Descripción

El proyecto incluye OWASP ZAP Full Scan automatizado dentro del pipeline CI/CD, con escaneo activo y pasivo.

Quality Gate:

❌ el pipeline falla ante vulnerabilidades HIGH o MEDIUM

ℹ️ LOW/INFO se reportan pero no bloquean

📄 se generan reportes HTML, JSON y Markdown

🇬🇧 Description

The project includes an automated OWASP ZAP Full Scan in the CI/CD pipeline, with active and passive scanning.

Quality Gate:

❌ pipeline fails on HIGH or MEDIUM findings

ℹ️ LOW/INFO findings are reported but do not block deployment

📄 HTML, JSON and Markdown reports are generated

📁 Reportes generados / Generated Reports

zap_report.html

zap_report.json

zap_report.md

🧪 Testing Automático / Automated Testing

Jest

Supertest

MongoMemoryServer

tests de endpoints

tests de servicios

cobertura en CI

📦 Docker & Containers

🇪🇸
El proyecto está preparado para trabajar con contenedores y separar servicios:

backend

frontend

MongoDB

arquitectura preparada para Redis / despliegue cloud

🇬🇧
The project is prepared to work with containers and split services:

backend

frontend

MongoDB

architecture ready for Redis / cloud deployment



▶️ Scripts útiles / Useful Scripts
# Backend dev
npm run dev

# Tests locales
npm run test

# CI tests
npm run test:ci

# Producción
npm run start
👨‍💻 Autor / Author

Ignacio Alcañiz
Fullstack Developer — DevSecOps | CI/CD | Docker | MongoDB | React | AWS (en progreso)

📬 ignaalcaniz@gmail.com

🐙 GitHub: @ignacioalcaniz
