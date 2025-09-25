# Manual Técnico - Backend

## Tecnologías principales
- Node.js + Express
- MongoDB (con Mongoose)
- Passport + JWT para auth
- Winston para logs
- Resend para emails
- Swagger para documentación
- Jest para testing
- Docker (próximamente)

## Flujo de Usuario
1. Registro -> crea usuario + carrito -> email bienvenida
2. Login -> JWT (access + refresh)
3. Compra -> genera ticket -> email compra

## Estructura
- `/src/controllers`: controladores
- `/src/services`: lógica de negocio
- `/src/daos`: acceso a datos
- `/src/routes`: endpoints
- `/tests`: pruebas con Jest
- `/backup`: respaldos de DB, env y docs
