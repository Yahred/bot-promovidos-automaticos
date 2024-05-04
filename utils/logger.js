import winston from 'winston';
import moment from 'moment';

// Configuración del logger
const logger = winston.createLogger({
  level: 'info', // Nivel mínimo de los registros
  format: winston.format.simple(), // Formato de los registros
  transports: [
    // Transporte para imprimir los registros en la consola
    new winston.transports.Console(),
    // Transporte para escribir los registros en un archivo
    new winston.transports.File({ filename: 'logs.log' })
  ]
});

const dateFormat = '[yyyy-mm-dd hh:mm:ss]'

/**
 * @param {import('../types').Promovido} promovido 
 */
export function logPromovidoRegistrado(promovido) {
  logger.log('info', `SE REGISTRÓ PROMOVIDO ${promovido.nombre} ${promovido.paterno} ${promovido.materno}`);
}

export function logErrorPromovido(error) {
  logger.error('error', `ERROR AL INTENTAR REGISTRAR { Error: ${error.message} }`);
}

export default logger;