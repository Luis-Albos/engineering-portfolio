const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');

async function run(){
 const {server,base}=await require('./browser-test-server.cjs')();
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const started=Date.now();
 try{
  // A cold landing paints an accessible, static-theme loader, then uses the real first frame.
  const context=await browser.newContext({viewport:{width:1586,height:992}});
  const page=await context.newPage();const errors=[],modelRequests=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('request',request=>{if(request.url().includes('CP1_2024.glb'))modelRequests.push(request.url())});
  await page.addInitScript(()=>{window.bootReasons=[];window.addEventListener('alephon:complete',e=>{window.bootReasons.push(e.detail.reason);window.revealAt=performance.now();});});
  await page.goto(base,{waitUntil:'domcontentloaded'});
  assert.equal(await page.locator('html').getAttribute('data-boot'),'playing');
  assert.equal((await page.locator('.boot-caption').textContent()).trim(),"loading luis' portfolio...");
  assert.equal(await page.locator('.boot-skip').count(),0);
  assert.equal(await page.locator('.boot-cinematic').getAttribute('role'),'status');
  await page.waitForFunction(()=>!document.documentElement.dataset.boot&&document.querySelector('.landing-stage').dataset.scene==='ready',null,{timeout:30000});
  assert.deepEqual(await page.evaluate(()=>window.bootReasons),['ready']);
  assert.equal(modelRequests.length,1);assert.ok(modelRequests[0].includes('.glb.gz'),'compressed model is preferred');
  await page.waitForFunction(()=>navigator.serviceWorker.controller,null,{timeout:15000});
  await page.waitForFunction(async()=>{const cache=await caches.open('luis-albos-engineering-portfolio-assets-'+document.documentElement.dataset.build);return !!(await cache.match(new URL('reference/CP1_2024.glb.gz?v='+document.documentElement.dataset.build,document.baseURI).href));},null,{timeout:15000});
  await page.waitForFunction(async()=>{const cache=await caches.open('luis-albos-engineering-portfolio-assets-'+document.documentElement.dataset.build);return !!(await cache.match(new URL('assets/portfolio/page-01.webp?v='+document.documentElement.dataset.build,document.baseURI).href));},null,{timeout:15000});
  assert.ok(await page.evaluate(()=>performance.getEntriesByType('resource').filter(r=>/assets\/portfolio\/page-\d+\.webp/.test(r.name)).every(r=>r.startTime>=window.revealAt)),'portfolio pages wait until landing reveal');
  await page.evaluate(()=>window.firstCanvas=document.querySelector('.scene-canvas canvas'));
  await page.locator('.open-portfolio').click();
  await page.waitForFunction(()=>document.documentElement.dataset.view==='viewer');
  assert.equal(await page.locator('.scene-canvas canvas').count(),1,'viewer retains canvas');
  assert.equal(await page.locator('#portfolio-viewer').evaluate(el=>document.activeElement===el),true);
  await page.locator('.next-button').click();assert.equal(await page.locator('#page-input').inputValue(),'2');
  await page.locator('[data-home]').click();
  await page.waitForFunction(()=>document.documentElement.dataset.view==='landing');
  assert.ok(await page.evaluate(()=>window.firstCanvas===document.querySelector('.scene-canvas canvas')),'same canvas resumes');
  assert.equal(modelRequests.length,1,'return makes no model request');
  const pdfs=await page.evaluate(async()=>{
   const manifest=await (await fetch('assets/study-manifest.json')).json();
   const paths=['assets/portfolio/Luis_Albos_Resume.pdf',manifest.classes.flatMap(c=>c.documents).find(d=>d.path.includes('MXET 300 Final')).path];
   return Promise.all(paths.map(async file=>{const response=await fetch(new URL(file,document.baseURI),{headers:{Range:'bytes=0-1023'}});return {status:response.status,range:response.headers.get('Content-Range'),size:(await response.arrayBuffer()).byteLength};}));
  });
  for(const pdf of pdfs){assert.equal(pdf.status,206);assert.match(pdf.range,/^bytes 0-1023\//);assert.equal(pdf.size,1024);}
  await page.goto(new URL('resume.html',base).href,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('#resume-pdf')?.data?.includes('.pdf'));
  assert.ok((await page.locator('a[download].resume-asset-link').getAttribute('href')).includes('Luis_Albos_Resume.pdf'));
  await page.evaluate(()=>sessionStorage.setItem('luis-albos-study-archive-access','true'));
  await page.goto(new URL('resources/viewer.html?doc=mxet-300-mechatronics-1--mxet-300-final-cheat-sheet-v2',base).href,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('#study-pdf')?.data?.includes('.pdf'));
  const studyOpen=await page.locator('#viewer-open').getAttribute('href');
  assert.ok(studyOpen.includes('MXET%20300%20Final%20Cheat%20Sheet%20v2.pdf'));
  assert.equal(await page.evaluate(async href=>(await fetch(href,{headers:{Range:'bytes=0-31'}})).status,studyOpen),206);
  assert.deepEqual(errors,[]);await context.close();

  // A new browser process with the same profile reuses the cached model bytes.
  const profile=fs.mkdtempSync(path.join(os.tmpdir(),'portfolio-cache-'));
  let persistent=null;
  try{
   persistent=await chromium.launchPersistentContext(profile,{channel:'chrome',headless:true});
   let p=persistent.pages()[0]||await persistent.newPage();let requests=0;
   p.on('request',r=>{if(r.url().includes('CP1_2024.glb'))requests++});
   await p.goto(base);await p.waitForFunction(()=>document.querySelector('.landing-stage').dataset.scene==='ready',null,{timeout:30000});
   await p.waitForFunction(()=>navigator.serviceWorker.controller,null,{timeout:15000});
   await p.waitForFunction(async()=>{const cache=await caches.open('luis-albos-engineering-portfolio-assets-'+document.documentElement.dataset.build);return !!(await cache.match(new URL('reference/CP1_2024.glb.gz?v='+document.documentElement.dataset.build,document.baseURI).href));});
   await p.waitForFunction(async()=>{const cache=await caches.open('luis-albos-engineering-portfolio-assets-'+document.documentElement.dataset.build);return !!(await cache.match(new URL('assets/portfolio/page-01.webp?v='+document.documentElement.dataset.build,document.baseURI).href));},null,{timeout:15000});
   await p.waitForTimeout(500);
   assert.ok(await p.evaluate(async()=>{const cache=await caches.open('luis-albos-engineering-portfolio-assets-'+document.documentElement.dataset.build);return !!(await cache.match(new URL('assets/portfolio/page-01.webp?v='+document.documentElement.dataset.build,document.baseURI).href));}));
   assert.equal(requests,1);await persistent.close();persistent=null;
   persistent=await chromium.launchPersistentContext(profile,{channel:'chrome',headless:true});
   p=persistent.pages()[0]||await persistent.newPage();requests=0;
   p.on('request',r=>{if(r.url().includes('CP1_2024.glb'))requests++});
   await p.goto(base);await p.waitForFunction(()=>document.querySelector('.landing-stage').dataset.scene==='ready',null,{timeout:30000});
   assert.equal(requests,0,'model bytes persist across browser restart');
   assert.ok(await p.evaluate(async()=>{const cache=await caches.open('luis-albos-engineering-portfolio-assets-'+document.documentElement.dataset.build);return !!(await cache.match(new URL('assets/portfolio/page-01.webp?v='+document.documentElement.dataset.build,document.baseURI).href));}),'background page persists across restart');
   await p.evaluate(async()=>{const cache=await caches.open('luis-albos-engineering-portfolio-assets-'+document.documentElement.dataset.build);await cache.delete(new URL('assets/portfolio/page-01.webp?v='+document.documentElement.dataset.build,document.baseURI).href);});
   await p.reload();
   await p.waitForFunction(async()=>{const cache=await caches.open('luis-albos-engineering-portfolio-assets-'+document.documentElement.dataset.build);return !!(await cache.match(new URL('assets/portfolio/page-01.webp?v='+document.documentElement.dataset.build,document.baseURI).href));},null,{timeout:15000});
   const nextBuild=await p.evaluate(async()=>{
    document.documentElement.dataset.build='test-next-build';
    const {fetchModel}=await import('./js/asset-cache.js?v=test-next-build');
    const bytes=await fetchModel(new URL('reference/CP1_2024.glb?v=test-next-build',document.baseURI).href);
    return {size:bytes.byteLength,cache:(await caches.keys()).includes('luis-albos-engineering-portfolio-assets-test-next-build')};
   });
   assert.equal(nextBuild.size,36105032);assert.ok(nextBuild.cache);
   assert.equal(requests,1,'a new build requests new model bytes');
   await persistent.close();persistent=null;
  }finally{if(persistent)await persistent.close();try{fs.rmSync(profile,{recursive:true,force:true,maxRetries:10,retryDelay:200});}catch(error){console.warn(`Profile cleanup deferred: ${error.code}`);}}

  const deep=await browser.newPage();const deepRequests=[];deep.on('request',r=>deepRequests.push(r.url()));
  await deep.goto(base+'#page=10');
  assert.equal(await deep.locator('html').getAttribute('data-boot'),null);
  assert.equal(await deep.locator('#page-input').inputValue(),'10');
  assert.ok(!deepRequests.some(url=>/CP1_2024\.glb|landing-scene\.js/.test(url)));
  const uncachedRange=await deep.evaluate(async()=>{const response=await fetch('assets/portfolio/Luis_Albos_Resume.pdf',{headers:{Range:'bytes=0-15'}});return [response.status,(await response.arrayBuffer()).byteLength];});
  assert.deepEqual(uncachedRange,[206,16]);
  await deep.close();
  const fallback=await browser.newContext();
  await fallback.addInitScript(()=>{
   Object.defineProperty(window,'caches',{get(){throw new Error('storage denied')}});
   Object.defineProperty(window,'DecompressionStream',{value:undefined,configurable:true});
  });
  const fp=await fallback.newPage(),fallbackRequests=[];
  fp.on('request',r=>{if(r.url().includes('CP1_2024.glb'))fallbackRequests.push(r.url())});
  await fp.goto(base);await fp.waitForFunction(()=>document.querySelector('.landing-stage').dataset.scene==='ready',null,{timeout:30000});
  assert.equal(fallbackRequests.length,1);assert.ok(fallbackRequests[0].includes('.glb?v='));
  await fallback.close();
  const reduced=await browser.newContext({reducedMotion:'reduce'});const rp=await reduced.newPage();
  await rp.goto(base,{waitUntil:'domcontentloaded'});
  assert.equal(await rp.locator('.boot-ring').evaluate(el=>getComputedStyle(el).animationName),'none');
  await reduced.close();
  console.log(`PASS functional loader, scene reuse, browser restart cache, PDF ranges, deep link, reduced motion (${((Date.now()-started)/1000).toFixed(1)} s)`);
 }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
}
if(require.main===module)run().catch(error=>{console.error(error);process.exitCode=1});
module.exports=run;
