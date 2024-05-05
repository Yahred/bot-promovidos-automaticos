import winston from 'winston';
import moment from 'moment';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(), 
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs.log' })
  ]
});

const dateFormat = 'yyyy-mm-dd hh:mm:ss'

/**
 * @param {import('../types').Promovido} promovido 
 */
export function logPromovidoRegistrado(promovido) {
  const timestamp = moment().format(dateFormat);
  logger.log('info', `[${timestamp}]: SE REGISTRÓ PROMOVIDO ${promovido.nombre} ${promovido.paterno} ${promovido.materno}`);
}

export function logErrorPromovido(error) {
  const timestamp = moment().format(dateFormat);

  logger.error('error', `${timestamp} ERROR AL INTENTAR REGISTRAR { Error: ${error.message} }`);
}

export default logger;