import Promovido from "../models/promovido.js";

/**
 * @param {import('../types.js').PromovidoResponse['d'][]} promovidos
 */
export async function verificarPromovidosRegistrados(promovidos) {
  await Promovido.updateMany({
    celular: { $in: promovidos.map(({ Celular }) => Celular) },
  }, {
    guardado: true,
  });
}
