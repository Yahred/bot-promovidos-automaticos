import logger from "../functions/logger.js";
import PromovidoLimpieza from "../models/promovido-limpieza.js";
import { SELECTORES } from "../constants/selectores.js";
import { API_CONSULTA_GENERAL_ID } from "../constants/urls.js";
import { clickPromovido } from "../functions/clickear-fila.js";
import { obtenerDatosPromovidos } from "../functions/leer-tabla-html.js";
import { recorrerPromovidos } from "../functions/recorrer-promovidos.js";
import { remplazarInput } from '../functions/reemplazar-input.js';

const { NODE_ENV } = process.env;

const BORRAR = "BORRAR";
const esProd = NODE_ENV === "production";

/**
 * @param {string} zona
 */
export async function limpiezaDuplicados(zona) {
  await recorrerPromovidos(zona, async ({ page }) => {
    const promovidos = await obtenerDatosPromovidos(page);

    for (let i = 0; i < promovidos.length; i += 1) {
      await clickPromovido(page, i);
      const resp = await page.waitForResponse(API_CONSULTA_GENERAL_ID);
      await page.waitForSelector(SELECTORES.MODAL_CAPTURA_PROMOVIDO, {
        visible: true,
      });

      /** @type {import("../types.js").PromovidoResponse} */
      const { d: promovido } = await resp.json();

      const {
        ID: id,
        Nombre: nombre,
        Paterno: paterno,
        Celular: celular,
        CP: cp,
        Calle: calle,
        ClaveElector: claveElectoral,
        Colonia: colonia,
        Materno: materno,
        Seccional: seccion,
      } = promovido;

      if (nombre === BORRAR) continue;

      let promovidoDb = await PromovidoLimpieza.findOne({
        id,
        activo: true,
      });

      if (!promovidoDb) {
        promovidoDb = await PromovidoLimpieza.create({
          id,
          nombre,
          paterno,
          cp,
          calle,
          claveElectoral,
          colonia,
          materno,
          seccion,
          celular,
          guardado: true,
        });
      } else {
        promovidoDb.id = id;
        promovidoDb.guardado = true;
        await promovidoDb.save();
      }

      const repetido = await PromovidoLimpieza.findOne({
        id: { $ne: id },
        celular,
        guardado: true,
        activo: true,
      });

      if (!repetido) continue;

      await remplazarInput({ page, selector: SELECTORES.TXT_NOMBRE, texto: BORRAR });
      await remplazarInput({ page, selector: SELECTORES.TXT_PATERNO, texto: BORRAR });
      await remplazarInput({ page, selector: SELECTORES.TXT_MATERNO, texto: BORRAR });

      logger.info(
        `Eliminando promovido repetido ${repetido.nombre} ${repetido.paterno}`
      );

      if (esProd) {
        try {
          await page.evaluate((btnGuardar) => {
            const modal = document.getElementById("modalCapturaGeneral");
            const button = modal.querySelector(btnGuardar);
            button.click();
          }, SELECTORES.BOTON_GUARDAR_GENERAL);
          
          promovidoDb.activo = false;
          await promovidoDb.save();
          await page.waitForSelector(SELECTORES.SPINNER, { visible: false });
          await page.waitForSelector(SELECTORES.MODAL_CAPTURA_PROMOVIDO, {
            hidden: true,
          });
        } catch (error) { /** empty block */ }
      }

      await page.evaluate(() => {
        const modal = document.getElementById("modalCapturaGeneral");
        const button = modal.querySelector(".btn-close");
        button.click();
      });
      await page.waitForSelector(SELECTORES.MODAL_CAPTURA_PROMOVIDO, {
        hidden: true,
      });
    }
  });
}
