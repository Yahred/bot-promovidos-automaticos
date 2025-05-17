import Promovido from "../models/promovido.js";

/**
 * @param {import('../types.js').PromovidoResponse['d'][]} promovidos
 */
export async function verificarPromovidosRegistrados(promovidos) {
  await Promovido.updateMany({
    clave: { $in: promovidos.map(({ Nombre, Paterno, Materno }) => `${Nombre}_${Paterno}_${Materno}`) },
  }, {
    guardado: true,
  });
}
