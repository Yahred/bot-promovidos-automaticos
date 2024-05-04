import puppeteer from "puppeteer";

import { iniciarSesion } from "./utils/iniciar-sesion.js";
import {
  obtenerDatosSeccionales,
  obtenerDatosCoordinadoresComite,
  obtenerDatosCoordinadoresZona,
  obtenerDatosPromotores,
  obtenerDatosPromovidos,
} from "./utils/leer-tabla-html.js";
import { URL_CAPTURA, URL_LOGIN, URL_MENU } from "./constants/urls.js";
import { SELECTORES } from "./constants/selectores.js";
import { clickearFila } from "./utils/clickear-fila.js";
import { obtenerPromovido } from "./utils/obtener-promovido.js";
import { verificarPromovidosRegistrados } from "./utils/verificar-promovidos-registrados.js";
import logger, { logErrorPromovido, logPromovidoRegistrado } from "./utils/logger.js";

const chunkSize = 30;

/**
 * @param {string} zona
 * @param {Record<string, string[]>} seccionesPorZona
 */
export async function ejecutarRegistro(zona, { usuario, pass }) {
  const browser = await puppeteer.launch({ headless: true, slowMo: 0.5 });
  const page = await browser.newPage();

  await page.setViewport({ width: 1280, height: 1080 });
  await page.goto(URL_LOGIN);

  const sesionIniciada = await iniciarSesion(page, usuario, pass);
  if (!sesionIniciada) {
    console.log("Error al iniciar sesión");
    process.exit(1);
  }

  page.on('dialog', async dialog => { 
    await dialog.accept();
  });

  console.log(`[${zona}]: Sesión iniciada ${usuario}:${pass}.`);
  await page.goto(URL_CAPTURA);
  await page.waitForSelector(SELECTORES.ICONO_USUARIOS);

  const coordinadoresZona = await obtenerDatosCoordinadoresZona(page);
  const indexZona = coordinadoresZona.findIndex(
    ({ zona: z }) => z === zona
  );

  const coordinador = coordinadoresZona[indexZona];

  if (!coordinador) {
    console.log(`No se encontró coordinador para lo zona: ${zona}`);
    return;
  }

  await page.goto(URL_MENU);
  await page.goto(URL_CAPTURA);

  await page.waitForSelector(SELECTORES.ICONO_USUARIOS);

  console.log(
    `Coordinador de zona: ${coordinador.nombreCompleto}, ${coordinador.zona}`
  );

  await clickearFila({
    page,
    index: indexZona,
    selector: SELECTORES.ICONO_USUARIOS,
    idTabla: SELECTORES.TABLA_ZONA,
  });

  await page.waitForSelector(`${SELECTORES.TABLA_SECCIONALES} tbody`);

  const seccionales = await obtenerDatosSeccionales(page);

  for (
    let indexSeccional = 0;
    indexSeccional < seccionales.length;
    indexSeccional += 1
  ) {
    const seccional = seccionales[indexSeccional];
    console.log(`[${zona}]: Coordinador de sección: ${seccional.nombreCompleto}`);
    const { numeroCoordinadores } = seccional;

    if (!numeroCoordinadores) continue;

    await clickearFila({
      page,
      idTabla: SELECTORES.TABLA_SECCIONALES,
      selector: SELECTORES.ICONO_USUARIOS,
      index: indexSeccional,
    });

    await page.waitForSelector(`${SELECTORES.TABLA_COMITES} tbody tr`, {
      visible: true,
    });

    const coordinadoresComite = await obtenerDatosCoordinadoresComite(page);
    for (
      let indexComites = 0;
      indexComites < coordinadoresComite.length;
      indexComites += 1
    ) {
      const comite = coordinadoresComite[indexComites];
      const { numeroPromotores } = comite;
      if (!numeroPromotores) continue;

      console.log(`[${zona}]: Coordinador de cómite: ${comite.nombreCompleto}`);

      await clickearFila({
        page,
        idTabla: SELECTORES.TABLA_COMITES,
        selector: SELECTORES.ICONO_USUARIOS,
        index: indexComites,
      });
      await page.waitForSelector(SELECTORES.TABLA_PROMOTORES, {
        visible: true,
      });

      const promotores = await obtenerDatosPromotores(page);

      for (
        let indexPromotores = 0;
        indexPromotores < promotores.length;
        indexPromotores += 1
      ) {
        const promotor = promotores[indexPromotores];
        
        console.log(`[${zona}]: Promotor: ${promotor.nombreCompleto}`);

        await clickearFila({
          idTabla: SELECTORES.TABLA_PROMOTORES,
          index: indexPromotores,
          page,
          selector: SELECTORES.ICONO_USUARIOS,
        });

        const promovidosGuardadosEnSistema = await obtenerDatosPromovidos(page);

        await verificarPromovidosRegistrados(promovidosGuardadosEnSistema);

        for (
          let promovidosAgregado = 0;
          promovidosAgregado < chunkSize;
          promovidosAgregado += 1
        ) {
          await page.waitForSelector(SELECTORES.BOTON_AGREGAR_PROMOVIDO, {
            visible: true,
          });
          await page.click(SELECTORES.BOTON_AGREGAR_PROMOVIDO);
          await page.waitForSelector(SELECTORES.MODAL_CAPTURA_PROMOVIDO, { visible: true });

          const promovido = await obtenerPromovido(seccional.seccion);
          
          if (!promovido) break;

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
            await page.type("#txtClaveElectorCoordinador", "xxxxxxxxxxxxxxxxxxx");
            await page.type("#txtCelularCoordinador", promovido.celular);

            promovido.guardado = true;
            await promovido.save();

            logPromovidoRegistrado(promovido);
            await page.evaluate((btnGuardar) => {
              const modal = document.getElementById('modalCapturaGeneral');
              const button = modal.querySelector(btnGuardar);
              button.click();
            }, SELECTORES.BOTON_GUARDAR_GENERAL);
          } catch (error) {
            logErrorPromovido(error)
            promovido.tieneError = true;
            promovido.errorMessage = error.message;
            await promovido.save();
            await page.evaluate(() => {
              const modal = document.getElementById('modalCapturaGeneral');
              const button = modal.querySelector('.btn-close');
              button.click();
            });
          } finally {
            await page.waitForSelector(SELECTORES.MODAL_CAPTURA_PROMOVIDO, { hidden: true });
          }
        }

        await page.evaluate((selector) => {
          const button = document.querySelector(selector);
          button.click();
        }, SELECTORES.BOTON_VOLVER_PROMOVIDOS);

        await page.waitForSelector(SELECTORES.TABLA_PROMOTORES, {
          visible: true,
        });
      }
 
      await page.waitForSelector(SELECTORES.BOTON_VOLVER_PROMOTOR, { visible: true });
      await page.click(SELECTORES.BOTON_VOLVER_PROMOTOR);
      await page.waitForSelector(SELECTORES.TABLA_COMITES, { visible: true });
    }

    await page.click(SELECTORES.BOTON_VOLVER_COMITE);
    await page.waitForSelector(SELECTORES.TABLA_SECCIONALES, {
      visible: true,
    });
  }

  await page.click(SELECTORES.BOTON_VOLVER_SECCIONAL);
  await page.waitForSelector(SELECTORES.TABLA_ZONA, { visible: true });

  logger.log('info', `Proceso finalizado [${zona}]`);
  await browser.close();
}
