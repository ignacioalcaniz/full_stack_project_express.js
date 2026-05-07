import { Schema, model } from "mongoose";

const escapeString = (s = "") =>
  String(s)
    .trim()
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const RefreshTokenSchema = new Schema({
  tokenHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: null },
});

const PreferencesSchema = new Schema(
  {
    newsletter: { type: Boolean, default: true },
    notifications: { type: Boolean, default: true },
    publicProfile: { type: Boolean, default: false },
  },
  { _id: false }
);

const SecurityPreferencesSchema = new Schema(
  {
    loginAlerts: { type: Boolean, default: true },
    purchaseAlerts: { type: Boolean, default: true },
  },
  { _id: false }
);

const TrustedDeviceSchema = new Schema(
  {
    deviceId: {
      type: String,
      required: true,
      trim: true,
      set: (v) => escapeString(v),
    },
    userAgent: {
      type: String,
      default: "",
      trim: true,
      set: (v) => escapeString(v),
    },
    lastIp: {
      type: String,
      default: "",
      trim: true,
      set: (v) => escapeString(v),
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    lastUsedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const PasswordResetSchema = new Schema(
  {
    tokenHash: { type: String, default: null },
    expiresAt: { type: Date, default: null },
    requestedAt: { type: Date, default: null },
  },
  { _id: false }
);

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
    age: { type: Number, required: true, min: 0, max: 150 },
    password: { type: String, required: true },
    isGoogle: { type: Boolean, required: true, default: false },

    role: {
      type: String,
      enum: ["user", "premium", "admin", "support", "catalog", "finance"],
      default: "user",
    },

    permissions: { type: [String], default: [] },

    suspended: { type: Boolean, default: false },
    suspended_reason: { type: String, default: null },

    cart: { type: Schema.Types.ObjectId, ref: "carts", default: null },

    refreshTokens: { type: [RefreshTokenSchema], default: [] },

    avatarUrl: {
      type: String,
      default: "",
      trim: true,
      set: (v) => escapeString(v),
    },

    phone: {
      type: String,
      default: "",
      trim: true,
      set: (v) => escapeString(v),
    },

    address: {
      type: String,
      default: "",
      trim: true,
      set: (v) => escapeString(v),
    },

    preferences: {
      type: PreferencesSchema,
      default: () => ({
        newsletter: true,
        notifications: true,
        publicProfile: false,
      }),
    },

    securityPreferences: {
      type: SecurityPreferencesSchema,
      default: () => ({
        loginAlerts: true,
        purchaseAlerts: true,
      }),
    },

    emailOtpEnabled: {
      type: Boolean,
      default: false,
    },

    emailOtpCodeHash: {
      type: String,
      default: null,
    },

    emailOtpExpiresAt: {
      type: Date,
      default: null,
    },

    emailOtpPurpose: {
      type: String,
      default: null,
    },

    passwordReset: {
      type: PasswordResetSchema,
      default: () => ({
        tokenHash: null,
        expiresAt: null,
        requestedAt: null,
      }),
    },

    lastLoginAt: {
      type: Date,
      default: null,
    },

    lastLoginIp: {
      type: String,
      default: "",
      trim: true,
      set: (v) => escapeString(v),
    },

    lastLoginUserAgent: {
      type: String,
      default: "",
      trim: true,
      set: (v) => escapeString(v),
    },

    passwordChangedAt: {
      type: Date,
      default: null,
    },

    trustedDevices: {
      type: [TrustedDeviceSchema],
      default: [],
    },
  },
  { timestamps: true }
);

UserSchema.methods.verifyPassword = async function (plainPassword, compareFn) {
  return compareFn(plainPassword, this.password);
};

export const UserModel = model("users", UserSchema);



