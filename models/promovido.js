import '../database/index.js';

import { Schema, model } from "mongoose";

// Definir el esquema
const promovidoSchema = new Schema({
  seccion: { type: Number },
  nombre: { type: String },
  paterno: { type: String },
  materno: { type: String },
  calle: { type: String },
  numeroExterior: { type: String },
  colonia: { type: String },
  numeroInterior: { type: String },
  cp: { type: String },
  celular: { type: String },
  guardado: { type: Boolean, default: false },
  tieneError: { type: Boolean, default: false },
  errorMessage: { type: String, default: '' },
}, {
  timestamps: {
    createdAt: 'fechaCreacion',
    updatedAt: 'fechaModificacion',
  },
  collection: 'promovidos',
});

const Promovido = model('Promovido', promovidoSchema);

export default Promovido;