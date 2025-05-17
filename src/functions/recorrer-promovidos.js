import puppeteer from "puppeteer";

import logger from "./logger.js";
import { iniciarSesion } from "./iniciar-sesion.js";
import {
  obtenerDatosSeccionales,
  obtenerDatosCoordinadoresComite,
  obtenerDatosCoordinadoresZona,
  obtenerDatosPromotores,
  obtenerCoordinadoresDl,
  obtenerCoordinadoresCots,
  obtenerVoluntarios,
} from "./leer-tabla-html.js";
import { URL_CAPTURA, URL_LOGIN } from "../constants/urls.js";
import { SELECTORES } from "../constants/selectores.js";
import {
  clickComite,
  clickDl,
  clickPromotor,
  clickRuta,
  clickSeccional,
  clickVoluntario,
  clickZona,
} from "./clickear-fila.js";
import { abrirNavegador } from "./abrir-navegador.js";

const { HEADLESS } = process.env;
const headless = !!Number(HEADLESS);

const { USUARIO, PASS, SLOW_MO, DISTRITO, MAX_PROMOVIDOS } = process.env;

const maxPromovidos = Number(MAX_PROMOVIDOS);

/**
 * @param {import('puppeteer').Page} page
 * @param {string} ruta
 */
async function moverHastaSeccionales(page, ruta) {
  await page.goto(URL_CAPTURA);
  await page.waitForSelector(SELECTORES.TABLA_COORDINADORES_MUNICIPAL, {
    visible: true,
  });
  await page.click(SELECTORES.ICONO_USUARIOS);

  await page.waitForSelector(SELECTORES.TABLA_COORDINADORES_DL, {
    visible: true,
  });

  const coordinadoresDl = await obtenerCoordinadoresDl(page);

  const indexCoordinadorDl = coordinadoresDl.findIndex(
    ({ distritoLocal }) => distritoLocal === DISTRITO
  );

  if (!indexCoordinadorDl === -1) {
    console.log("Distrito no encontrado");
    process.exit(2);
  }

  await clickDl(page, indexCoordinadorDl);

  await page.waitForSelector(SELECTORES.TABLA_COORDINADORES_COTS, {
    visible: true,
  });

  const coordinadoresCots = await obtenerCoordinadoresCots(page);
  const cotsIndex = coordinadoresCots.findIndex((c) => c.ruta === ruta);

  await clickRuta(page, cotsIndex);

  const coordinadorCots = coordinadoresCots[cotsIndex];
  console.log(
    `Coordinador cots: ${coordinadorCots.nombreCompleto}, ${coordinadorCots.ruta}`
  );

  await page.waitForSelector(SELECTORES.TABLA_SECCIONALES, { visible: true });
  const seccionales = await obtenerDatosSeccionales(page);

  return seccionales;
}

/**
 * @param {string} ruta
 * @param {(params: {
 *  page: import('puppeteer').Page,
 *  seccional: { seccion: number };
 *  indexSeccional: number;
 *  indexVoluntario: number;
 *  voluntario: any;
 * }) => Promise<{ indexComite?: number; indexSeccional?: number; indexPromotor?: number; }>} cb
 */
export async function recorrerPromovidos(ruta, cb) {
  const { browser, page } = await abrirNavegador();

  await page.setViewport({ width: 1280, height: 1080 });
  await page.goto(URL_LOGIN);

  page.setDefaultTimeout(5000);

  const sesionIniciada = await iniciarSesion(page, USUARIO, PASS);
  if (!sesionIniciada) {
    logger.error("Error al iniciar sesión");
    await browser.close();
    process.exit(1);
  }

  page.on("dialog", async (dialog) => {
    await dialog.accept();
  });

  logger.info(`[${ruta}]: Sesión iniciada ${USUARIO}:${PASS}.`);

  const seccionales = await moverHastaSeccionales(page, ruta);

  let indexSeccional = 0;
  let indexVoluntario = 0;

  while (indexSeccional < seccionales.length) {
    await page.reload();

    await moverHastaSeccionales(page, ruta);

    const seccional = seccionales[indexSeccional];
    console.log(
      `[${ruta}]: Coordinador de sección: ${seccional.nombreCompleto}`
    );

    await clickSeccional(page, indexSeccional);

    await page.waitForSelector(SELECTORES.TABLA_VOLUNTARIOS, { visible: true });
    
    const voluntarios = await obtenerVoluntarios(page);
    const voluntario = voluntarios[indexVoluntario];

    if (!voluntario) {
      indexSeccional += 1;
      indexVoluntario = 0;
      continue;
    }

    if (voluntario.numeroCoordinadores >= maxPromovidos) {
      console.log(
        `[${ruta}]: Voluntario completo ${voluntario.numeroCoordinadores}: ${voluntario.nombreCompleto}`
      );
      indexVoluntario += 1;
      continue;
    }

    console.log(`[${ruta}]: Voluntario: ${voluntario.nombreCompleto}`);

    await clickVoluntario(page, indexVoluntario);
    await page.waitForSelector(SELECTORES.TABLA_PROMOVIDOS, { visible: true });

    await cb({
      page,
      seccional,
      voluntario,
      indexSeccional,
      indexVoluntario,
    });

    indexVoluntario += 1;
  }

  await browser.close();
}
