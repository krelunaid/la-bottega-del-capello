import { chromium } from "playwright";

const base = process.argv[2] || "http://127.0.0.1:8080";
const browser = await chromium.launch({ headless: true });

async function shot(page, name) {
  await page.screenshot({
    path: `/workspace/screenshots/${name}.png`,
    fullPage: false,
  });
}

const errors = [];
function attach(page, label) {
  page.on("pageerror", (err) => errors.push(`${label} page: ${err.message}`));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(`${label} console: ${msg.text()}`);
  });
}

const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
attach(page, "desktop");
page.on("response", async (res) => {
  if (res.url().includes("_server") || res.url().includes("book")) {
    if (res.status() >= 400) {
      errors.push(`http ${res.status()} ${res.url()}`);
    }
  }
});

await page.goto(`${base}/prenota`, { waitUntil: "networkidle" });
await page.getByRole("button", { name: /Stefano Pierini/i }).click();
await page.getByRole("button", { name: /^Continua$/ }).click();
await page.getByRole("button", { name: /Shampoo \+ Taglio/i }).click();
await page.getByRole("button", { name: /^Continua$/ }).click();
await page.getByRole("button", { name: /Regolazione barba/i }).click();
await page.getByRole("button", { name: /^Continua$/ }).click();
await page.locator("button").filter({ hasText: /^\d{2}:\d{2}$/ }).first().waitFor({ timeout: 8000 });
await page.locator("button").filter({ hasText: /^\d{2}:\d{2}$/ }).first().click();
await page.getByRole("button", { name: /^Continua$/ }).click();
await page.getByLabel("Nome e cognome").fill("Giulia Test");
await page.getByLabel("Telefono").fill("3339876543");
await page.getByLabel("Email (facoltativa)").fill("giulia@test.it");
await shot(page, "wizard-conferma");
await page.getByRole("button", { name: /Conferma appuntamento/i }).click();
try {
  await page.getByText("Sei in agenda.").waitFor({ timeout: 10000 });
} catch {
  await shot(page, "wizard-fail");
  const body = await page.locator("body").innerText();
  console.log("FAIL_BODY\n", body.slice(0, 2000));
  throw new Error("booking did not confirm");
}
await shot(page, "wizard-done");
const code = await page.getByText(/^BT-/).first().textContent();

await page.goto(`${base}/`, { waitUntil: "networkidle" });
await shot(page, "home-hero");
await page.evaluate(() => window.scrollTo(0, 1100));
await page.waitForTimeout(250);
await shot(page, "home-story");
await page.evaluate(() => window.scrollTo(0, 2000));
await page.waitForTimeout(250);
await shot(page, "home-team");

const mobile = await browser.newPage({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
});
attach(mobile, "mobile");
await mobile.goto(`${base}/`, { waitUntil: "networkidle" });
await shot(mobile, "mobile-home");
const overflow = await mobile.evaluate(
  () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
);
await mobile.goto(`${base}/prenota`, { waitUntil: "networkidle" });
await shot(mobile, "mobile-prenota");

console.log(JSON.stringify({ code, mobileOverflow: overflow, errors }, null, 2));
await browser.close();
