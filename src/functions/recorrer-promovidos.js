import puppeteer from "puppeteer";

import logger from "./logger.js";
import { iniciarSesion } from "./iniciar-sesion.js";
import {
  obtenerDatosSeccionales,
  obtenerDatosCoordinadoresComite,
  obtenerDatosCoordinadoresZona,
  obtenerDatosPromotores,
} from "./leer-tabla-html.js";
import { URL_CAPTURA, URL_LOGIN } from "../constants/urls.js";
import { SELECTORES } from "../constants/selectores.js";
import { clickComite, clickPromotor, clickSeccional, clickZona } from "./clickear-fila.js";

const { HEADLESS } = process.env;
const headless = !!Number(HEADLESS);

const { USUARIO, PASS, SLOW_MO } = process.env;

/**
 * @param {string} zona 
 * @param {(params: {
 *  page: import('puppeteer').Page,
 *  seccional: { seccion: number };
 *  promotor: import('../types.js').Promotor,
 *  indexSeccional: number; 
 *  indexComite: number;
 *  indexPromotor: number;
 * }) => Promise<{ indexComite?: number; indexSeccional?: number; indexPromotor?: number; }>} cb 
 */
export async function recorrerPromovidos(zona, cb) { 
  const browser = await puppeteer.launch({ headless, slowMo: (Number(SLOW_MO) || 0) });
  const page = await browser.newPage();

  await page.setViewport({ width: 1280, height: 1080 });
  await page.goto(URL_LOGIN);
  await page.setDefaultTimeout(5000);

  const sesionIniciada = await iniciarSesion(page, USUARIO, PASS);
  if (!sesionIniciada) {
    logger.error("Error al iniciar sesión");
    await browser.close();
    process.exit(1);
  }

  page.on("dialog", async (dialog) => {
    await dialog.accept();
  });

  logger.info(`[${zona}]: Sesión iniciada ${USUARIO}:${PASS}.`);
  await page.goto(URL_CAPTURA);
  await page.waitForSelector(SELECTORES.TABLA_ZONA, { visible: true });

  const coordinadoresZona = await obtenerDatosCoordinadoresZona(page);
  const indexZona = coordinadoresZona.findIndex(({ zona: z }) => z === zona);

  await clickZona(page, indexZona);

  const coordinador = coordinadoresZona[indexZona];
  console.log(`Coordinador de zona: ${coordinador.nombreCompleto}, ${coordinador.zona}`);

  await page.waitForSelector(SELECTORES.TABLA_SECCIONALES, { visible: true });
  const seccionales = await obtenerDatosSeccionales(page);

  let indexSeccional = 0;
  let indexComite = 0;
  let indexPromotor = 0;
  while (indexSeccional < seccionales.length) {
    await page.reload();
    await page.waitForSelector(SELECTORES.TABLA_ZONA, { visible: true });
    await page.waitForSelector(SELECTORES.SPINNER, { visible: false });

    await clickZona(page, indexZona);
  
    await page.waitForSelector(SELECTORES.TABLA_SECCIONALES, { visible: true });
    await clickSeccional(page, indexSeccional);

    const seccional = seccionales[indexSeccional];
    console.log(`[${zona}]: Coordinador de sección: ${seccional.nombreCompleto}`);

    await page.waitForSelector(SELECTORES.TABLA_COMITES, { visible: true });
    const comites = await obtenerDatosCoordinadoresComite(page);

    const comite = comites[indexComite];
    if (!comite) {
      indexSeccional += 1;
      indexPromotor = 0;
      indexComite = 0;
      continue;
    }
    
    console.log(`[${zona}]: Cómite: ${comite.nombreCompleto}`);
    await clickComite(page, indexComite);
    
    await page.waitForSelector(SELECTORES.TABLA_PROMOTORES, { visible: true });
    const promotores = await obtenerDatosPromotores(page);
    /** @type {import("../types.js").Promotor} */
    const promotor = promotores[indexPromotor];

    if (!promotor) {
      indexComite += 1;
      indexPromotor = 0;
      continue;
    }
    
    console.log(`[${zona}]: Promotor: ${promotor.nombreCompleto}`);
    await clickPromotor(page, indexPromotor);
    await page.waitForSelector(SELECTORES.BOTON_AGREGAR_PROMOVIDO, {
      visible: true,
    });

    const { 
      indexComite: nuevoIndexComite,
      indexPromotor: nuevoIndexPromotor,
      indexSeccional: nuevoIndexSeccion,
    } = await cb({ indexComite, indexPromotor, indexSeccional, page, seccional, promotor }) || {};

    indexComite = nuevoIndexComite ?? indexComite;
    indexSeccional = nuevoIndexSeccion ?? indexSeccional;
    indexPromotor = nuevoIndexPromotor ?? indexPromotor + 1;
  }

  await browser.close();
}

