// Simula los servicios de email para los tests
export const sendWelcomeEmail = jest.fn().mockResolvedValue(true);
export const sendPurchaseEmail = jest.fn().mockResolvedValue(true);
