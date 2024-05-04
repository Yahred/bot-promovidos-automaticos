import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs/promises';

import Promovido from "../models/promovido.js";
import { leerExcelComitesDistrito, obtenerSeccionesPromovidos } from "../utils/leer-excel.js";
import { existeArchivo } from '../utils/existe-archivo.js';


const cabeceros = 'Sección,Nombre,Paterno,Materno,Teléfono de contacto,Calle,No.ext.,Colonia,CP, Registrado, Error'.split(',');
const excelDistrito14 = new ExcelJS.Workbook();

let secciones = await Promovido.aggregate([
  {
    $project: {
      'seccion': 1,
    },
  },
  {
    $group: {
      _id: '$seccion'
    }
  },
  {
    $sort: {
      '_id': 1,
    }
  },
]);

secciones = secciones.map(({ _id }) => _id);

console.time('Excel');
for (const seccion of secciones) {
  const promovidos = await Promovido.find({
    seccion,
  }).lean();
  console.log(`Sección: ${seccion}, Cantidad promovidos: ${promovidos.length}`);

  const hoja = excelDistrito14.addWorksheet(String(seccion));
  
  const rows = promovidos.map(({
    seccion, nombre, paterno, materno, celular, calle, numeroExterior, colonia, cp, tieneError, guardado
  }) => [
    seccion, nombre, paterno, materno, celular, calle, numeroExterior, colonia, cp, tieneError ? 'SI' : 'NO', guardado ? 'SI' : 'NO',
  ]);

  hoja.addRows([cabeceros, ...rows]);
}
console.timeEnd('Excel');

const PATH_DISTRITO_14 = path.join(process.cwd(), '/out/reporte-total.xlsx');

if (!(await existeArchivo(PATH_DISTRITO_14))) {
  await fs.writeFile(PATH_DISTRITO_14, '');
}

await excelDistrito14.xlsx.writeFile(PATH_DISTRITO_14);

console.time('Excel guardados');

const excelGuardados = new ExcelJS.Workbook();
for (const seccion of secciones) {
  const promovidos = await Promovido.find({
    seccion,
    guardado: true
  }).lean();
  console.log(`Sección: ${seccion}, Cantidad promovidos: ${promovidos.length}`);

  const hoja = excelGuardados.addWorksheet(String(seccion));
  
  const rows = promovidos.map(({
    seccion, nombre, paterno, materno, celular, calle, numeroExterior, colonia, cp, tieneError, guardado
  }) => [
    seccion, nombre, paterno, materno, celular, calle, numeroExterior, colonia, cp, tieneError ? 'SI' : 'NO', guardado ? 'SI' : 'NO',
  ]);

  hoja.addRows([cabeceros, ...rows]);
}
console.timeEnd('Excel guardados');

const PATH_DISTRITO_GUARDADOS_14 = path.join(process.cwd(), '/out/reporte-guardados.xlsx');

await excelGuardados.xlsx.writeFile(PATH_DISTRITO_GUARDADOS_14);
process.exit(0);