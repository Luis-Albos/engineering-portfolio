const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const os = require('node:os');
(async () => {
  const started = performance.now();
  const { server, base } = await require('./browser-test-server.cjs')();
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const page = await browser.newPage();
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    for (const [width, height, layout] of [[1920,1080,'double'],[2560,1440,'double'],[3440,1440,'double'],[1366,768,'single'],[1490,1080,'single'],[1494,1080,'double'],[1920,480,'single'],[390,844,'single'],[320,740,'single']]) {
      console.log(`Checking ${width}x${height}: ${layout}`);
      await page.setViewportSize({ width, height }); await page.goto(base + '#page=5'); await page.reload();
      await page.waitForFunction(layout => document.querySelector('#portfolio-viewer').dataset.layout === layout && document.querySelector('#image-frame').dataset.displayedPages === (layout === 'double' ? '4,5' : '5') && document.querySelector('#portfolio-viewer').getAttribute('aria-busy') === 'false', layout);
      await page.waitForFunction(() => document.documentElement.scrollWidth <= innerWidth && document.querySelector('#image-frame').getBoundingClientRect().width <= document.querySelector('.sheet-space').getBoundingClientRect().width + 1);
      const observation = await page.evaluate(() => {
        const frame = document.querySelector('#image-frame').getBoundingClientRect();
        const space = document.querySelector('.sheet-space').getBoundingClientRect();
        return { overflow: document.documentElement.scrollWidth > innerWidth, frame: frame.toJSON(), space: space.toJSON(), images: [...document.querySelectorAll('.stf__item')].filter(sheet => getComputedStyle(sheet).display !== 'none').map(sheet => {
          const image = sheet.querySelector('img'), rect = sheet.getBoundingClientRect();
          return { ratio: rect.width / rect.height, fit: getComputedStyle(image).objectFit, natural: image.naturalWidth / image.naturalHeight };
        }) };
      });
      assert.equal(observation.overflow, false, `no overflow ${width}x${height}`);
      assert.ok(observation.frame.width <= observation.space.width + 1);
      assert.ok(observation.frame.height <= observation.space.height + 1);
      assert.equal(observation.images.length, layout === 'double' ? 2 : 1);
      for (const image of observation.images) { assert.equal(image.fit, 'contain'); assert.ok(Math.abs(image.ratio - 3507/2481) < .01); assert.equal(image.natural, 3507/2481); }
      for (const selector of ['.chapters-button','.previous-button','.next-button','.detail-button','[data-view-mode=double]']) {
        const box = await page.locator(selector).boundingBox(); assert.ok(box.width >= 44 && box.height >= 44, selector);
      }
      await page.locator('[data-view-mode=double]').click();
      await page.waitForFunction(() => document.querySelector('#image-frame').dataset.displayedPages === '4,5');
      assert.equal(await page.locator('#page-input').inputValue(), '5');
      await page.screenshot({ path: path.join(os.tmpdir(), `flipbook-layout-${width}x${height}.png`) });
    }
    await page.setViewportSize({ width: 1920, height: 1080 }); await page.goto(base + '#page=1');
    await page.waitForFunction(() => document.querySelector('#image-frame').dataset.displayedPages === '1');
    const box = await page.locator('#image-frame').boundingBox(); assert.ok(Math.abs(box.x + box.width / 2 - 960) < 1, 'cover centered');
    await page.locator('.next-button').click(); await page.waitForFunction(() => document.querySelector('#image-frame').dataset.displayedPages === '2,3');
    await page.evaluate(() => { location.hash = 'page=30'; }); await page.waitForFunction(() => document.querySelector('#image-frame').dataset.displayedPages === '30,31');
    assert.ok(await page.locator('.next-button').isDisabled()); await page.locator('#page-input').blur(); await page.keyboard.press('ArrowRight');
    assert.equal(await page.locator('#page-input').inputValue(), '30', 'no phantom final spread'); assert.deepEqual(errors, []);
    console.log(`PASS layout: actual landscape fit, Auto cutoff/height, manual modes, phone hit areas, cover/final boundary (${((performance.now()-started)/1000).toFixed(1)} s)`);
  } finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); process.exitCode = 1; });
