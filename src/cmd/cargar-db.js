import "dotenv/config";

import mongoose from "mongoose";

import Promovido from "../models/promovido.js";

import {
  leerExcelPromovidos,
  obtenerSeccionesPromovidos,
} from "../functions/leer-excel.js";

console.time("tiempo");

await Promovido.deleteMany();
const secciones = await obtenerSeccionesPromovidos();
for (const seccion of secciones) {
  let promovidos = await leerExcelPromovidos([seccion]);
  promovidos = promovidos.filter(({ nombre, paterno, cp, celular, colonia }) =>
    [nombre, paterno, cp, celular, colonia].every(Boolean)
  );
  console.log(`Insertando ${promovidos.length} promovidos sección: ${seccion}`);
  try {
    await Promovido.insertMany(promovidos, { ordered: false });
  } catch (error) { }
}

console.timeEnd("tiempo");
console.log("Proceso finalizado correctamente");

mongoose.connection.close();
process.exit(0);
