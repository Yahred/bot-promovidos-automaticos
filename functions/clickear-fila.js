import { SELECTORES } from '../constants/selectores.js';

/**
 * @param {{
 *  idTabla: string;
 *  page: import('puppeteer').Page,
 *  index: number;
 *  selector: string;
 * }} params 
 */
export async function clickearFila({
  page, index, selector, idTabla
}) {
  await page.evaluate((idTabla, index, selector) => {
    const tbody = document.querySelector(`${idTabla} tbody`);
    if (!tbody) return;
    const rows = tbody.querySelectorAll("tr");
    const boton = rows[index].querySelector(selector);
    boton.click();
  }, idTabla, index, selector);
}

export const clickSeccional = (page, index) => clickearFila({
  page, index, selector: SELECTORES.ICONO_USUARIOS, idTabla: SELECTORES.TABLA_SECCIONALES,
});

export const clickComite = (page, index) => clickearFila({
  page, index, selector: SELECTORES.ICONO_USUARIOS, idTabla: SELECTORES.TABLA_COMITES,
}); 

export const clickPromotor = (page, index) => clickearFila({
  page, index, selector: SELECTORES.ICONO_USUARIOS, idTabla: SELECTORES.TABLA_PROMOTORES,
}); 

export const clickZona = (page, index) => clickearFila({
  page,
  index,
  selector: SELECTORES.ICONO_USUARIOS,
  idTabla: SELECTORES.TABLA_ZONA,
});

export const clickPromovido = (page, index) => clickearFila({
  page,
  index,
  selector: SELECTORES.ICONO_LAPIZ,
  idTabla: SELECTORES.TABLA_PROMOVIDOS,
})