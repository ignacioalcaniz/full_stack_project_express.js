import { Schema, model } from "mongoose";

const UserSchema = new Schema({
  first_name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  age: {
    type: Number,
    required: true,
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
    default: "user",
  },
  cart:{
    type: Schema.Types.ObjectId,
    ref: "carts",
    default:null
  }
});

export const UserModel = model("user", UserSchema);