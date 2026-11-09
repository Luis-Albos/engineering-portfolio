const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

(async () => {
  const started = performance.now();
  const { server, base } = process.env.TEST_BASE
    ? { server: null, base: process.env.TEST_BASE }
    : await require('./browser-test-server.cjs')();
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const output = path.join(os.tmpdir(), 'portfolio-continuity');
  fs.mkdirSync(output, { recursive: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    await page.goto(base + '#page=5');
    await page.locator('[data-view-mode=double]').click();
    await page.waitForFunction(() => document.querySelector('#image-frame').dataset.displayedPages === '4,5' && document.querySelector('#portfolio-viewer').getAttribute('aria-busy') === 'false');
    await page.waitForTimeout(350);
    await page.evaluate(() => {
      window.continuitySamples = [];
      const sample = () => {
        const surface = document.querySelector('.page-turn-surface');
        const frame = document.querySelector('#image-frame').getBoundingClientRect();
        const visible = [...surface.querySelectorAll('img')].filter(image => {
          const box = image.getBoundingClientRect();
          return image.complete && image.naturalWidth > 0 && box.width > 1 && box.height > 1;
        });
        const covered = [.25, .75].every(fraction => visible.some(image => {
          const rect = image.getBoundingClientRect(), x = frame.x + frame.width * fraction, y = frame.y + frame.height / 2;
          return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
        }));
        window.continuitySamples.push({ time: performance.now(), state: surface.dataset.turnState, visible: visible.map(image => image.dataset.page), covered, draws: surface.dataset.draws });
        window.continuityRaf = requestAnimationFrame(sample);
      };
      sample();
    });
    for (const selector of ['.next-button', '.previous-button']) {
      await page.locator(selector).click(); await page.waitForTimeout(650);
    }
    await page.locator('[data-view-mode=single]').click();
    await page.waitForFunction(() => document.querySelector('#image-frame').dataset.displayedPages === '4');
    for (const selector of ['.next-button', '.previous-button']) {
      await page.locator(selector).click(); await page.waitForTimeout(650);
    }
    const samples = await page.evaluate(() => { cancelAnimationFrame(window.continuityRaf); return window.continuitySamples; });
    fs.writeFileSync(path.join(output, 'frames.json'), JSON.stringify(samples, null, 2));
    assert.ok(samples.some(frame => frame.state === 'flipping'), 'sampled active turns');
    const blank = samples.filter(frame => frame.visible.length === 0 || frame.state === 'read' && !frame.covered);
    assert.deepEqual(errors, []);
    assert.equal(blank.length, 0, `blank painted-frame opportunity: ${JSON.stringify(blank)}; evidence ${output}`);
    console.log(`PASS page-turn continuity: ${samples.length} animation-frame samples across forward/backward Single/Double turns (${((performance.now()-started)/1000).toFixed(2)} s)`);
  } finally { await browser.close(); if (server) await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); process.exitCode = 1; });
