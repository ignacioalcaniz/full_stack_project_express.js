// 🔹 Mock ESM
import { jest } from "@jest/globals"; 
jest.unstable_mockModule("@react-email/render", () => ({
  render: jest.fn(() => "<html><body>Compra: Laptop Gamer</body></html>"),
}));

// ⬇️ Importamos luego del mock
const { renderEmail } = await import("../src/emails/entries/purchase.entry.js");

describe("Purchase Email", () => {
  it("Debe renderizar correctamente el email de compra", () => {
    const html = renderEmail({ producto: "Laptop Gamer" });
    expect(html).toContain("Compra: Laptop Gamer");
  });
});



