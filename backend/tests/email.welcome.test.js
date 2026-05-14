
jest.mock("@react-email/render", () => ({
  render: jest.fn(() => "<html><body>Bienvenido Ignacio</body></html>"),
}));

const { renderEmail } = require("../src/emails/entries/welcome.entry.js");

describe("Welcome Email", () => {
  it("Debe renderizar correctamente el email de bienvenida", () => {
    const html = renderEmail({ nombre: "Ignacio" });
    expect(typeof html).toBe("string");
    expect(html).toContain("Bienvenido Ignacio");
  });
});










