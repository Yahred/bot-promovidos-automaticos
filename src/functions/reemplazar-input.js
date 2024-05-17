import { Page } from "puppeteer";

/**
 * 
 * @param {{
 *  page: Page;
 *  selector: string;
 *  texto: string;
 * }} page 
 */
export async function remplazarInput({ page, selector, texto }) {
  const input = await page.$(selector);
  await input.click({ clickCount: 3 })
  await input.type(texto);
}