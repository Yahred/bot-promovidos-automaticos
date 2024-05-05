import fs from 'fs/promises';

const PATH = './promovidos-agregados.txt';

let existe = false;

const existeArchivo = async (path) => {
  try {
    fs.access(path);
    return true;
  } catch (error) {
    return false;
  }
}

if (!existeArchivo(PATH)) {
  await fs.writeFile(PATH, Buffer.from('')); 
}

/**
 * 
 * @param {string} nombreCompleto 
 */
export async function guardarPromovido(nombreCompleto) {
  await fs.appendFile(PATH, `${nombreCompleto}\n`);
}
/**
 * @return {Promise<Set<string>>}
 */
export async function obtenerPromovidosAgregados() {
  const promovidos = (await fs.readFile(PATH)).toString() || '';
  const agregados = new Set(promovidos.split('\n'));
  return agregados;
}