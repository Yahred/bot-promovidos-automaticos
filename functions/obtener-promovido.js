import Promovido from "../models/promovido.js";

/**
 * @param {string[]} secciones 
 * @returns 
 */
export async function obtenerPromovido(secciones) {
  const promovido = await Promovido.findOne({
    seccion: secciones,
    guardado: false,
    $or: [
      { tieneError: { $exists: false } },
      { tieneError: false }
    ]
  });
  return promovido;
}