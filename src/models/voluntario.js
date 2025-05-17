import '../database/index.js';

import { Schema, model } from "mongoose";

const voluntarioSchema = new Schema({
  seccion: { type: Number },
  nombre: { type: String },
  paterno: { type: String },
  materno: { type: String },
  clave: { type: String },
}, {
  timestamps: {
    createdAt: 'fechaCreacion',
    updatedAt: 'fechaModificacion',
  },
  collection: 'voluntarios',
});

voluntarioSchema.index({ clave: 1 });

const Voluntario = model('Voluntario', voluntarioSchema);

export default Voluntario;