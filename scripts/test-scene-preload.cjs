const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const {server,base}=await require('./browser-test-server.cjs')();const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const late=await browser.newPage();await late.clock.install();let release;const gate=new Promise(resolve=>release=resolve);let requests=0;
  let backgroundStarted;const backgroundRequest=new Promise(resolve=>backgroundStarted=resolve);
  late.on('request',request=>{if(request.url().includes('study-manifest.json'))backgroundStarted();});
  await late.addInitScript(()=>{window.bootReasons=[];window.addEventListener('alephon:complete',e=>window.bootReasons.push(e.detail.reason));});
  await late.route('**/CP1_2024.glb*',async route=>{requests++;await gate;await route.continue().catch(()=>{});});
  await late.goto(base,{waitUntil:'domcontentloaded'});await late.waitForRequest('**/CP1_2024.glb*');
  await late.clock.fastForward(15050);
  await late.waitForFunction(()=>!document.documentElement.dataset.boot);
  assert.deepEqual(await late.evaluate(()=>window.bootReasons),['timeout']);
  assert.ok(await late.locator('.open-portfolio').isVisible());
  await Promise.race([backgroundRequest,new Promise((_,reject)=>setTimeout(()=>reject(new Error('Background preload did not start after timeout')),10000))]);
  release();await late.waitForFunction(()=>document.querySelector('.landing-stage').dataset.scene==='ready',null,{timeout:30000});
  assert.equal(requests,1);assert.deepEqual(await late.evaluate(()=>window.bootReasons),['timeout']);await late.close();

  const failure=await browser.newPage();await failure.addInitScript(()=>{window.bootReasons=[];window.addEventListener('alephon:complete',e=>window.bootReasons.push(e.detail.reason));});
  await failure.route('**/CP1_2024.glb*',route=>route.abort());await failure.goto(base);
  await failure.waitForFunction(()=>document.querySelector('.landing-stage').dataset.scene==='unavailable');
  assert.equal(await failure.locator('html').getAttribute('data-boot'),null);
  assert.deepEqual(await failure.evaluate(()=>window.bootReasons),['failed']);
  await failure.locator('.open-portfolio').click();await failure.waitForFunction(()=>document.documentElement.dataset.view==='viewer');
  await failure.locator('[data-home]').click();await failure.waitForFunction(()=>document.documentElement.dataset.view==='landing');
  await failure.close();
  const loss=await browser.newPage();await loss.goto(base);
  await loss.waitForFunction(()=>document.querySelector('.landing-stage').dataset.scene==='ready',null,{timeout:30000});
  await loss.locator('.scene-canvas canvas').evaluate(canvas=>canvas.dispatchEvent(new Event('webglcontextlost',{cancelable:true})));
  await loss.waitForFunction(()=>document.querySelector('.landing-stage').dataset.scene==='unavailable');
  assert.equal(await loss.locator('.scene-canvas canvas').count(),0);
  await loss.locator('.open-portfolio').click();await loss.waitForFunction(()=>document.documentElement.dataset.view==='viewer');
  await loss.locator('[data-home]').click();
  await loss.waitForFunction(()=>document.querySelector('.landing-stage').dataset.scene==='ready',null,{timeout:30000});
  await loss.close();
  const compressedMissing=await browser.newPage();const fallbackRequests=[];
  compressedMissing.on('request',r=>{if(r.url().includes('CP1_2024.glb'))fallbackRequests.push(r.url())});
  await compressedMissing.route('**/CP1_2024.glb.gz*',route=>route.abort());
  await compressedMissing.goto(base);
  await compressedMissing.waitForFunction(()=>document.querySelector('.landing-stage').dataset.scene==='ready',null,{timeout:30000});
  assert.equal(fallbackRequests.length,2);assert.ok(fallbackRequests[1].includes('.glb?v='));
  await compressedMissing.close();
  console.log('PASS scene preload: 15-second reveal, late readiness, failure and compressed-transfer fallback, context-loss recovery');
 }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1});
