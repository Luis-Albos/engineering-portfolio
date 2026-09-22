const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const root = path.resolve(__dirname, '..');
const server = http.createServer((req, res) => {
  let file = decodeURIComponent(new URL(req.url, 'http://localhost').pathname).replace(/^\/engineering-portfolio\//, '');
  if (!file || file.endsWith('/')) file += 'index.html';
  const target = path.resolve(root, file);
  if (!target.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  fs.readFile(target, (err, data) => {
    if (err) { res.writeHead(404).end(); return; }
    res.setHeader('Content-Type', ({'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.pdf':'application/pdf'})[path.extname(file)] || 'application/octet-stream');
    res.end(data);
  });
});
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}/engineering-portfolio/`;
  const browser = await chromium.launch({headless:true, channel:process.env.TEST_BROWSER || 'msedge'});
  try {
    const page = await browser.newPage({viewport:{width:1440,height:1000}});
    const errors=[]; page.on('pageerror', e=>errors.push(e.message));
    const counts=new Map(); let failing=0;
    await page.route('**/assets/portfolio/*.webp', async route => {
      const n=Number(route.request().url().match(/page-(\d+)/)[1]);
      counts.set(n,(counts.get(n)||0)+1);
      await new Promise(r=>setTimeout(r, ({11:1000,12:800,13:200,15:650,16:900})[n] || 70));
      if (n===failing) await route.abort(); else await route.continue();
    });
    const requested=async n=>assert.equal(await page.locator('#page-input').inputValue(),String(n));
    const visible=async n=>page.waitForFunction(n=>{
      const img=[...document.querySelectorAll('.portfolio-page-image.is-loaded')].sort((a,b)=>Number(b.style.zIndex)-Number(a.style.zIndex))[0];
      return img?.src.endsWith(`page-${String(n).padStart(2,'0')}.webp`) && img.naturalWidth>0;
    },n);
    const jump=async n=>page.evaluate(n=>{location.hash=`page=${n}`},n);
    const spam=async (selector,count)=>page.evaluate(({selector,count})=>{for(let i=0;i<count;i++)document.querySelector(selector).click()}, {selector,count});
    await page.goto(base+'#page=10'); await visible(10);
    await page.waitForTimeout(100); assert.ok(counts.size <= 7, 'only nearby pages preload initially');
    await page.evaluate(()=>{
      window.fadeSamples=[];
      const sample=()=>{
        const imgs=[...document.querySelectorAll('.portfolio-page-image')];
        window.fadeSamples.push(imgs.some(i=>i.naturalWidth && Number(getComputedStyle(i).opacity)>=0.99));
        window.sampleFrame=requestAnimationFrame(sample);
      };sample();
    });
    await spam('.next-button',3); await requested(13); assert.ok(page.url().endsWith('#page=13'));
    assert.equal(await page.locator('.portfolio-sidebar .chapter-link.is-active').getAttribute('data-page'),'8');
    await visible(13); await page.waitForTimeout(1200); await visible(13);
    assert.ok(await page.evaluate(()=>{cancelAnimationFrame(window.sampleFrame);return window.fadeSamples.every(Boolean)}), 'no empty or dimmed frame during the fade');
    assert.equal(counts.get(11),1); assert.equal(counts.get(12),1); assert.equal(counts.get(13),1);
    assert.ok([10,11,12,14,15,16].every(n=>counts.has(n)));
    await spam('.previous-button',3); await requested(10); await visible(10);
    await page.evaluate(()=>{for(let i=0;i<9;i++)document.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',repeat:true,bubbles:true}));for(let i=0;i<4;i++)document.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowLeft',repeat:true,bubbles:true}))});
    await requested(15);
    await page.locator('.portfolio-sidebar .chapter-link[data-page="23"]').click(); await requested(23); await visible(23);
    await page.goBack(); await requested(15); await visible(15);
    await page.goForward(); await requested(23); await visible(23);
    failing=29; await jump(29); await page.locator('#page-fallback').waitFor({state:'visible'}); await requested(29); await visible(23);
    failing=0; await page.locator('#retry-page').click(); await visible(29); assert.equal(counts.get(29),2);
    await page.waitForTimeout(300);
    await page.screenshot({path:path.join(os.tmpdir(),'portfolio-desktop.png')});
    assert.deepEqual(errors,[]);
    for(const route of ['', 'resume.html', 'resources/']) {
      await page.goto(base+route);
      assert.deepEqual(await page.locator('.primary-nav a').allTextContents(),['Work','Resume','Resources']);
      assert.deepEqual(await page.locator('.mobile-primary-nav a').allTextContents(),['Work','Resume','Resources']);
      await page.setViewportSize({width:390,height:844});
      await page.locator('#menu-button').click(); await page.locator('.mobile-primary-nav').waitFor({state:'visible'});
      assert.equal(await page.locator('#mobile-drawer').getAttribute('aria-hidden'),'false');
      await page.locator('.drawer-close').click();
      if(!route){
        await visible(1); await spam('.next-button',5); await requested(6); await visible(6);
        await page.evaluate(()=>{const el=document.querySelector('#image-frame');for(const [type,x] of [['touchstart',300],['touchend',100]])el.dispatchEvent(new TouchEvent(type,{changedTouches:[new Touch({identifier:1,target:el,clientX:x,clientY:100})]}));});
        await requested(7); await visible(7);
        assert.equal(await page.locator('#about').count(),1); assert.equal(await page.locator('#contact .email-link').count(),1);
        await page.screenshot({path:path.join(os.tmpdir(),'portfolio-mobile.png')});
      }
      await page.setViewportSize({width:1440,height:1000});
    }
    await page.goto(base);
    await page.locator('.primary-nav a').filter({hasText:'Resume'}).click();
    await page.waitForURL('**/resume.html');
    const pdf=await page.locator('#resume-pdf').getAttribute('data');
    assert.equal((await page.request.get(new URL(pdf,page.url()).href)).status(),200);
    await page.locator('.primary-nav a').filter({hasText:'Resources'}).click();
    await page.waitForURL('**/resources/');
    await page.locator('.primary-nav a').filter({hasText:'Work'}).click();
    await page.waitForURL(base);
    // Test unsupported/rejected decoding and idle scheduling fallbacks.
    for(const mode of ['missing','reject','delayed']) {
      const ctx=await browser.newContext({reducedMotion:'reduce'});
      await ctx.addInitScript(mode=>{
        window.requestIdleCallback=undefined;window.cancelIdleCallback=undefined;
        if(mode==='missing') HTMLImageElement.prototype.decode=undefined;
        if(mode==='reject') HTMLImageElement.prototype.decode=()=>Promise.reject(new Error('decode'));
        if(mode==='delayed') {const decode=HTMLImageElement.prototype.decode;HTMLImageElement.prototype.decode=async function(){await decode.call(this); await new Promise(r=>setTimeout(r,this.src.includes('page-11')?800:10));};}
      },mode);
      const p=await ctx.newPage();await p.goto(base+'#page=10');
      await p.waitForFunction(()=>document.querySelector('.is-loaded')?.src?.endsWith('page-10.webp'));
      await p.locator('.next-button').click();await p.waitForTimeout(60);await p.locator('.next-button').click();
      await p.waitForFunction(()=>[...document.querySelectorAll('.portfolio-page-image.is-loaded')].some(i=>i.src.endsWith('page-12.webp')));
      await p.waitForTimeout(900);
      assert.ok(await p.locator('.portfolio-page-image.is-loaded').getAttribute('src').then(s=>s.endsWith('page-12.webp')));
      await ctx.close();
    }
    assert.deepEqual(errors,[]);
    console.log('PASS: out-of-order loads, immediate state/hash/chapter, cache deduplication, +/-3 preloads, button/key spam, direction changes, chapter jumps, history, errors/retry, mobile menus/swipe, all three routes, deep links, reduced motion, decode and idle fallbacks.');
  } finally { await browser.close(); server.close(); }
})().catch(e=>{console.error(e);server.close();process.exitCode=1});
