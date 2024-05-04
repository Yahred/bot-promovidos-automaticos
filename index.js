import 'dotenv/config';
import async from 'async';
import os from 'os';

import { main, obtenerZonas } from "./ejecutar-registro.js";
import logger from "./functions/logger.js";

const { MAX_CONCURRENCY } = process.env;

console.log(`Iniciando crawler, Env -> ${process.env.NODE_ENV}`);

const zonas = await obtenerZonas();
console.log('Zonas: ', zonas);

const ultimaZona = zonas.pop();

const tareas = zonas.map((zona) => ({
  name: zona, 
  action: async () => main(zona),
}));

const chunkSize = MAX_CONCURRENCY === 'auto' ? os.cpus.length() : Number(MAX_CONCURRENCY);

const cola = async.queue(async ({ name, action }) => {
  try {
    logger.info(`Ejecutando zona: ${name}`)
    await action();
    logger.info(`Zona ${name} finalizada`)
    
    if (name === ultimaZona) {
      logger.info('Proceso finalizado');
      process.exit(0);
    }
  } catch (error) {
    logger.error(`Error en zona: ${name} error: ${error}`)
  }
}, chunkSize);

tareas.forEach((task) => {
  cola.push(task, (err) => {
    if (err) return logger.error(`Error en la zona ${task.name} err: ${err}`);
  })
});