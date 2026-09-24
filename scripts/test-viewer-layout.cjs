const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path'),os=require('node:os'),{execFileSync}=require('node:child_process');
const sizes=[[1920,1080],[2560,1440],[3440,1440],[1366,768]];
(async()=>{const {server,base}=await require('./browser-test-server.cjs')();let browser;
try{
 browser=await chromium.launch({channel:'chrome',headless:true});
 const baseline=await browser.newPage(),oldHeights=[];
 const originals=new Map(['index.html','script.js','css/landing.css','version.json'].map(file=>[file,execFileSync('git',['show','HEAD:'+file],{cwd:path.resolve(__dirname,'..'),encoding:'utf8'})]));
 await baseline.route('**/*',route=>{const file=new URL(route.request().url()).pathname.replace('/engineering-portfolio/','')||'index.html';return originals.has(file)?route.fulfill({body:originals.get(file),contentType:file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.json')?'application/json':'text/html'}):route.continue();});
 for(const [width,height] of sizes){await baseline.setViewportSize({width,height});await baseline.goto(base+'#page=1');await baseline.waitForSelector('.portfolio-page-image.is-loaded');oldHeights.push((await baseline.locator('.image-frame').boundingBox()).height);}
 await baseline.close();
 const page=await browser.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.addInitScript(()=>sessionStorage.setItem('alephonIntroSeen','1'));
 // Geometry must be identical even when Home's optional WebGL scene is unavailable.
 await page.route('**/CP1_2024.glb*',route=>route.abort());
 const geometry=()=>page.evaluate(()=>{
  const rect=selector=>{const r=document.querySelector(selector).getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};};
  const border=getComputedStyle(document.querySelector('.portfolio-layout'),'::after');
  return {header:rect('.site-header'),rail:rect(document.documentElement.dataset.view==='landing'?'.landing-rail':'.portfolio-sidebar'),stage:rect(document.documentElement.dataset.view==='landing'?'.landing-stage':'.viewer-stage'),border:[border.top,border.left,border.right,border.height]};
 });
 for(const [i,[width,height]] of sizes.entries()){
  await page.setViewportSize({width,height});await page.goto(base);await page.waitForFunction(()=>document.querySelector('.landing-stage').dataset.scene==='unavailable');
  await page.waitForFunction(()=>!document.documentElement.classList.contains('home-return'));
  const home=await geometry();await page.locator('.open-portfolio').click();
  await page.waitForTimeout(200);const opening=await geometry();assert.deepEqual(opening.stage,home.stage);assert.deepEqual(opening.header,home.header);assert.deepEqual(opening.border,home.border);
  await page.waitForFunction(()=>document.documentElement.dataset.view==='viewer');await page.waitForSelector('.portfolio-page-image.is-loaded');
  const viewer=await geometry();assert.deepEqual(viewer,home,'fixed shell geometry across modes');
  assert.equal(await page.locator('.viewer-stage .viewer-controls,.viewer-stage .page-jump-form').count(),0);
  assert.equal(await page.locator('.page-jump-form').isVisible(),false);
  const frame=await page.locator('.image-frame').boundingBox(),stage=viewer.stage;
  assert.ok(Math.abs(frame.y-stage.y-24)<1);assert.ok(Math.abs(frame.x+frame.width/2-stage.x-stage.width/2)<1);
  assert.ok(frame.height>oldHeights[i]+30);assert.equal(await page.locator('.portfolio-page-image').first().evaluate(e=>getComputedStyle(e).objectFit),'contain');
  const footer=await page.locator('.sidebar-controls').boundingBox();assert.ok(footer.y+footer.height<=height);
  await page.locator('.sidebar-scroll').evaluate(el=>el.scrollTop=el.scrollHeight);
  assert.deepEqual(await page.locator('.sidebar-controls').boundingBox(),footer);
  // Thumbnails guarantee overflow even on tall screens.
  await page.locator('.portfolio-sidebar .thumbnails-button').click();await page.locator('.sidebar-scroll').evaluate(el=>el.scrollTop=el.scrollHeight);
  assert.ok(await page.locator('.sidebar-scroll').evaluate(el=>el.scrollTop>0));assert.deepEqual(await page.locator('.sidebar-controls').boundingBox(),footer);
  await page.locator('.portfolio-sidebar .thumbnails-button').click();
  assert.equal(await page.locator('.thumbnail-grid').isVisible(),false);
  await page.locator('.sidebar-scroll').evaluate(el=>el.scrollTop=0);
  await page.locator('.next-button').click();await page.waitForFunction(()=>document.querySelector('#page-input').value==='2');
  await page.locator('.next-button').blur();await page.keyboard.press('ArrowRight');await page.waitForFunction(()=>document.querySelector('#page-input').value==='3');
  await page.keyboard.press('ArrowLeft');await page.waitForFunction(()=>document.querySelector('#page-input').value==='2');
  await page.locator('.previous-button').click();await page.waitForFunction(()=>document.querySelector('#page-input').value==='1');
  await page.waitForTimeout(350);await page.screenshot({path:path.join(os.tmpdir(),`viewer-layout-${width}.png`)});
  console.log(JSON.stringify({size:`${width}x${height}`,before:oldHeights[i],after:frame.height,reclaimed:frame.height-oldHeights[i]}));
 }
 await page.setViewportSize({width:390,height:844});await page.waitForSelector('.viewer-stage .viewer-controls');assert.equal(await page.locator('.viewer-stage .viewer-controls').count(),1);assert.ok(await page.locator('.next-button').isVisible());assert.ok(await page.locator('.page-jump-form').isVisible());
 await page.locator('.next-button').click();await page.waitForFunction(()=>document.querySelector('#page-input').value==='2');
 await page.locator('#menu-button').click();assert.equal(await page.locator('#mobile-drawer').getAttribute('aria-hidden'),'false');await page.locator('.drawer-close').click();
 await page.setViewportSize({width:1366,height:768});await page.waitForSelector('.portfolio-sidebar .viewer-controls');assert.equal(await page.locator('.portfolio-sidebar .viewer-controls').count(),1);assert.equal(await page.locator('.next-button').count(),1);
 assert.deepEqual(errors,[]);console.log('PASS: shell continuity, full-height document, fixed sidebar controls, independent scrolling, keyboard navigation, and mobile relocation.');
}finally{await browser?.close();server.close();}})().catch(error=>{console.error(error);process.exitCode=1;});
