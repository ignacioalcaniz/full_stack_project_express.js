// backend/scripts/compile-emails.mjs
import esbuild from "esbuild";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import fs from "fs/promises";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, ".."); // backend/
const outdir = path.resolve(projectRoot, "dist", "emails");
const previewDir = path.resolve(projectRoot, "dist", "email-previews");

//
// 1) Compilar los templates con soporte JSX
//
await esbuild.build({
  entryPoints: [
    path.resolve(projectRoot, "src", "emails", "entries", "welcome.entry.js"),
    path.resolve(projectRoot, "src", "emails", "entries", "purchase.entry.js"),
  ],
  outdir,
  bundle: true,
  format: "esm",
  platform: "node",
  target: ["node18"],
  loader: {
    ".js": "jsx",
    ".jsx": "jsx",
  },
  // 🚀 importante: no empacar react, react-dom, react-email
  external: ["react", "react-dom", "@react-email/*"],
  sourcemap: false,
  logLevel: "info",
});

console.log("✅ Templates compilados en:", outdir);

//
// 2) Generar previews HTML
//
await fs.mkdir(previewDir, { recursive: true });

// ---- Welcome preview ----
{
  const mod = await import(
    pathToFileURL(path.join(outdir, "welcome.entry.js")).href
  );
  const html = await mod.renderEmail({
    first_name: "Ignacio",
    loginUrl: "http://localhost:3000/login",
  });
  await fs.writeFile(path.join(previewDir, "welcome.html"), html, "utf8");
  console.log("Preview generado: dist/email-previews/welcome.html");
}

// ---- Purchase preview ----
{
  const mod = await import(
    pathToFileURL(path.join(outdir, "purchase.entry.js")).href
  );
  const demoTicket = {
    code: "TICKET-DEMO-123",
    amount: 120.5,
    purchase_datetime: new Date().toISOString(),
    products: [
      { title: "Producto A", quantity: 1, price: 50 },
      { title: "Producto B", quantity: 2, price: 35.25 },
    ],
  };
  const html = await mod.renderEmail({
    first_name: "Ignacio",
    ticket: demoTicket,
  });
  await fs.writeFile(path.join(previewDir, "purchase.html"), html, "utf8");
  console.log("Preview generado: dist/email-previews/purchase.html");
}
