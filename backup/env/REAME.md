mongorestore --uri="mongodb://localhost:27017/fullstackdb" backup/db/dump/2025-09-23
yaml
Copiar código

---

### 2. `backup/env/.env.example`
```env
# Server
PORT=8080
MONGO_URL=mongodb://localhost:27017/fullstackdb
JWT_SECRET=Secu2015$

# Admin user
EMAIL_ADMIN=tu-email@gmail.com
PASS_ADMIN=1234

# Resend API
RESEND_API_KEY=tu-api-key
EMAIL_FROM=Mi App <no-reply@send.full.stack>

# Frontend
FRONTEND_URL=http://localhost:3000