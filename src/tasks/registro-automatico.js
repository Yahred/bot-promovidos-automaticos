import { obtenerDatosPromovidos } from "../functions/leer-tabla-html.js";
import { SELECTORES } from "../constants/selectores.js";
import { obtenerPromovido } from "../functions/obtener-promovido.js";
import { verificarPromovidosRegistrados } from "../functions/verificar-promovidos-registrados.js";
import {
  logErrorPromovido,
  logPromovidoRegistrado,
} from "../functions/logger.js";
import { recorrerPromovidos } from "../functions/recorrer-promovidos.js";
import { clickPromovido, clickearFila } from "../functions/clickear-fila.js";
import { API_CONSULTA_GENERAL_ID } from "../constants/urls.js";

const { PROMOVIDOS_POR_LOTE } = process.env;
const promovidosPorLote = Number(PROMOVIDOS_POR_LOTE || 1);

const esProd = process.env.NODE_ENV === "production";

export async function registrosAutomaticos(zona) {
  await recorrerPromovidos(
    zona,
    async ({ indexSeccional, page, seccional }) => {
      const promovidosEnSistema = await obtenerPromovidosEnSistema(page);
      await verificarPromovidosRegistrados(promovidosEnSistema);

      for (let i = 0; i < promovidosPorLote; i += 1) {
        const registrado = await registrarPromovido(page, seccional, zona);
        if (registrado) continue;

        return {
          indexSeccional: indexSeccional + 1,
          indexComite: 0,
          indexPromotor: 0,
        };
      }
    }
  );
}

/**
 * @param {import('puppeteer').Page} page
 * @returns {Promise<import("../types.js").Promovido[]>} 
 */
async function obtenerPromovidosEnSistema(page) {
  const promovidosTabla = await obtenerDatosPromovidos(page);

  const promovidosEnSistema = [];
  for (let i = 0; i < promovidosTabla.length; i += 1) {
    await clickPromovido(page, i);
    const resp = await page.waitForResponse(API_CONSULTA_GENERAL_ID);
    await page.waitForSelector(SELECTORES.MODAL_CAPTURA_PROMOVIDO, { visible: true });

    /** @type {import("../types.js").PromovidoResponse} */
    const { d: promovido } = await resp.json();
    promovidosEnSistema.push(promovido);

    await page.evaluate(() => {
      const modal = document.getElementById("modalCapturaGeneral");
      const button = modal.querySelector(".btn-close");
      button.click();
    });
    await page.waitForSelector(SELECTORES.MODAL_CAPTURA_PROMOVIDO, {
      hidden: true,
    });
  }

  return promovidosEnSistema;
}

/**
 * @param {import('puppeteer').Page} page
 * @param {{ seccion: number }} seccional
 * @returns {Promise<boolean>}
 */
async function registrarPromovido(page, seccional, zona) {
  const timeLabel = `[${zona}]: Tiempo registro`;
  console.time(timeLabel);

  await page.waitForSelector(SELECTORES.BOTON_AGREGAR_PROMOVIDO, {
    visible: true,
  });

  await page.evaluate(() => {
    document.getElementById("botonAgregarPromovido").click();
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
    await page.type(SELECTORES.TXT_NOMBRE, promovido.nombre);
    await page.type(SELECTORES.TXT_PATERNO, promovido.paterno);
    await page.type(SELECTORES.TXT_MATERNO, promovido.materno);
    await page.type(SELECTORES.TXT_SECCIONAL, String(promovido.seccion));
    await page.type(SELECTORES.TXT_COLONIA, promovido.colonia);
    await page.type(SELECTORES.TXT_CP, promovido.cp);
    await page.type(SELECTORES.TXT_CALLE, promovido.calle);
    await page.type(SELECTORES.TXT_NUMERO, String(promovido.numeroExterior));
    await page.type(SELECTORES.TXT_CLAVE, promovido.claveElectoral);
    await page.type(SELECTORES.TXT_CELULAR, promovido.celular);
    logPromovidoRegistrado(promovido);

    if (esProd) {
      promovido.guardado = true;
      await promovido.save();
      await page.evaluate((btnGuardar) => {
        const modal = document.getElementById("modalCapturaGeneral");
        const button = modal.querySelector(btnGuardar);
        button.click();
      }, SELECTORES.BOTON_GUARDAR_GENERAL);
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
