import mongoose from "mongoose";

import Promovido from "../models/promovido.js";

import { leerExcelPromovidos, obtenerSeccionesPromovidos } from "../functions/leer-excel.js";

console.time('tiempo');

await Promovido.deleteMany()
const secciones = await obtenerSeccionesPromovidos(); 
for (const seccion of secciones) {
  const promovidos = await leerExcelPromovidos([seccion]);
  
  console.log(`Insertando ${promovidos.length} promovidos sección: ${seccion}`);
  try {
    await Promovido.insertMany(promovidos);
  } catch (error) {
    console.log(`Error en sección: ${seccion}`, error.message);
  }
}

console.timeEnd('tiempo');
console.log('Proceso finalizado correctamente')

mongoose.connection.close()
process.exit(0);