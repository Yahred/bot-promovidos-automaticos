import '../database/index.js';

import { Schema, model } from "mongoose";

const promovidoLimpiezaSchema = new Schema({
  id: { type: Number, required: true, unique: true, },
  seccion: { type: Number },
  nombre: { type: String },
  paterno: { type: String },
  materno: { type: String },
  calle: { type: String, required: false },
  numeroExterior: { type: String, required: false },
  colonia: { type: String, required: false },
  numeroInterior: { type: String, required: false },
  cp: { type: String, required: false },
  celular: { type: String, required: false },
  claveElectoral: { type: String, required: false, default: 'xxxxxxxxxxxxxxxxxxx' },
  guardado: { type: Boolean, default: false },
  tieneError: { type: Boolean, default: false },
  errorMessage: { type: String, default: '' },
  activo: { type: Boolean, default: true },
}, {
  timestamps: {
    createdAt: 'fechaCreacion',
    updatedAt: 'fechaModificacion',
  },
  collection: 'promovidosLimpieza',
});

promovidoLimpiezaSchema.index({ seccion: 1 });

const PromovidoLimpieza = model('PromovidoLimpieza', promovidoLimpiezaSchema);

export default PromovidoLimpieza;