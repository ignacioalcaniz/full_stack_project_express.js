// src/config/check-env.js
import "dotenv/config";

// ANSI colores para output
const colors = {
  red: (t) => `\x1b[31m${t}\x1b[0m`,
  green: (t) => `\x1b[32m${t}\x1b[0m`,
  yellow: (t) => `\x1b[33m${t}\x1b[0m`,
  cyan: (t) => `\x1b[36m${t}\x1b[0m`,
};

// Variables requeridas solo en entornos reales (dev / prod)
const requiredVars = [
  "JWT_SECRET",
  "PEPPER_SECRET",
  "MONGO_URL_LOCAL",
  "DB_NAME",
  "EMAIL_FROM",
  "EMAIL_ADMIN",
  "PASS_ADMIN",
];

export function checkEnv() {
  console.log(colors.cyan("🔍 Verificando variables de entorno...\n"));

  // ⛔ IMPORTANTE: En test / CI / ZAP (DISABLE_EMAILS) → no frenamos el arranque
  if (
    process.env.NODE_ENV === "test" ||
    process.env.CI === "true" ||
    process.env.DISABLE_EMAILS === "true"
  ) {
    console.log(
      colors.yellow(
        "🧪 Modo test / CI / ZAP detectado → omitimos validación estricta de variables.\n"
      )
    );
    return;
  }

  const missing = requiredVars.filter((key) => !process.env[key]);
  const defined = requiredVars.filter((key) => process.env[key]);

  if (defined.length > 0) {
    console.log(colors.green("✅ Definidas correctamente:"));
    defined.forEach((v) => console.log("   •", colors.green(v)));
    console.log("");
  }

  if (missing.length > 0) {
    console.error(colors.red("❌ Faltan variables críticas:"));
    missing.forEach((v) => console.error("   •", colors.red(v)));
    console.error(
      colors.yellow(
        "\n⚠️  Verificá tu archivo .env o las variables del entorno antes de iniciar el servidor.\n"
      )
    );
    process.exit(1);
  } else {
    console.log(
      colors.green(
        "✅ Todas las variables requeridas están configuradas.\n"
      )
    );
  }

  console.log(
    colors.cyan("🚀 Entorno verificado — listo para iniciar la app.\n")
  );
}

