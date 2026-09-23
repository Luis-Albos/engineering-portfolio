const {chromium}=require('playwright');
const assert=require('node:assert/strict'),path=require('node:path'),os=require('node:os');
(async()=>{
 const {server,base}=await require('./browser-test-server.cjs')();
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try {
  const ctx=await browser.newContext({viewport:{width:1672,height:941}});
  const p=await ctx.newPage();const errors=[],requests=[];
  p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text())});p.on('request',r=>requests.push(r.url()));
  await p.goto(base);
  assert.equal(await p.locator('html').getAttribute('data-boot'),'playing');
  await p.waitForFunction(()=>document.querySelector('.boot-cinematic').dataset.state==='AUTHENTICATING');
  await p.screenshot({path:path.join(os.tmpdir(),'alephon-verification.png')});
  await p.waitForFunction(()=>document.querySelector('.boot-cinematic').dataset.state==='CHECK');
  await p.screenshot({path:path.join(os.tmpdir(),'alephon-check.png')});
  await p.waitForFunction(()=>!document.documentElement.dataset.boot);
  assert.equal(await p.locator('html').getAttribute('data-view'),'landing');
  assert.equal(await p.evaluate(()=>sessionStorage.getItem('alephonIntroSeen')),'1');
  await p.waitForSelector('.has-webgl canvas');
  await p.screenshot({path:path.join(os.tmpdir(),'alephon-landing-desktop.png')});
  await p.keyboard.press('ArrowRight');assert.ok(!p.url().includes('#page='),'viewer keys inactive on landing');
  const before=await p.evaluate(()=>({header:document.querySelector('.site-header').getBoundingClientRect().toJSON(),rail:document.querySelector('.landing-rail').getBoundingClientRect().toJSON()}));
  await p.locator('.open-portfolio').focus();await p.keyboard.press('Enter');
  await p.waitForTimeout(300);
  assert.equal(await p.locator('html').getAttribute('data-view'),'opening');
  assert.equal((await p.locator('.site-header').boundingBox()).y,before.header.y);
  assert.equal((await p.locator('.portfolio-sidebar').boundingBox()).width,before.rail.width);
  await p.screenshot({path:path.join(os.tmpdir(),'alephon-morph.png')});
  await p.waitForFunction(()=>document.documentElement.dataset.view==='viewer');
  assert.equal(await p.locator('.wyvern-canvas canvas').count(),0,'renderer disposed after entry');
  assert.equal(await p.evaluate(()=>document.activeElement.id),'portfolio-viewer');
  await p.locator('.next-button').click();assert.ok(p.url().endsWith('#page=2'));
  await p.locator('.portfolio-sidebar .search-button').click();await p.locator('#search-input').fill('23');
  await p.locator('.search-result').first().click();assert.equal(await p.locator('#page-input').inputValue(),'23');
  await p.locator('.portfolio-sidebar .thumbnails-button').click();await p.locator('.thumbnail-button[data-page="8"]').click();assert.equal(await p.locator('#page-input').inputValue(),'8');
  await p.locator('.portfolio-sidebar .fullscreen-button').click();await p.waitForFunction(()=>!!document.fullscreenElement);
  await p.evaluate(()=>document.exitFullscreen());
  await p.locator('[data-home]').click();await p.waitForFunction(()=>document.documentElement.dataset.view==='landing');
  assert.equal(await p.locator('html').getAttribute('data-boot'),null);
  await p.locator('.primary-nav [data-open-portfolio]').click();await p.waitForTimeout(100);
  await p.locator('[data-home]').click();await p.waitForSelector('.has-webgl canvas');
  await p.waitForTimeout(600);assert.equal(await p.locator('html').getAttribute('data-view'),'landing');
  await p.locator('.primary-nav [data-open-portfolio]').click();await p.waitForTimeout(50);
  // A direct hash during an in-flight morph must finish, never strand the shell.
  await p.evaluate(()=>location.hash='page=10');await p.waitForFunction(()=>document.documentElement.dataset.view==='viewer');
  assert.equal(await p.locator('#page-input').inputValue(),'10');
  await p.goBack();await p.goBack();await p.waitForFunction(()=>document.documentElement.dataset.view==='landing');
  await p.goForward();await p.waitForFunction(()=>document.documentElement.dataset.view==='viewer');
  await p.goto(base);assert.equal(await p.locator('html').getAttribute('data-boot'),null);
  await p.reload();assert.equal(await p.locator('html').getAttribute('data-view'),'landing');
  for(const [text,url] of [['Resume','**/resume.html'],['Resources','**/resources/']]) {
   await p.locator('.primary-nav a').filter({hasText:text}).click();await p.waitForURL(url);
   assert.deepEqual(await p.locator('.primary-nav a').allTextContents(),['Portfolio','Resume','Resources']);
   assert.deepEqual(await p.locator('.mobile-primary-nav a').allTextContents(),['Portfolio','Resume','Resources']);
   await p.locator('.primary-nav a').filter({hasText:'Portfolio'}).click();await p.waitForURL('**/index.html#portfolio-viewer');
   assert.equal(await p.locator('html').getAttribute('data-view'),'viewer');await p.goto(base);
  }
  for(const [width,height] of [[390,844],[320,740],[768,1024],[1366,768]]) {
   await p.setViewportSize({width,height});await p.goto(base);await p.waitForTimeout(500);
   assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`no horizontal overflow at ${width}`);
   assert.ok(await p.locator('.open-portfolio').isVisible());
   await p.screenshot({path:path.join(os.tmpdir(),`alephon-${width}.png`)});
   if(width===390){await p.locator('#menu-button').click();await p.locator('#mobile-drawer .chapter-link[data-page="23"]').click();await p.waitForFunction(()=>document.documentElement.dataset.view==='viewer');assert.equal(await p.locator('#page-input').inputValue(),'23');}
  }
  assert.equal(await p.locator('#about').count(),1);assert.equal(await p.locator('#contact .email-link').count(),1);
  assert.equal(await p.locator('a').filter({hasText:/github|view source|repository|fork/i}).count(),0);
  assert.deepEqual(errors,[]);
  assert.ok(!requests.some(url=>/\.(?:STEP|SLDASM|STL)(?:\?|$)/i.test(url)));
  await ctx.close();
  // Fresh deep links must avoid all Three.js/model downloads and cinematic state.
  for(const page of [10,23]) {
   const c=await browser.newContext();const p=await c.newPage(),network=[];p.on('request',r=>network.push(r.url()));await p.goto(base+`#page=${page}`);
   assert.equal(await p.locator('#page-input').inputValue(),String(page));assert.equal(await p.locator('html').getAttribute('data-boot'),null);
   assert.equal(await p.locator('html').getAttribute('data-view'),'viewer');assert.ok(!network.some(u=>/three|landing-scene|CP1_2024.glb/.test(u)));await c.close();
  }
  // Exercise Skip in every timeline state using the browser's clock, not production hooks.
  for(const [at,state] of [[0,'BLACK'],[450,'BOOT'],[1200,'INITIALIZE'],[2250,'RESET'],[2550,'BRAND'],[3300,'LOADING'],[4450,'VERIFY'],[5200,'AUTHENTICATING'],[6800,'VERIFIED'],[7200,'CHECK'],[7800,'LANDING']]) {
   const c=await browser.newContext();const p=await c.newPage();await p.clock.install();await p.goto(base);await p.clock.fastForward(at+50);
   await p.locator('.boot-skip').click({force:true});assert.equal(await p.locator('html').getAttribute('data-view'),'landing');assert.equal(await p.locator('html').getAttribute('data-boot'),null);
   await p.clock.fastForward(10000);assert.equal(await p.locator('html').getAttribute('data-view'),'landing');await c.close();
  }
  for(const failure of ['webgl','library','slow']) {
   const c=await browser.newContext();await c.addInitScript(()=>sessionStorage.setItem('alephonIntroSeen','1'));const p=await c.newPage();
   if(failure==='webgl')await p.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return /webgl/.test(type)?null:original.call(this,type,...args)}});
   if(failure==='library')await p.route('**/assets/vendor/three/**',r=>r.abort());
   if(failure==='slow')await p.route('**/CP1_2024.glb*',async r=>{await new Promise(resolve=>setTimeout(resolve,2500));try{await r.continue()}catch(_){}});
   await p.goto(base);await p.locator('.open-portfolio').click();await p.waitForFunction(()=>document.documentElement.dataset.view==='viewer');await p.waitForTimeout(400);
   assert.equal(await p.locator('.wyvern-canvas canvas').count(),0);await p.locator('.next-button').click();assert.equal(await p.locator('#page-input').inputValue(),'2');await c.close();
  }
  const reduced=await browser.newContext({reducedMotion:'reduce'});const rp=await reduced.newPage();await rp.goto(base);await rp.waitForFunction(()=>!document.documentElement.dataset.boot);await rp.locator('.open-portfolio').click();await rp.waitForFunction(()=>document.documentElement.dataset.view==='viewer');await reduced.close();
  console.log('PASS: full cinematic, every Skip stage, session/refresh, shared-shell morph, Back/Forward, deep links/no Three downloads, responsive layouts, search/thumbnails/fullscreen, reduced motion, WebGL/library/slow-mesh fallback, resource disposal and static project-base paths.');
 }finally{await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
