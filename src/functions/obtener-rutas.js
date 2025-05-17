import puppeteer from "puppeteer";

import { URL_CAPTURA, URL_LOGIN } from "../constants/urls.js";
import { iniciarSesion } from "./iniciar-sesion.js";
import {
  obtenerCoordinadoresCots,
  obtenerCoordinadoresDl,
} from "./leer-tabla-html.js";
import { SELECTORES } from "../constants/selectores.js";
import { abrirNavegador } from "./abrir-navegador.js";
import { clickDl, clickearFila } from "./clickear-fila.js";

const { USUARIO, PASS, DISTRITO } = process.env;

export async function obtenerRutas() {
  const { browser, page } = await abrirNavegador();

  await page.goto(URL_LOGIN);

  let sesion;
  try {
    sesion = await iniciarSesion(page, USUARIO, PASS);
  } catch (error) {
    console.log(error);
  }

  if (!sesion) {
    logger.error("Error al iniciar sesión");
    process.exit(1);
  }

  await page.goto(URL_CAPTURA);
  await page.waitForSelector(SELECTORES.ICONO_USUARIOS);

  await page.click(SELECTORES.ICONO_USUARIOS);
  await page.waitForSelector(SELECTORES.TABLA_COORDINADORES_DL, {
    visible: true,
  });

  const coordinadoresDistritosLocales =
    await obtenerCoordinadoresDl(page);

  const index = coordinadoresDistritosLocales.findIndex(
    ({ distritoLocal }) => distritoLocal === DISTRITO
  );

  if (index === -1) {
    console.log("Distrito no encontrado");
    process.exit(2);
  }

  await clickDl(page, index)
 
  await page.waitForSelector(SELECTORES.TABLA_COORDINADORES_COTS, { visible: true });

  const coordinadoresCots = await obtenerCoordinadoresCots(page);

  await browser.close();

  return [...new Set(coordinadoresCots.map(({ ruta }) => ruta))];
}
