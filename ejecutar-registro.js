import puppeteer from "puppeteer";

import { iniciarSesion } from "./functions/iniciar-sesion.js";
import {
  obtenerDatosSeccionales,
  obtenerDatosCoordinadoresComite,
  obtenerDatosCoordinadoresZona,
  obtenerDatosPromotores,
  obtenerDatosPromovidos,
} from "./functions/leer-tabla-html.js";
import { URL_CAPTURA, URL_LOGIN, URL_MENU } from "./constants/urls.js";
import { SELECTORES } from "./constants/selectores.js";
import { clickearFila } from "./functions/clickear-fila.js";
import { obtenerPromovido } from "./functions/obtener-promovido.js";
import { verificarPromovidosRegistrados } from "./functions/verificar-promovidos-registrados.js";
import logger, {
  logErrorPromovido,
  logPromovidoRegistrado,
} from "./functions/logger.js";


const { HEADLESS } = process.env;
const headless = !!Number(HEADLESS);

const { USUARIO, PASS, PROMOVIDOS_POR_LOTE } = process.env;
const promovidosPorLote = Number(PROMOVIDOS_POR_LOTE || 1);

const esProd = process.env.NODE_ENV === "production";

export async function obtenerZonas() {
  const browser = await puppeteer.launch({ headless });
  const page = await browser.newPage();

  await page.setViewport({ width: 1280, height: 1080 });
  await page.goto(URL_LOGIN);

  let sesion
  try {
    sesion = await iniciarSesion(page, USUARIO, PASS);
  } catch (error) {
    console.log(error)
  }

  if (!sesion) {
    logger.error("Error al iniciar sesión");
    process.exit(1);
  }

  await page.goto(URL_CAPTURA);
  await page.waitForSelector(SELECTORES.ICONO_USUARIOS);

  const coordinadoresZona = await obtenerDatosCoordinadoresZona(page);

  await browser.close();

  return [...new Set(coordinadoresZona.map(({ zona }) => zona))];
}

export async function main(zona) { 
  const browser = await puppeteer.launch({ headless });
  const page = await browser.newPage();

  await page.setViewport({ width: 1280, height: 1080 });
  await page.goto(URL_LOGIN);

  const sesionIniciada = await iniciarSesion(page, USUARIO, PASS);
  if (!sesionIniciada) {
    logger.error("Error al iniciar sesión");
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

  const clickZona = () => clickearFila({
    page,
    index: indexZona,
    selector: SELECTORES.ICONO_USUARIOS,
    idTabla: SELECTORES.TABLA_ZONA,
  });
  await clickZona();

  const coordinador = coordinadoresZona[indexZona];
  console.log(`Coordinador de zona: ${coordinador.nombreCompleto}, ${coordinador.zona}`);

  await page.waitForSelector(SELECTORES.TABLA_SECCIONALES, { visible: true });
  const seccionales = await obtenerDatosSeccionales(page);

  const clickSeccional = (index) => clickearFila({
    page, index, selector: SELECTORES.ICONO_USUARIOS, idTabla: SELECTORES.TABLA_SECCIONALES,
  });

  const clickComite = (index) => clickearFila({
    page, index, selector: SELECTORES.ICONO_USUARIOS, idTabla: SELECTORES.TABLA_COMITES,
  }); 

  const clickPromotor = (index) => clickearFila({
    page, index, selector: SELECTORES.ICONO_USUARIOS, idTabla: SELECTORES.TABLA_PROMOTORES,
  }); 
 
  let indexSeccional = 0;
  let indexComite = 0;
  let indexPromotor = 0;
  while (indexSeccional < seccionales.length) {
    await page.reload();
    await page.waitForSelector(SELECTORES.TABLA_ZONA, { visible: true });
    await page.waitForSelector(SELECTORES.SPINNER, { visible: false });

    await clickZona();
  
    await page.waitForSelector(SELECTORES.TABLA_SECCIONALES, { visible: true });
    await clickSeccional(indexSeccional);

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
    await clickComite(indexComite);
    
    await page.waitForSelector(SELECTORES.TABLA_PROMOTORES, { visible: true });
    const promotores = await obtenerDatosPromotores(page);
    const promotor = promotores[indexPromotor];

    if (!promotor) {
      indexComite += 1;
      indexPromotor = 0;
      continue;
    }
    
    console.log(`[${zona}]: Promotor: ${promotor.nombreCompleto}`);
    await clickPromotor(indexPromotor);
    await page.waitForSelector(SELECTORES.BOTON_AGREGAR_PROMOVIDO, {
      visible: true,
    });

    const promovidosGuardadosEnSistema = await obtenerDatosPromovidos(page);
    await verificarPromovidosRegistrados(promovidosGuardadosEnSistema);

    for (let i = 0; i < promovidosPorLote; i += 1) {
      const registrado = await registrarPromovido(page, seccional, zona);
      if (!registrado) break;
    }

    indexPromotor +=  1;
  }

  await browser.close();
}

/**
 * 
 * @param {import('puppeteer').Page} page 
 * @param {{ seccion: number }} seccional 
 * @returns {Promise<boolean>} 
 */
async function registrarPromovido(page, seccional, zona) {
  const timeLabel = `[${zona}]: Tiempo registro`
  console.time(timeLabel);

  await page.waitForSelector(SELECTORES.BOTON_AGREGAR_PROMOVIDO, { visible: true });
  await page.evaluate(() => {
    document.getElementById('botonAgregarPromovido').click();
  });
  await page.waitForSelector(SELECTORES.MODAL_CAPTURA_PROMOVIDO, {
    visible: true,
  });

  const promovido = await obtenerPromovido(seccional.seccion);
  if (!promovido) {
    console.timeEnd(timeLabel);
    return false;
  }

  try {
    await page.type("#txtNombre", promovido.nombre);
    await page.type("#txtPaternoCoordinador", promovido.paterno);
    await page.type("#txtMaternoCoordinador", promovido.materno);
    await page.type(
      "#txtSeccionalCoordinador",
      String(promovido.seccion)
    );
    await page.type("#txtColoniaCoordinador", promovido.colonia);
    await page.type("#txtCPCoordinador", promovido.cp);
    await page.type("#txtCalleCoordinador", promovido.calle);
    await page.type(
      "#txtNumeroCoordinador",
      String(promovido.numeroExterior)
    );
    await page.type(
      "#txtClaveElectorCoordinador",
      "xxxxxxxxxxxxxxxxxxx"
    );
    await page.type("#txtCelularCoordinador", promovido.celular);
    logPromovidoRegistrado(promovido);

    if (esProd) {
      promovido.guardado = true;
      await promovido.save();
      await page.evaluate((btnGuardar) => {
        const modal = document.getElementById("modalCapturaGeneral");
        const button = modal.querySelector(btnGuardar);
        button.click();
      }, SELECTORES.BOTON_GUARDAR_GENERAL);
      await page.waitForSelector(SELECTORES.SPINNER, { visible: true });
      await page.waitForSelector(SELECTORES.SPINNER, { visible: false });
    } else {
      await page.evaluate(() => {
        const modal = document.getElementById("modalCapturaGeneral");
        const button = modal.querySelector(".btn-close");
        button.click();
      });            
    }
  } catch (error) {
    logErrorPromovido(error);
    promovido.tieneError = true;
    promovido.errorMessage = error.message;
    await promovido.save();
    await page.evaluate(() => {
      const modal = document.getElementById("modalCapturaGeneral");
      const button = modal.querySelector(".btn-close");
      button.click();
    });
  } finally {
    await page.waitForSelector(SELECTORES.MODAL_CAPTURA_PROMOVIDO, {
      hidden: true,
    });
  }

  console.timeEnd(timeLabel);
  return true;
}
