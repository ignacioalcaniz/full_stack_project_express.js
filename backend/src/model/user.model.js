// src/model/user.model.js
import { Schema, model } from "mongoose";

const escapeString = (s = "") =>
  String(s)
    .trim()
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

// Subdocumento para refresh tokens (sólo hashes)
const RefreshTokenSchema = new Schema({
  tokenHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: null },
});

const UserSchema = new Schema(
  {
    first_name: {
      type: String,
      required: true,
      trim: true,
      set: (v) => escapeString(v),
    },
    last_name: {
      type: String,
      required: true,
      trim: true,
      set: (v) => escapeString(v),
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      set: (v) => escapeString(v.toLowerCase?.() ?? v),
    },
    age: {
      type: Number,
      required: true,
      min: 0,
      max: 150,
    },
    password: {
      type: String,
      required: true,
    },
    isGoogle: {
      type: Boolean,
      required: true,
      default: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    cart: {
      type: Schema.Types.ObjectId,
      ref: "carts",
      default: null,
    },
    refreshTokens: { type: [RefreshTokenSchema], default: [] },
  },
  { timestamps: true }
);

/**
 * ❌ El pre-save y pre-update fueron eliminados
 * porque el hash ya se genera con PEPPER en createHash() (user.utils.js)
 * y no queremos un doble hash.
 */

// ✅ Método para comparar contraseñas (por si querés usarlo internamente)
UserSchema.methods.verifyPassword = async function (plainPassword, compareFn) {
  // Este método delega la comparación a la función isValidPassword() del servicio
  return compareFn(plainPassword, this.password);
};

export const UserModel = model("users", UserSchema);


