export async function iniciarSesion(page, usuario, pass) {
  await page.type('input[name="login"]', usuario);
  await page.type('input[name="password"]', pass);
  const botonLogin = "#botonIniciarSesion";
  await page.waitForSelector(botonLogin);
  try {
    await Promise.all([page.click(botonLogin), page.waitForNavigation()]);
    return true;
  } catch (error) {
    return false;
  }
}
