const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const {server,base}=await require('./browser-test-server.cjs')();const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const isolated=await browser.newPage();await isolated.clock.install();
  await isolated.route('**/*',route=>route.request().isNavigationRequest()?route.continue():route.abort());
  await isolated.goto(base,{waitUntil:'domcontentloaded'});
  assert.equal(await isolated.locator('html').getAttribute('data-boot'),'playing');
  assert.equal(await isolated.locator('.boot-cinematic').getAttribute('role'),'status');
  assert.ok(await isolated.locator('.boot-ring').isVisible());
  assert.equal(await isolated.locator('.boot-skip').count(),0);
  await isolated.clock.fastForward(15050);await isolated.waitForFunction(()=>!document.documentElement.dataset.boot);
  assert.equal(await isolated.locator('html').getAttribute('data-view'),'landing');await isolated.close();
  const reduced=await browser.newContext({reducedMotion:'reduce'});const p=await reduced.newPage();
  await p.goto(base,{waitUntil:'domcontentloaded'});
  assert.equal(await p.locator('.boot-ring').evaluate(el=>getComputedStyle(el).animationName),'none');
  await reduced.close();console.log('PASS boot reliability: inline first paint, no Skip, isolated timeout, reduced motion');
 }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1});
