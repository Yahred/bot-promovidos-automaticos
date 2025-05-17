/**
 * @param {import('puppeteer').Page} page
 * @param {string} usuario
 * @param {string} pass
 * @returns {Promise<boolean>}
 */
export async function iniciarSesion(page, usuario, pass) {
  await page.waitForSelector('input[name="username"]', { visible: true });

  await page.type('input[name="username"]', usuario);
  await page.type('input[name="password"]', pass);

  const botonLogin = "#botonIniciar";
  await page.waitForSelector(botonLogin, { visible: true });
  try {
    await Promise.all([
      page.waitForNavigation(),
      page.evaluate(() => {
        document.getElementById("botonIniciar").click();
      }),
    ]);
    return true;
  } catch (error) {
    return false;
  }
}
