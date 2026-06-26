import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

// Visual QA: drive the SPA in light + dark at desktop + mobile and dump PNGs.
// Creds come from the ambient environment (DELPHI_MATRICOLA / DELPHI_PASSWORD)
// — not from .env, which is reserved for server config. Use a one-shot env
// injection when running, e.g.:
//   DELPHI_MATRICOLA=... DELPHI_PASSWORD=... node scripts/shoot.mjs

const EXE = "/home/fabio/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome";
const URL = "http://localhost:7822/";

const env = process.env;
if (!env.DELPHI_MATRICOLA || !env.DELPHI_PASSWORD) {
  console.log("set DELPHI_MATRICOLA and DELPHI_PASSWORD in the environment, skipping");
  process.exit(0);
}

mkdirSync("shots", { recursive: true });

const browser = await chromium.launch({ executablePath: EXE });

async function login(ctx) {
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.fill('input[name="matricola"]', env.DELPHI_MATRICOLA);
  await page.fill('input[name="password"]', env.DELPHI_PASSWORD);
  await Promise.all([
    page.waitForResponse((r) => r.url().endsWith("/session/login")),
    page.click('button[type="submit"]'),
  ]);
  await page.waitForSelector('.sidebar [data-nav="riepilogo"]', { state: "visible", timeout: 60000 });
  await page.waitForTimeout(300);
  return page;
}

async function goto(page, view) {
  await page.click(`.sidebar [data-nav="${view}"]`);
  await page.waitForTimeout(900);
}

async function shoot(page, name) {
  await page.screenshot({ path: `shots/${name}.png`, fullPage: true });
  console.log("wrote", name);
}

async function desktop(name, { theme, view }) {
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 2,
  });
  await ctx.addInitScript((t) => localStorage.setItem("dw-theme", t), theme);
  const page = await login(ctx);
  await goto(page, view);
  await shoot(page, name);
  await ctx.close();
}

async function loginShot(name) {
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  await shoot(page, name);
  await ctx.close();
}

async function mobile(name, { theme, view }) {
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });
  await ctx.addInitScript((t) => localStorage.setItem("dw-theme", t), theme);
  const page = await login(ctx);
  await goto(page, view);
  await shoot(page, name);
  await ctx.close();
}

const VIEWS = ["riepilogo", "esami", "verbali", "pendenti", "piano", "appelli", "tasse", "certificati", "servizi", "anagrafica"];

await loginShot("login-light");
for (const v of VIEWS) {
  await desktop(`${v}-light`, { theme: "light", view: v });
  await new Promise((r) => setTimeout(r, 4000)); // pause to avoid rate limit on Delphi
}
await desktop("riepilogo-dark", { theme: "dark", view: "riepilogo" });
await desktop("anagrafica-dark", { theme: "dark", view: "anagrafica" });
await desktop("tasse-dark", { theme: "dark", view: "tasse" });
await mobile("mobile-riepilogo", { theme: "light", view: "riepilogo" });
await mobile("mobile-esami", { theme: "light", view: "esami" });
await mobile("mobile-tasse", { theme: "light", view: "tasse" });

await browser.close();
