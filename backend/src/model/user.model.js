// src/model/user.model.js
import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

const escapeString = (s = "") =>
  String(s)
    .trim()
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

// subdocumento para refresh tokens (sólo hashes)
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
 * Método instance: comparar password claro con hash
 */
UserSchema.methods.comparePassword = async function (plain) {
  return bcrypt.compare(plain, this.password);
};

/**
 * Pre-save: normalizar y hashear password si fue modificado
 */
UserSchema.pre("save", async function (next) {
  try {
    if (this.first_name) this.first_name = this.first_name.trim();
    if (this.last_name) this.last_name = this.last_name.trim();
    if (this.email) this.email = this.email.toLowerCase().trim();

    if (this.isModified("password")) {
      const hash = await bcrypt.hash(this.password, SALT_ROUNDS);
      this.password = hash;
    }
    next();
  } catch (err) {
    next(err);
  }
});

/**
 * Pre 'findOneAndUpdate' hook: if password being updated, hash it.
 */
UserSchema.pre("findOneAndUpdate", async function (next) {
  try {
    const update = this.getUpdate?.() || {};
    if (update.password) {
      const hash = await bcrypt.hash(update.password, SALT_ROUNDS);
      this.setUpdate({ ...update, password: hash });
    }
    next();
  } catch (err) {
    next(err);
  }
});

export const UserModel = model("users", UserSchema);

