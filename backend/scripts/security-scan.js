import { execSync } from "child_process";

console.log("🔍 Iniciando escaneo de seguridad...");

// 1. Snyk – Dependencias vulnerables
try {
  execSync("npx snyk test", { stdio: "inherit" });
} catch {
  console.warn("⚠️ Snyk detectó vulnerabilidades (ver arriba).");
}

// 2. OWASP ZAP – Escaneo dinámico local
try {
  console.log("🧠 Escaneando API local con OWASP ZAP...");
  execSync(
    'npx zap-cli quick-scan --self-contained --start-options "-config api.disablekey=true" http://localhost:8080',
    { stdio: "inherit" }
  );
} catch {
  console.warn("⚠️ OWASP ZAP detectó posibles vulnerabilidades.");
}

console.log("✅ Escaneo completado.");
