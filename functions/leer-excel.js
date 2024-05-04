import readXlsxFile, { readSheetNames } from "read-excel-file/node";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const promovidoEsquema = {
  Sección: {
    prop: "seccion",
    type: Number,
  },
  Nombre: {
    prop: "nombre",
    type: String,
  },
  Paterno: {
    prop: "paterno",
    type: String,
  },
  Materno: {
    prop: "materno",
    type: String,
  },
  Calle: {
    prop: "calle",
    type: String,
  },
  "No.ext.": {
    prop: "numeroExterior",
    type: String,
  },
  Colonia: {
    prop: "colonia",
    type: String,
  },
  "No.int.": {
    prop: "numeroInterior",
    type: String,
  },
  CP: {
    prop: "cp",
    type: String,
  },
  'Teléfono de contacto': {
    prop: 'celular',
    type: String,
  }
};

const { PROMOVIDOS_PATH }= process.env;

/**
 * 
 * @returns {Promise<string[]>}
 */
export async function obtenerSeccionesPromovidos() {
  const path = join(__dirname, PROMOVIDOS_PATH);
  const hojas = await readSheetNames(path);
  return hojas;
}

/**
 * @param {number[]} seccion 
 * @returns {Promise<import("../types").Promovido[]>}
 */
export async function leerExcelPromovidos(secciones = []) {
  const path = join(__dirname, PROMOVIDOS_PATH);
  const promovidos = [];

  await Promise.all(secciones.map(async (seccion) => {
    const { rows } = await readXlsxFile(path, {
      schema: promovidoEsquema,
      sheet: String(seccion),
    });
    promovidos.push(...rows);
  }))

  promovidos.forEach((promovido) => {
    const { nombre, paterno, materno } = promovido;
    promovido.nombreCompleto = `${nombre} ${paterno} ${materno}`;
  })

  return promovidos;
}
