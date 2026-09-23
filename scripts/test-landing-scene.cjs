const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path'),os=require('node:os');
(async()=>{const {server,base}=await require('./browser-test-server.cjs')();const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const context=await browser.newContext({viewport:{width:1672,height:941}});await context.addInitScript(()=>sessionStorage.setItem('alephonIntroSeen','1'));
 const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 await p.goto(base);await p.waitForSelector('.has-webgl canvas');await p.waitForTimeout(600);
 assert.equal(await p.locator('.stage-reference,.landing-terrain,.engineering-grid').count(),0);
 assert.equal((await p.locator('.brand-name').textContent()).trim(),'Luis Albos');
 assert.equal((await p.locator('.brand-details').textContent()).replace(/\s+/g,' ').trim(),'Engineering Portfolio Aerospace & Mechatronics Engineer');
 assert.deepEqual(await p.locator('.primary-nav a').allTextContents(),['Portfolio','Resume','Resources']);
 assert.equal(await p.locator('.stage-motto,.stage-annotation,.landing-discipline,.landing-fields,.rail-footnote').count(),0);
 assert.equal((await p.locator('.landing-biography h1').textContent()).trim(),"Hey, I'm Luis!");
 assert.equal(await p.locator('.landing-biography p').count(),1);
 assert.equal((await p.locator('.landing-biography p').textContent()).trim(),"I'm an aerospace and mechatronics engineer with experience in aircraft design and manufacturing, robotics, controls, digital engineering, and technical leadership. Aviation is where most of my passion lives, especially flight test, aircraft systems, autonomy, and the intersection of hardware, software, and real-world testing. Outside of work, I'm usually building something just to understand it better, from robots and control systems to CAD aircraft, spacecraft concepts, and digital tools.");
 const projectCopy=(await p.locator('.aircraft-heading').textContent()).replace(/\s+/g,' ').trim();
 assert.match(projectCopy,/Featured Project/);assert.match(projectCopy,/X-02S\s*STRIKE WYVERN/);
 assert.match(projectCopy,/Personal CAD Project . SolidWorks/);assert.match(projectCopy,/Chapter VIII . Pages 27.28/);
 assert.equal(await p.locator('.project-summary').count(),1);
 assert.equal(await p.locator('.scene-note').count(),3);
 assert.equal(await p.locator('.registration-geometry').count(),0);
 const config=await p.evaluate(async()=>{const {WYVERN_CONFIG:w,TERRAIN_CONFIG:t}=await import('./js/experience-config.js');return {w,t}});
 assert.ok(config.t.direction.x<0 && config.t.direction.z===0,'terrain travels opposite the +X source nose');
 assert.ok(config.w.surface.roughness>.9 && config.w.surface.metalness===0,'matte dielectric material');
 assert.equal(await p.locator('.landing-stage').evaluate(e=>getComputedStyle(e).backgroundColor),await p.locator('.viewer-stage').evaluate(e=>getComputedStyle(e).backgroundColor));

 const first=await p.locator('.wyvern-canvas').screenshot();
 await p.screenshot({path:path.join(os.tmpdir(),'contour-landing-desktop.png')});
 await p.waitForTimeout(2400);const second=await p.locator('.wyvern-canvas').screenshot();assert.ok(!first.equals(second),'terrain and aircraft progress during idle');
 await p.screenshot({path:path.join(os.tmpdir(),'contour-glide-later.png')});
 await p.locator('.open-portfolio').click();await p.waitForTimeout(420);await p.screenshot({path:path.join(os.tmpdir(),'contour-morph.png')});
 await p.waitForFunction(()=>document.documentElement.dataset.view==='viewer');assert.equal(await p.locator('.wyvern-canvas canvas').count(),0);
 await p.locator('[data-home]').click();await p.waitForSelector('.has-webgl canvas');
 await p.emulateMedia({reducedMotion:'reduce'});await p.waitForTimeout(300);

 const frozen1=await p.locator('.wyvern-canvas').screenshot();await p.waitForTimeout(600);const frozen2=await p.locator('.wyvern-canvas').screenshot();assert.ok(frozen1.equals(frozen2),'reduced motion freezes the entire scene');
 for(const [width,height] of [[2560,1440],[390,844],[768,1024]]){await p.setViewportSize({width,height});await p.waitForTimeout(300);assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));if(width<760){
 const heading=await p.locator('.landing-biography h1').boundingBox(),bio=await p.locator('.landing-biography p').boundingBox(),cta=await p.locator('.open-portfolio').boundingBox(),stage=await p.locator('.landing-stage').boundingBox();
 assert.ok(heading.y<bio.y && bio.y+bio.height<cta.y && cta.y+cta.height<height && cta.y<stage.y,'mobile heading, biography, CTA, and aircraft retain their hierarchy');
 }await p.screenshot({path:path.join(os.tmpdir(),`contour-${width}.png`)});}
 assert.deepEqual(errors,[]);await context.close();
 const low=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});await low.addInitScript(()=>{sessionStorage.setItem('alephonIntroSeen','1');Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>2})});
 const lp=await low.newPage();await lp.goto(base);await lp.waitForSelector('.has-webgl canvas');
 assert.ok(await lp.locator('canvas').evaluate(c=>c.width<=Math.ceil(c.getBoundingClientRect().width)),'low-power rendering caps DPR at one');
 await lp.locator('.open-portfolio').click();await lp.waitForFunction(()=>document.documentElement.dataset.view==='viewer');await low.close();
 console.log('PASS: contour/glide progression, overlay removal, scene disposal/morph, reduced-motion freeze, responsive layouts, low-power path, no console errors.');
}finally{await browser.close();server.close()}})().catch(e=>{console.error(e);process.exitCode=1});
