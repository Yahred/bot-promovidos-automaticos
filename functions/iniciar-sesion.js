/**
 * @param {import('puppeteer').Page} page
 * @param {string} usuario
 * @param {string} pass
 * @returns {Promise<boolean>}
 */
export async function iniciarSesion(page, usuario, pass) {
  await page.waitForSelector('input[name="login"]', { visible: true });

  await page.type('input[name="login"]', usuario);
  await page.type('input[name="password"]', pass);

  const botonLogin = "#botonIniciarSesion";
  await page.waitForSelector(botonLogin, { visible: true });
  try {
    await Promise.all([
      page.waitForNavigation(),
      page.evaluate(() => {
        document.getElementById("botonIniciarSesion").click();
      }),
    ]);
    return true;
  } catch (error) {
    return false;
  }
}
