import logger from "../functions/logger.js";
import Promovido from "../models/promovido.js";
import { SELECTORES } from "../constants/selectores.js";
import { API_CONSULTA_GENERAL_ID } from "../constants/urls.js";
import { clickPromovido } from "../functions/clickear-fila.js";
import { obtenerDatosPromovidos } from "../functions/leer-tabla-html.js";
import { recorrerPromovidos } from "../functions/recorrer-promovidos.js";

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

      const promovidoDb = await Promovido.findOne({
        nombre,
        paterno,
        celular,
      }).lean();

      if (!promovidoDb) {
        await Promovido.create({
          nombre,
          paterno,
          cp,
          calle,
          claveElectoral,
          colonia,
          materno,
          seccion,
          guardado: true,
        });
      }

      const repetido = await Promovido.findOne({
        nombre: { $ne: nombre },
        paterno: { $ne: paterno },
        celular,
        guardado: true,
      }).lean();

      if (!repetido) continue;

      await page.type(SELECTORES.TXT_NOMBRE, BORRAR);
      await page.type(SELECTORES.TXT_PATERNO, BORRAR);
      logger.info(
        `Eliminando promovido repetido ${repetido.nombre} ${repetido.paterno}`
      );

      if (esProd) {
        await page.evaluate((btnGuardar) => {
          const modal = document.getElementById("modalCapturaGeneral");
          const button = modal.querySelector(btnGuardar);
          button.click();
        }, SELECTORES.BOTON_GUARDAR_GENERAL);
        await Promovido.deleteOne({ _id: repetido._id });
        await page.waitForSelector(SELECTORES.SPINNER, { visible: false });
        await page.waitForSelector(SELECTORES.MODAL_CAPTURA_PROMOVIDO, {
          hidden: true,
        });
        continue;
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
