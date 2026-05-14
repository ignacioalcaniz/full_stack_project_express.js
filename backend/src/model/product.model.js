// src/model/product.model.js
import { Schema, model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const escapeString = (s = "") =>
  String(s)
    .trim()
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

export const productsCollectionName = "products";

const ProductSchema = new Schema(
  {
    /* ======================
       DATOS BÁSICOS
    ====================== */
    nombre: {
      type: String,
      required: true,
      index: true,
      trim: true,
      set: (v) => escapeString(v),
    },

    descripcion: {
      type: String,
      required: true,
      trim: true,
      set: (v) => escapeString(v),
    },

    precio: {
      type: Number,
      required: true,
      min: 0,
    },

    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    imagen: {
      type: String,
      required: true,
      trim: true,
      match: [/^https?:\/\/.+/i, "imagen debe ser una URL válida"],
    },

    categoria: {
      type: String,
      required: true,
      index: true,
      trim: true,
      set: (v) => escapeString(v),
    },

    /* ======================
       NUEVOS FILTROS PRO
    ====================== */
    autor: {
      type: String,
      trim: true,
      index: true,
      set: (v) => escapeString(v),
    },

    editorial: {
      type: String,
      trim: true,
      index: true,
      set: (v) => escapeString(v),
    },

    pais: {
      type: String,
      trim: true,
      index: true,
      set: (v) => escapeString(v),
    },

    idioma: {
      type: String,
      trim: true,
      index: true,
      set: (v) => escapeString(v),
    },

    anioPublicacion: {
      type: Number,
      index: true,
    },

    paginas: {
      type: Number,
      min: 1,
    },

    formato: {
      type: String,
      enum: ["Tapa blanda", "Tapa dura", "Digital", "Audiolibro"],
      default: "Tapa blanda",
    },

    isbn: {
      type: String,
      trim: true,
      index: true,
    },

    tags: {
      type: [String],
      index: true,
      default: [],
    },

    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },

    /* ======================
       HOME / VISIBILIDAD
    ====================== */
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },

    /* ======================
       MÉTRICAS (YA LAS USÁS)
    ====================== */
    stats: {
      views: { type: Number, default: 0 },
      cart: { type: Number, default: 0 },
      purchases: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

ProductSchema.plugin(mongoosePaginate);

export const ProductModel = model(
  productsCollectionName,
  ProductSchema
);



