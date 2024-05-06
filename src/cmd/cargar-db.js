import "dotenv/config";

import mongoose from "mongoose";

import Promovido from "../models/promovido.js";

import {
  leerExcelPromovidos,
  obtenerSeccionesPromovidos,
} from "../functions/leer-excel.js";

console.time("tiempo");

await Promovido.deleteMany();
const hojas = await obtenerSeccionesPromovidos();
for (const hoja of hojas) {
  let promovidos = await leerExcelPromovidos([hoja]);
  promovidos = promovidos.filter(({ nombre, paterno, cp, celular, colonia }) =>
    [nombre, paterno, cp, celular, colonia].every(Boolean)
  );
  console.log(`Insertando ${promovidos.length} promovidos sección: ${hoja}`);
  try {
    await Promovido.insertMany(promovidos, { ordered: false });
  } catch (error) { }
}

console.timeEnd("tiempo");
console.log("Proceso finalizado correctamente");

mongoose.connection.close();
process.exit(0);
