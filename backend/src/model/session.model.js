// src/model/session.model.js (opcional)
import { Schema, model } from "mongoose";

const SessionSchema = new Schema({
  _id: { type: String }, // session id
  session: { type: Schema.Types.Mixed },
  expires: { type: Date },
});

export const SessionModel = model("sessions", SessionSchema);
