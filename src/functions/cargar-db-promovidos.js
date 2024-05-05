import Promovido from "../models/promovido.js";
import logger from "./logger.js";
import {
  leerExcelPromovidos,
  obtenerSeccionesPromovidos,
} from "./leer-excel.js";

const { RESET_PROMOVIDOS } = process.env;

export async function cargarDbPromovidos() {
  console.time("tiempo");

  if (Number(RESET_PROMOVIDOS)) {
    logger.info('Reiniciando DB Promovidos');
    await Promovido.deleteMany();
  }

  const promovidosExistentes = await Promovido.countDocuments();

  if (promovidosExistentes > 0) {
    console.timeEnd("tiempo");
    logger.info("Se omitió inserción de promovidos");
    return;
  } 

  logger.info("Iniciando inserción de promovidos");
  const secciones = await obtenerSeccionesPromovidos();
  for (const seccion of secciones) {
    const promovidos = await leerExcelPromovidos([seccion]);

    console.log(
      `Insertando ${promovidos.length} promovidos sección: ${seccion}`
    );
    try {
      await Promovido.insertMany(promovidos);
    } catch (error) {
      console.log(`Error en sección: ${seccion}`, error.message);
    }
  }

  console.timeEnd("tiempo");
  logger.info("Promovidos insertados correctamente");
}
