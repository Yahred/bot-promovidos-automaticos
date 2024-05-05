import '../database/index.js';

import { Schema, model } from "mongoose";

const promovidoSchema = new Schema({
  seccion: { type: Number },
  nombre: { type: String },
  paterno: { type: String },
  materno: { type: String },
  calle: { type: String, required: false },
  numeroExterior: { type: String, required: false },
  colonia: { type: String, required: false },
  numeroInterior: { type: String, required: false },
  cp: { type: String, required: false },
  celular: { type: String, required: false, unique: true },
  claveElectoral: { type: String, required: false, default: 'xxxxxxxxxxxxxxxxxxx' },
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