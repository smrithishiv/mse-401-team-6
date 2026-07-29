import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
const DIR = '/private/tmp/claude-501/-Users-joannewong-mse-401-team-6/1c42cdf4-747d-45f8-9a41-457fbaad7a51/scratchpad';

await page.goto('http://localhost:5173/agencies', { waitUntil: 'networkidle' });
await page.waitForSelector('text=61 agencies', { timeout: 5000 });
await page.waitForTimeout(300);
await page.screenshot({ path: `${DIR}/v4-03b-agencies-page.png`, fullPage: true });

await page.getByPlaceholder('Search agencies by name, city, or status').fill('Cambridge');
await page.waitForTimeout(300);
await page.screenshot({ path: `${DIR}/v4-04b-agencies-search.png`, fullPage: true });
await page.getByPlaceholder('Search agencies by name, city, or status').fill('');
await page.waitForTimeout(200);

await page.locator('select').first().selectOption('high-demand');
await page.waitForTimeout(300);
await page.screenshot({ path: `${DIR}/v4-05b-agencies-filtered.png`, fullPage: true });

await page.goto('http://localhost:5173/agencies/kw-ymca', { waitUntil: 'networkidle' });
await page.waitForSelector('text=4-week trend', { timeout: 5000 });
await page.waitForTimeout(300);
await page.screenshot({ path: `${DIR}/v4-06b-agency-detail.png`, fullPage: true });

await page.goto('http://localhost:5173/overview', { waitUntil: 'networkidle' });
await page.waitForSelector('text=Operational Summary', { timeout: 5000 });
await page.getByRole('link', { name: /Allocation alerts/ }).click();
await page.waitForSelector('text=61 agencies', { timeout: 5000 });
await page.waitForTimeout(300);
await page.screenshot({ path: `${DIR}/v4-07b-review-queue.png`, fullPage: true });

await page.setViewportSize({ width: 480, height: 1000 });
await page.goto('http://localhost:5173/agencies', { waitUntil: 'networkidle' });
await page.waitForSelector('text=61 agencies', { timeout: 5000 });
await page.waitForTimeout(300);
await page.screenshot({ path: `${DIR}/v4-09b-agencies-mobile.png`, fullPage: true });

console.log('errors', errors);
await browser.close();
