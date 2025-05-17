import puppeteer from "puppeteer";

const { GEO, HEADLESS, SLOW_MO } = process.env;
const headless = Boolean(Number(HEADLESS));

const [latitude, longitude] = GEO.split(",").map(Number);

export async function abrirNavegador() {
  const browser = await puppeteer.launch({
    headless,
    args: ["--use-fake-ui-for-media-stream"],
    slowMo: Number(SLOW_MO) || 0,
  });

  const context = browser.defaultBrowserContext();
  await context.overridePermissions(URL, ["geolocation"]);

  const page = await browser.newPage();

  await page.setGeolocation({
    latitude,
    longitude,
  });

  await page.setViewport({ width: 1280, height: 1080 });

  return { browser, page };
}
