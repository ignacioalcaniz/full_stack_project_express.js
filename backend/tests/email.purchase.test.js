// Mock de @react-email/render
jest.mock("@react-email/render", () => ({
  render: jest.fn(() => "<html><body>Compra: Teclado Gamer - Ignacio</body></html>"),
}));

const { renderEmail } = require("../src/emails/entries/purchase.entry.js");

describe("Purchase Email", () => {
  it("Debe renderizar correctamente el email de compra", () => {
    const html = renderEmail({
      producto: "Teclado Gamer",
      purchaser: { name: "Ignacio" },
    });

    expect(typeof html).toBe("string");
    expect(html).toContain("Teclado Gamer");
    expect(html).toContain("Ignacio");
  });
});









