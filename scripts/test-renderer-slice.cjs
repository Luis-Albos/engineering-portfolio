const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');

(async () => {
  const started = performance.now();
  const { server, base } = await require('./browser-test-server.cjs')();
  const browser = await chromium.launch({ channel: process.env.TEST_BROWSER || 'chrome', headless: true });
  const output = path.join(os.tmpdir(), 'portfolio-flipbook-evidence');
  fs.mkdirSync(output, { recursive: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
    const errors = []; page.on('pageerror', error => { errors.push(error.message); console.log('BROWSER ERROR', error.message); });
    await page.goto(base + '#page=5');
    const shown = expected => page.waitForFunction(expected => document.querySelector('#image-frame')?.dataset.displayedPages === expected && document.querySelector('#portfolio-viewer')?.getAttribute('aria-busy') === 'false', expected);
    await shown('4,5');
    assert.equal(await page.locator('#portfolio-viewer').getAttribute('data-renderer'), 'page-flip');
    const contrast = await page.evaluate(() => {
      const luminance = color => color.match(/[\d.]+/g).slice(0,3).map(Number).map(c => c/255).map(c => c <= .04045 ? c/12.92 : ((c+.055)/1.055)**2.4).reduce((total,c,index) => total+c*[.2126,.7152,.0722][index],0);
      const ratio = (a,b) => { const x=luminance(a), y=luminance(b); return (Math.max(x,y)+.05)/(Math.min(x,y)+.05); };
      const background = getComputedStyle(document.body).backgroundColor;
      const caption = getComputedStyle(document.querySelector('.mode-caption'));
      const selected = getComputedStyle(document.querySelector('[aria-pressed=true]'));
      const next = getComputedStyle(document.querySelector('.next-button'));
      return { caption: ratio(caption.color,background), selected: ratio(selected.color,selected.backgroundColor), border: ratio(next.borderColor,background) };
    });
    assert.ok(contrast.caption >= 4.5 && contrast.selected >= 4.5 && contrast.border >= 3, JSON.stringify(contrast));
    await page.locator('[data-view-mode=single]').focus(); await page.keyboard.press('Tab');
    assert.ok(await page.locator('[data-view-mode=double]').evaluate(element => element.matches(':focus-visible') && parseFloat(getComputedStyle(element).outlineWidth) >= 2));
    await page.screenshot({ path: path.join(output, 'desktop-spread.png') });
    await page.waitForTimeout(200);
    const before = await page.locator('.page-turn-surface').getAttribute('data-draws');
    await page.waitForTimeout(200);
    assert.equal(await page.locator('.page-turn-surface').getAttribute('data-draws'), before, 'no idle drawing');
    await page.locator('[data-view-mode=single]').click(); await shown('5');
    await page.setViewportSize({ width: 390, height: 844 }); await shown('5');
    await page.locator('[data-view-mode=double]').click(); await shown('4,5');
    assert.equal(await page.locator('#page-input').inputValue(), '5');
    await page.screenshot({ path: path.join(output, 'phone-double.png') });
    await page.locator('[data-view-mode=auto]').click(); await shown('5');
    await page.screenshot({ path: path.join(output, 'phone-single.png') });
    await page.waitForFunction(() => document.querySelector('.portfolio-sheet[data-page="6"] img')?.naturalWidth > 0);
    const touch = await page.context().newCDPSession(page);
    async function swipe(direction, fraction) {
      const box = await page.locator('#image-frame').boundingBox();
      const x = direction > 0 ? box.x + box.width - 12 : box.x + 12;
      const y = box.y + box.height * .85;
      await touch.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
      for (let step=1;step<=14;step++) await touch.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x - direction * box.width * fraction * step / 14, y }] });
      await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await page.waitForFunction(() => document.querySelector('.page-turn-surface').dataset.turnState === 'read');
    }
    await swipe(1, .80); await shown('6');
    const cancelHistory = await page.evaluate(() => history.length);
    await swipe(1, .12); await shown('6');
    assert.equal(await page.evaluate(() => history.length), cancelHistory, 'short forward drag cancels');
    await swipe(-1, .80); await shown('5');
    const backHistory = await page.evaluate(() => history.length);
    await swipe(-1, .12); await shown('5');
    assert.equal(await page.evaluate(() => history.length), backHistory, 'short backward drag cancels');
    await touch.detach();
    await page.setViewportSize({ width: 1920, height: 1080 }); await shown('4,5');
    await page.locator('.next-button').click(); await shown('6,7');
    await page.waitForTimeout(90);
    await page.screenshot({ path: path.join(output, 'turn.png') });
    await page.waitForTimeout(650);
    await page.evaluate(() => { location.hash = 'page=23'; }); await shown('22,23');
    await page.screenshot({ path: path.join(output, 'dark-spread.png') });
    assert.deepEqual(errors, []);
    for (const failure of ['module', 'render']) {
      const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
      await context.addInitScript(() => {
        Element.prototype.requestFullscreen = async () => { throw new Error('Fullscreen declined'); };
        if (window.caches) caches.open = async () => { throw new Error('Storage unavailable'); };
      });
      const fallback = await context.newPage();
      const fallbackErrors = []; fallback.on('pageerror', error => fallbackErrors.push(error.message));
      await fallback.route('**/js/page-turn-renderer.js*', route => failure === 'module' ? route.abort() : route.fulfill({ contentType: 'text/javascript', body: 'export function createPageTurnRenderer(){return {settle(){},render(){throw new Error("Renderer failed")},dispose(){}}}' }));
      await fallback.goto(base + '#page=5');
      await fallback.waitForFunction(() => document.querySelector('#image-frame').dataset.displayedPages === '5');
      assert.equal(await fallback.locator('#portfolio-viewer').getAttribute('data-renderer'), 'fallback');
      await fallback.locator('.next-button').click();
      await fallback.waitForFunction(() => document.querySelector('#image-frame').dataset.displayedPages === '6');
      await fallback.locator('[data-view-mode=double]').click();
      await fallback.waitForFunction(() => document.querySelector('#image-frame').dataset.displayedPages === '6,7');
      await fallback.locator('.viewer-reading-tools .fullscreen-button').click();
      assert.deepEqual(fallbackErrors, []);
      await context.close();
    }
    console.log(`PASS renderer slice: real sheets, modes, resize/selection, native touch/cancellation, contrast/focus, renderer/storage/fullscreen recovery, idle (${((performance.now() - started) / 1000).toFixed(1)} s). Evidence: ${output}`);
  } finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); process.exitCode = 1; });
