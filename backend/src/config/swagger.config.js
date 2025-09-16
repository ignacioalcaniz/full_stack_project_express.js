import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API - Fullstack Express App",
      version: "1.0.0",
      description: "Documentación de la API (Express + JWT + Swagger + Winston).",
    },
    servers: [
      { url: "http://localhost:8080", description: "Servidor local" }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Product: {
          type: "object",
          properties: {
            _id: { type: "string", example: "6502c3e8a1b2c81234567890" },
            title: { type: "string", example: "Laptop Gamer" },
            price: { type: "number", example: 1500 },
          },
          required: ["title", "price"],
        },
        UserCredentials: {
          type: "object",
          properties: {
            email: { type: "string", example: "user@example.com" },
            password: { type: "string", example: "secret" },
          },
          required: ["email", "password"],
        },
        User: {
          type: "object",
          properties: {
            _id: { type: "string", example: "6502d3f0c2a4c81234567890" },
            first_name: { type: "string", example: "Ignacio" },
            last_name: { type: "string", example: "Alcaniz" },
            email: { type: "string", example: "ignacio@example.com" },
            role: { type: "string", example: "user" },
          },
        },
        Cart: {
          type: "object",
          properties: {
            _id: { type: "string", example: "6502c3e8d2e4c81234567890" },
            products: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  productId: { type: "string", example: "6502c3e8a1b2c81234567890" },
                  quantity: { type: "number", example: 2 },
                },
              },
            },
          },
        },
        Ticket: {
          type: "object",
          properties: {
            _id: { type: "string", example: "6502c3e8a1b2c81234567890" },
            code: { type: "string", example: "TICKET-20230915-12345" },
            amount: { type: "number", example: 120.5 },
            purchaser: { type: "string", example: "user@example.com" },
            purchase_datetime: {
              type: "string",
              format: "date-time",
              example: "2025-09-15T20:44:03.000Z",
            },
          },
        },
        Email: {
          type: "object",
          properties: {
            to: { type: "string", example: "cliente@example.com" },
            subject: { type: "string", example: "Confirmación de compra" },
            message: { type: "string", example: "Tu compra fue realizada con éxito." },
          },
          required: ["to", "subject", "message"],
        },
      },
    },
  },
  apis: ["./src/routes/*.js", "./src/routes/**/*.js"],
};

export const swaggerSpecs = swaggerJSDoc(swaggerOptions);
export { swaggerUi };


