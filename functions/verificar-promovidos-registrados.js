import Promovido from "../models/promovido.js";

/**
 * @param {import('../types.js').Promovido[]} promovidos
 * @param {number} seccion
 */
export async function verificarPromovidosRegistrados(promovidos, seccion) {
  await Promise.all(
    promovidos.map(({ nombre, paterno, materno }) =>
      Promovido.updateOne(
        {
          nombre,
          paterno,
          materno,
        },
        {
          guardado: true,
        }
      )
    )
  );
}
