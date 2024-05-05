import puppeteer from "puppeteer";

import { URL_CAPTURA, URL_LOGIN } from "../constants/urls.js";
import { iniciarSesion } from "./iniciar-sesion.js";
import { obtenerDatosCoordinadoresZona } from "./leer-tabla-html.js";
import { SELECTORES } from "../constants/selectores.js";

const { USUARIO, PASS, HEADLESS } = process.env;

const headless = !!Number(HEADLESS);

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
