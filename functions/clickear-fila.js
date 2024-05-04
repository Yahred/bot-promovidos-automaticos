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