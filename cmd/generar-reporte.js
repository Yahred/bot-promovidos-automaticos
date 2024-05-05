import 'dotenv/config'

import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs/promises';

import Promovido from "../models/promovido.js";
import { existeArchivo } from '../functions/existe-archivo.js';
import mongoose from 'mongoose';


const cabeceros = 'Sección,Nombre,Paterno,Materno,Teléfono de contacto,Calle,No.ext.,Colonia,CP, Registrado, Error'.split(',');
const excel = new ExcelJS.Workbook();
const { DISTRITO: distrito } = process.env;

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

  const hoja = excel.addWorksheet(String(seccion));
  
  const rows = promovidos.map(({
    seccion, nombre, paterno, materno, celular, calle, numeroExterior, colonia, cp, tieneError, guardado
  }) => [
    seccion, nombre, paterno, materno, celular, calle, numeroExterior, colonia, cp, tieneError ? 'SI' : 'NO', guardado ? 'SI' : 'NO',
  ]);

  hoja.addRows([cabeceros, ...rows]);
}
console.timeEnd('Excel');

const PATH = path.join(process.cwd(), `/out/reporte-${distrito}-total.xlsx`);

if (!(await existeArchivo(PATH))) {
  await fs.writeFile(PATH, '');
}

await excel.xlsx.writeFile(PATH);

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

const PATH_DISTRITO_GUARDADOS = path.join(process.cwd(), `/out/reporte-${distrito}-guardados.xlsx`);

await mongoose.connection.close();
await excelGuardados.xlsx.writeFile(PATH_DISTRITO_GUARDADOS);
process.exit(0);