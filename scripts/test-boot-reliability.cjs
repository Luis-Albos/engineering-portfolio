const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const {server,base}=await require('./browser-test-server.cjs')();
 let browser;
 try{
 browser=await chromium.launch({channel:'chrome',headless:true});
 // With every secondary request blocked, inline visuals and Skip still work.
 const isolated=await browser.newContext();const ip=await isolated.newPage();
 await ip.route('**/*',r=>r.request().isNavigationRequest()?r.continue():r.abort());
 await ip.goto(base,{waitUntil:'commit'});
 await ip.waitForFunction(()=>document.querySelector('.boot-cinematic')?.dataset.state==='BOOT');
 assert.ok(await ip.locator('.dot-logo').isVisible());
 assert.ok(await ip.locator('.boot-brand img').evaluate(e=>e.complete&&e.naturalWidth>0));
 await ip.locator('.boot-skip').click();
 assert.equal(await ip.locator('html').getAttribute('data-boot'),null);
 assert.equal(await ip.evaluate(()=>document.querySelector('.boot-cinematic').getAnimations({subtree:true}).length),0);
 await isolated.close();console.log('PASS reliability: HTML-only intro and Skip');
 const expected=['BLACK','BOOT','INITIALIZE','RESET','BRAND','LOADING','VERIFY','AUTHENTICATING','VERIFIED','CHECK','LANDING','COMPLETE'];
 for(const scenario of (process.argv.includes('--html-only')?[]:['stall','slow3g','cpu','module','three','glb','gpu','webgl'])){
  const ctx=await browser.newContext();const p=await ctx.newPage();const requests=[];
  p.on('request',r=>requests.push(r.url()));
  await p.addInitScript(()=>{
   window.bootStates=[];
   new MutationObserver(records=>{for(const r of records)if(r.target.matches?.('.boot-cinematic')&&r.attributeName==='data-state')window.bootStates.push({state:r.target.dataset.state,time:performance.now()});}).observe(document,{subtree:true,attributes:true,attributeFilter:['data-state']});
  });
  if(scenario==='module')await p.route('**/js/experience.js*',async r=>{await new Promise(resolve=>setTimeout(resolve,11000));await r.continue().catch(()=>{});});
  if(['three','glb','gpu'].includes(scenario)){
   const pattern=scenario==='three'?'**/assets/vendor/three/three.module.min.js*':scenario==='glb'?'**/CP1_2024.glb*':'**/js/landing-scene.js*';
   await p.route(pattern,async r=>{await new Promise(resolve=>setTimeout(resolve,7200));await r.continue().catch(()=>{});});
  }
  if(scenario==='gpu')await p.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){if(/webgl/.test(type)){const end=performance.now()+800;while(performance.now()<end){}}return original.call(this,type,...args);};});
  if(scenario==='webgl')await p.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return /webgl/.test(type)?null:original.call(this,type,...args);};});
  const cdp=await ctx.newCDPSession(p);
  if(scenario==='cpu')await cdp.send('Emulation.setCPUThrottlingRate',{rate:6});
  if(scenario==='slow3g')await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:400,downloadThroughput:50000,uploadThroughput:20000});
  await p.goto(base,{waitUntil:'commit'});
  await p.waitForFunction(()=>document.querySelector('.boot-cinematic')?.dataset.state==='BOOT');
  assert.ok(!requests.some(u=>/landing-scene|three.module|CP1_2024/.test(u)),'no scene network during intro');
  if(scenario==='stall'){
   await p.evaluate(()=>{const end=performance.now()+800;while(performance.now()<end){}});
   assert.equal(await p.locator('.boot-cinematic').getAttribute('data-state'),'BOOT');
  }
  await p.waitForFunction(()=>document.querySelector('.boot-cinematic')?.dataset.state==='COMPLETE',null,{timeout:30000});
  const states=await p.evaluate(()=>window.bootStates);
  assert.deepEqual(states.map(x=>x.state),expected);
  if(scenario==='stall')assert.ok(states.find(x=>x.state==='INITIALIZE').time-states.find(x=>x.state==='BOOT').time>=1400);
  assert.equal(await p.locator('html').getAttribute('data-boot'),null);
  assert.equal(await p.evaluate(()=>document.querySelector('.boot-cinematic').getAnimations({subtree:true}).length),0);
  assert.ok(await p.locator('.open-portfolio').isVisible());
  if(['three','glb','gpu'].includes(scenario)){
   await p.waitForFunction(()=>document.querySelector('.landing-stage').dataset.scene==='fallback');
   assert.equal(await p.locator('.wyvern-fallback').evaluate(e=>getComputedStyle(e).opacity),'1');
   await p.waitForSelector('.has-webgl canvas',{timeout:30000});
   await p.waitForTimeout(250);
   assert.equal(await p.locator('.wyvern-canvas').evaluate(e=>getComputedStyle(e).opacity),'1');
  }
  if(scenario==='webgl'){
   await p.waitForFunction(()=>document.querySelector('.landing-stage').dataset.scene==='fallback');
   assert.equal(await p.locator('.has-webgl').count(),0);
  }
  console.log('PASS reliability:',scenario);await ctx.close();
 }
 }finally{await browser?.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
