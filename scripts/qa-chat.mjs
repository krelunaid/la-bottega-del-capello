import { chromium } from "playwright";

const base = process.argv[2] || "http://127.0.0.1:8080";
const browser = await chromium.launch({ headless: true });
const errors = [];

const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});

await page.goto(`${base}/login`, { waitUntil: "networkidle" });
await page.screenshot({ path: "/workspace/screenshots/login-new.png" });

await page.goto(`${base}/chat`, { waitUntil: "networkidle" });
await page.screenshot({ path: "/workspace/screenshots/chat-gate.png" });
await page.getByLabel("Come ti chiami").fill("Luca Neri");
await page.getByLabel("Telefono").fill("3334445566");
await page.getByRole("button", { name: /Inizia a scrivere/i }).click();
await page.getByText(/Buonasera, qui è La Bottega/i).waitFor({ timeout: 10000 });
await page.locator("textarea").fill("A che ora aprite sabato?");
await page.getByRole("button", { name: "Invia" }).click();
await page.waitForTimeout(2500);
await page.screenshot({ path: "/workspace/screenshots/chat-thread.png" });

await page.getByRole("button", { name: "Prenotazioni" }).click();
await page.screenshot({ path: "/workspace/screenshots/chat-bookings.png" });

await page.goto(`${base}/`, { waitUntil: "networkidle" });
await page.getByRole("button", { name: "Apri chat" }).click();
await page.waitForTimeout(400);
await page.screenshot({ path: "/workspace/screenshots/chat-widget.png" });

const mobile = await browser.newPage({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
});
mobile.on("pageerror", (e) => errors.push("mobile " + e.message));
await mobile.goto(`${base}/chat`, { waitUntil: "networkidle" });
await mobile.screenshot({ path: "/workspace/screenshots/mobile-chat.png" });
const overflow = await mobile.evaluate(
  () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
);

await page.goto(`${base}/login`, { waitUntil: "networkidle" });
const hasGoogle = await page.getByRole("button", { name: /Continua con Google/i }).count();
const hasApple = await page.getByRole("button", { name: /Apple/i }).count();

console.log(JSON.stringify({ errors, overflow, hasGoogle, hasApple }, null, 2));
await browser.close();
