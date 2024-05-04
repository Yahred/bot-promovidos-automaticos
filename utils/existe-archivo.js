import fs from 'fs/promises';

export async function existeArchivo(ruta) {
  try {
    await fs.access(ruta);
    return true;
  } catch (error) {
    return false;
  }
}