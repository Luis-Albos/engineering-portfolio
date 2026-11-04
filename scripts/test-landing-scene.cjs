const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const path=require('node:path');
const os=require('node:os');

(async()=>{
 const {server,base}=await require('./browser-test-server.cjs')();
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try {
  const context=await browser.newContext({viewport:{width:1586,height:992}});
  await context.addInitScript(()=>sessionStorage.setItem('alephonIntroSeen','1'));
  const p=await context.newPage(),errors=[];
  p.on('pageerror',error=>errors.push(error.message));
  p.on('console',message=>{if(message.type()==='error')errors.push(message.text())});
  await p.goto(base);
  await p.waitForSelector('.is-scene-ready canvas');

  assert.equal((await p.locator('.brand-name').textContent()).trim(),'Luis Albos');
  assert.deepEqual(await p.locator('.primary-nav a').allTextContents(),['Portfolio','Resume','Resources']);
  assert.equal(await p.locator('.brand-details').evaluate(e=>getComputedStyle(e).display),'none');
  assert.equal((await p.locator('.landing-kicker').textContent()).trim(),'Engineering Portfolio');
  assert.equal((await p.locator('.landing-intro h1').innerText()).replace(/\s+/g,' ').trim(),'Aerospace Systems & Mechatronics');
  assert.equal((await p.locator('.landing-summary').textContent()).trim(),
   'Design, analysis, and prototyping of aerospace systems with a focus on lightweight structures, controls, and integrated mechatronic systems.');
  assert.equal((await p.locator('.landing-resume').textContent()).trim(),'Resume');
  assert.equal(await p.locator('.landing-biography,.rail-facts,.aircraft-heading,.scene-registration,.scene-note,.selected-work').count(),0);
  assert.equal(await p.locator('.landing-stage').evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(254, 253, 250)');

  const boxes=await p.evaluate(()=>Object.fromEntries(
   ['.site-header','.landing-kicker','.landing-intro h1','.landing-summary','.open-portfolio','.landing-stage']
    .map(selector=>{const r=document.querySelector(selector).getBoundingClientRect();return [selector,{x:r.x,y:r.y,width:r.width,height:r.height}]})));
  const near=(value,target,tolerance,label)=>assert.ok(Math.abs(value-target)<=tolerance,`${label}: ${value} should be near ${target}`);
  near(boxes['.site-header'].height,80,2,'header height');
  near(boxes['.landing-kicker'].x,70,4,'copy left');
  near(boxes['.landing-kicker'].y,211,12,'kicker top');
  near(boxes['.landing-intro h1'].y,293,16,'headline top');
  near(boxes['.landing-summary'].y,456,16,'summary top');
  near(boxes['.open-portfolio'].x,71,4,'action left');
  near(boxes['.open-portfolio'].y,647,16,'action top');
  near(boxes['.landing-stage'].x,0,1,'unboxed scene left');
  assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth),1586);

  const config=await p.evaluate(async()=>{const {AIRCRAFT_CONFIG:a,TERRAIN_CONFIG:t}=await import('./js/experience-config.js');return {a,t}});
  assert.equal(config.a.model,'../reference/CP1_2024.glb');
  assert.ok(config.t.direction.x>0 && config.t.direction.z===0,'terrain travels aft from the -X nose');
  assert.equal(config.a.surface.color,0xfefdfa,'paper-colored aircraft fill');
  assert.ok(config.a.edges.silhouetteOpacity>.8&&config.a.edges.internalOpacity>.25,'dark technical linework');
  assert.ok(config.a.position.y>0,'aircraft is raised above its original origin');

  const first=await p.locator('.scene-canvas').screenshot();
  await p.screenshot({path:path.join(os.tmpdir(),'light-airborne-desktop.png')});
  await p.waitForTimeout(2400);
  const second=await p.locator('.scene-canvas').screenshot();
  assert.ok(!first.equals(second),'default aircraft and terrain motion progress');

  await p.locator('.open-portfolio').click();
  await p.waitForFunction(()=>document.documentElement.dataset.view==='viewer');
  assert.equal(await p.locator('.scene-canvas canvas').count(),0,'scene disposes after viewer entry');
  await p.locator('[data-home]').click();
  await p.waitForSelector('.is-scene-ready canvas');
  await p.emulateMedia({reducedMotion:'reduce'});
  await p.waitForTimeout(300);
  const frozen1=await p.locator('.scene-canvas').screenshot();
  await p.waitForTimeout(600);
  const frozen2=await p.locator('.scene-canvas').screenshot();
  assert.ok(frozen1.equals(frozen2),'reduced motion freezes the entire scene');

  for(const [width,height] of [[2560,1440],[390,844],[768,1024]]){
   await p.setViewportSize({width,height});
   await p.waitForTimeout(250);
   assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'no horizontal overflow');
   if(width===390){
    const heading=await p.locator('.landing-intro h1').boundingBox();
    const summary=await p.locator('.landing-summary').boundingBox();
    const cta=await p.locator('.open-portfolio').boundingBox();
    const stage=await p.locator('.landing-stage').boundingBox();
    assert.ok(heading.y<summary.y && summary.y+summary.height<cta.y && cta.y+cta.height<stage.y,
     'phone copy, action, and aircraft follow reading order');
    assert.ok(heading.height>70 && summary.height>80,'phone text remains readable');
   }
   await p.screenshot({path:path.join(os.tmpdir(),`light-airborne-${width}.png`)});
  }
  assert.deepEqual(errors,[]);
  await context.close();

  const fallback=await browser.newContext({viewport:{width:1586,height:992}});
  await fallback.addInitScript(()=>{
   sessionStorage.setItem('alephonIntroSeen','1');
   const getContext=HTMLCanvasElement.prototype.getContext;
   HTMLCanvasElement.prototype.getContext=function(type,...args){return type==='webgl2'?null:getContext.call(this,type,...args)};
  });
  const fp=await fallback.newPage();
  await fp.goto(base);
  await fp.waitForFunction(()=>document.querySelector('.landing-stage')?.dataset.scene==='unavailable');
  assert.ok(await fp.locator('.open-portfolio').isVisible());
  assert.ok(await fp.locator('.landing-resume').isVisible());
  await fp.screenshot({path:path.join(os.tmpdir(),'light-airborne-fallback.png')});
  await fallback.close();

  const low=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
  await low.addInitScript(()=>{
   sessionStorage.setItem('alephonIntroSeen','1');
   Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>2});
  });
  const lp=await low.newPage();
  await lp.goto(base);
  await lp.waitForSelector('.is-scene-ready canvas');
  assert.ok(await lp.locator('canvas').evaluate(c=>c.width<=Math.ceil(c.getBoundingClientRect().width)),
   'low-power rendering caps DPR at one');
  await lp.locator('.open-portfolio').click();
  await lp.waitForFunction(()=>document.documentElement.dataset.view==='viewer');
  await low.close();
  console.log('PASS: editorial anchors, airborne scene, motion, viewer handoff, responsive layout, fallback, low-power path.');
 } finally {await browser.close();server.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
