import Promovido from "../models/promovido.js";

/**
 * @param {import('../types.js').Promovido[]} promovidos
 */
export async function verificarPromovidosRegistrados(promovidos) {
  await Promovido.updateMany({
    celular: promovidos.map(({ celular }) => celular),
  }, {
    guardado: true,
  });
}
