import { SELECTORES } from '../constants/selectores.js';

const COMPUTED = {
  nombreCompleto: ({ nombre, paterno, materno }) => `${nombre} ${paterno} ${materno}`, 
  seccion: ({ seccion }) => Number(seccion.split(' ').pop()),
}

/**
 * @param {import('puppeteer').Page} page 
 * @returns {Promise<{ 
 *  zona: string; 
 *  numeroCoordinadores: number;
 *  nombre: string;
 *  paterno: string;
 *  materno: string;
 *  nombreCompleto: string; 
 * }[]>}
 */
export async function obtenerDatosCoordinadoresZona(page) {
  const coordinadores = await leerTabla({
    page,
    idTabla: SELECTORES.TABLA_ZONA,
    props: {
      2: 'zona',
      3: 'nombre',
      4: 'paterno',
      5: 'materno',
    },
    computedProps: {
      nombreCompleto: COMPUTED.nombreCompleto
    },
  });
  return coordinadores;
}

/**
 * @param {import('puppeteer').Page} page
 * @returns {Promise<{
 *  seccion: number;
 *  nombre: string;
 *  paterno: string;
 *  materno: string;
 *  nombreCompleto: string;
 *  numeroCoordinadores: number;
 * }[]>}
 */
export async function obtenerDatosSeccionales(page) {
  const seccionales = await leerTabla({
    page,
    idTabla: SELECTORES.TABLA_SECCIONALES,
    props: {
      2: 'seccion',
      3: 'nombre',
      4: 'paterno',
      5: 'materno',
    },
    computedProps: {
      nombreCompleto: COMPUTED.nombreCompleto,
      seccion: COMPUTED.seccion,
    } 
  });
  return seccionales;
}

/**
 * @param {import('puppeteer').Page} page
 * @returns {Promise<{
 *  nombre: string;
 *  paterno: string;
 *  materno: string;
 *  nombreCompleto: string;
 *  numeroPromotores: string;
 * }[]>} 
 */
export async function obtenerDatosCoordinadoresComite(page) {
  const comites = await leerTabla({
    page,
    idTabla: SELECTORES.TABLA_COMITES,
    props: {
      3: 'nombre',
      4: 'paterno',
      5: 'materno',
    },
    computedProps: {
      nombreCompleto: COMPUTED.nombreCompleto,
      numeroPromotores: ({ numeroCoordinadores }) => Number(numeroCoordinadores),
    }
  });
  return comites;
}

/**
 * 
 * @param {import('puppeteer').Page} page 
 * @returns {Promise<{
 *  nombre: string;
 *  paterno: string;
 *  materno: string;
 *  nombreCompleto: string;
 *  numeroPromovidos: number;
 *  numeroCoordinadores: number;
 * }[]>}
 */
export async function obtenerDatosPromotores(page) {
  const promotores = await leerTabla({
    page,
    idTabla: SELECTORES.TABLA_PROMOTORES,
    props: {
      1: 'clave',
      2: 'nombre',
      3: 'paterno',
      4: 'materno',
    },
    computedProps: {
      nombreCompleto: COMPUTED.nombreCompleto,
      numeroPromovidos: ({ numeroCoordinadores }) => Number(numeroCoordinadores),
    }
  });
  return promotores;
}

/**
 * @param {import('puppeteer').Page} page 
 * @returns {Promise<{
*  nombre: string;
*  paterno: string;
*  materno: string;
*  nombreCompleto: string;
*  numeroPromovidos: number;
*  numeroCoordinadores: number;
* }[]>}
*/
export async function obtenerDatosPromovidos(page) {
  const promovidos = await leerTabla({
    page,
    idTabla: SELECTORES.TABLA_PROMOVIDOS,
    props: {
      3: 'nombre',
      4: 'paterno',
      5: 'materno',
    },
    computedProps: {
      nombreCompleto: COMPUTED.nombreCompleto,
      numeroPromovidos: ({ numeroCoordinadores }) => Number(numeroCoordinadores),
    }
  });
  return promovidos;
}

/**
 * @param {{
 *   page: import('puppeteer').Page,
 *   idTabla: string;
 *   props: Record<number, string>,
 *   computedProps: Record<string, (obj: Record<keyof props, any>) => any>
 * }} params
 */
export async function leerTabla({
  page, idTabla, props, computedProps = {}
}) {
  computedProps = Object.entries(computedProps).reduce((acc, [key, value]) => {
    acc[key] = value.toString();
    return acc;
  }, {});

  const filas = await page.evaluate((idTabla, props, computedProps = {}) => {
    const tableRows = [];
    const tbody = document.querySelector(`${idTabla} tbody`);
    if (!tbody) return tableRows;
    
    const rows = tbody.querySelectorAll("tr");
    
    for (const row of rows) {
      const cells = Array.from(row.querySelectorAll('td'))
      const rowData = cells.map((cell) => cell.textContent.trim())
      const spanNumeroCoordinadores = row.querySelector(
        "span.position-absolute.top-0.start-100.translate-middle.badge.rounded-pill.bg-danger"
      );
      const obj = {}
      
      for (const [index, propName] of Object.entries(props)) {
        obj[propName] = rowData[index];
      }
      obj.numeroCoordinadores = Number(spanNumeroCoordinadores?.innerHTML);

      for (const [propName, computeFunction] of Object.entries(computedProps)) {
        let func;
        eval(`func = ${computeFunction}`);
        obj[propName] = func(obj);
      }

      tableRows.push(obj);
    }

    return tableRows;
  }, idTabla, props, computedProps);

  return filas;
}