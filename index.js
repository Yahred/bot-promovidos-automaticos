import 'dotenv/config';
import async from 'async';
import os from 'os';
import mongoose from 'mongoose';

import logger from "./functions/logger.js";
import { registrosAutomaticos } from "./tasks/registro-automatico.js";
import { obtenerZonas } from './functions/obtener-zonas.js';
import { limpiezaDuplicados } from './tasks/limpieza-duplicados.js';

const { MAX_CONCURRENCY, TAREA } = process.env;

console.log(`Iniciando crawler, Env -> ${process.env.NODE_ENV}`);

const zonas = await obtenerZonas();
console.log('Zonas: ', zonas);

const ultimaZona = zonas.at(-1);

if (TAREA === 'limpieza') {
  console.log('Iniciando limpieza');
  for (const zona of zonas) {
    await limpiezaDuplicados(zona);
  } 
  console.log('Proceso finalizado');
  await mongoose.connection.close();
  process.exit(0);
}

const tareas = zonas.map((zona) => ({
  name: zona, 
  action: async () => registrosAutomaticos(zona),
}));

const chunkSize = MAX_CONCURRENCY === 'auto' ? os.cpus.length() : Number(MAX_CONCURRENCY);

console.time('Ciclo')
const cola = async.queue(async ({ name, action }) => {
  try {
    logger.info(`Ejecutando zona: ${name}`)
    await action();
    logger.info(`Zona ${name} finalizada`)
  } catch (error) {
    logger.error(`Error en zona: ${name} error: ${error}`)
  } finally {
    logger.info('Proceso finalizado');
    
    if (name !== ultimaZona) return;
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