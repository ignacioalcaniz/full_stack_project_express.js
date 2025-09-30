// 🔹 Mock ESM
import { jest } from "@jest/globals"; 
jest.unstable_mockModule("@react-email/render", () => ({
  render: jest.fn(() => "<html><body>Bienvenido Ignacio</body></html>"),
}));

// ⬇️ Importamos luego del mock
const { renderEmail } = await import("../src/emails/entries/welcome.entry.js");

describe("Welcome Email", () => {
  it("Debe renderizar correctamente el email de bienvenida", () => {
    const html = renderEmail({ nombre: "Ignacio" });
    expect(html).toContain("Bienvenido Ignacio");
  });
});


