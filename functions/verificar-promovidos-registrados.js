import Promovido from "../models/promovido.js";

/**
 *
 * @param {import('../types.js').Promovido[]} promovidos
 */
export async function verificarPromovidosRegistrados(promovidos) {
  await Promise.all(
    promovidos.map(({ nombre, paterno, materno }) =>
      Promovido.updateOne(
        {
          nombre,
          paterno,
          materno,
        },
        { guardado: true }
      )
    )
  );
}
