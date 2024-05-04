import async from 'async';
import { PASS_11, PASS_14, USUARIO_11, USUARIO_14 } from "./constants/sesion.js";
import { ZONAS_11, ZONAS_14 } from "./constants/zonas.js";
import { ejecutarRegistro } from "./ejecutar-registro.js";
import logger from "./utils/logger.js";
import { Task } from '@mui/icons-material';

const { ZONA: zona, USUARIO: usuario, PASS: pass } = process.env;

const chunkSize = 8;

/*
console.log(ZONAS_14.length);
for (let i = initial; i < ZONAS_14.length; i += chunkSize) {
  const zonas = ZONAS_14.slice(i, chunkSize + i);
  logger.info(`Iniciando proceso zonas: ${zonas}`);
  await Promise.allSettled(zonas.map((zona) => ejecutarRegistro(zona, { usuario: USUARIO_14, pass: PASS_14 })));
}

*/

const tareas = ZONAS_14.map((zona) => ({
  name: zona, 
  action: async () => ejecutarRegistro(zona, { 
    usuario: USUARIO_14,
    pass: PASS_14
  }),
}));

const cola = async.queue(async ({ name, action }) => {
  try {
    logger.info(`Ejecutando zona: ${name}`)
    await action();
    logger.info(`Zona ${name} finalizada`)
  } catch (error) {
    logger.error(`Error en zona: ${name} error: ${error}`)
  }
}, chunkSize)

tareas.forEach((task) => {
  cola.push(task, (err) => {
    if (err) return logger.error(`Error en la zona ${task.name} err: ${err}`);
  })
});


logger.log('info', `Proceso finalizado Distrito 14`);
