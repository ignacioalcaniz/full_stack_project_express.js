// src/utils/tokens.js
import crypto from "crypto";

export const generateRandomToken = (size = 48) => {
  return crypto.randomBytes(size).toString("hex"); // 96 chars hex por default
};

export const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};
