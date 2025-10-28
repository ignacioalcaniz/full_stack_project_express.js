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
      // validación simple de URL (acepta http/https)
      match: [/^https?:\/\/.+/i, "imagen debe ser una URL válida"],
    },
    categoria: {
      type: String,
      required: true,
      trim: true,
      set: (v) => escapeString(v),
    },
  },
  { timestamps: true }
);

ProductSchema.plugin(mongoosePaginate);

export const ProductModel = model(productsCollectionName, ProductSchema);
