import '../database/index.js';

import { Schema, model } from "mongoose";

const promotorSchema = new Schema({
  seccion: { type: Number },
  nombre: { type: String },
  paterno: { type: String },
  materno: { type: String },
  clave: { type: Number },
}, {
  timestamps: {
    createdAt: 'fechaCreacion',
    updatedAt: 'fechaModificacion',
  },
  collection: 'promotores',
});

promotorSchema.index({ clave: 1 });

const Promotor = model('Promotor', promotorSchema);

export default Promotor;