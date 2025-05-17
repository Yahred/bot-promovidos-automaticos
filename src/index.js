import 'dotenv/config';
import async from 'async';
import os from 'os';
import mongoose from 'mongoose';

import logger from "./functions/logger.js";
import { registrosAutomaticos } from "./tasks/registro-automatico.js";
import { obtenerRutas } from './functions/obtener-rutas.js';
import { limpiezaDuplicados } from './tasks/limpieza-duplicados.js';

const { MAX_CONCURRENCY, TAREA } = process.env;

console.log(`Iniciando crawler, Env -> ${process.env.NODE_ENV}`);

const rutas = await obtenerRutas();
console.log('Zonas: ', rutas);

const ultimaRuta = rutas.at(-1);

if (TAREA === 'limpieza') {
  console.log('Iniciando limpieza');
  for (const ruta of rutas) {
    await limpiezaDuplicados(ruta);
  } 
  console.log('Proceso finalizado');
  await mongoose.connection.close();
  process.exit(0);
}

const tareas = rutas.map((ruta) => ({
  name: ruta, 
  action: async () => registrosAutomaticos(ruta),
}));

const chunkSize = MAX_CONCURRENCY === 'auto' ? os.cpus.length() : Number(MAX_CONCURRENCY);

console.time('Ciclo')
const cola = async.queue(async ({ name, action }) => {
  try {
    logger.info(`Ejecutando ruta: ${name}`)
    await action();
    logger.info(`Ruta ${name} finalizada`)
  } catch (error) {
    logger.error(`Error en ruta: ${name} error: ${error}`)
  } finally {
    logger.info('Proceso finalizado');
    
    if (name !== ultimaRuta) return;
    console.timeEnd('Ciclo')
    await mongoose.connection.close();
    process.exit(0);
  }
}, chunkSize);

tareas.forEach((task) => {
  cola.push(task, (err) => {
    if (err) return logger.error(`Error en la zona ${task.name} err: ${err}`);
  })
});