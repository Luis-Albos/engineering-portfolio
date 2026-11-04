const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path'),os=require('node:os');
(async()=>{const {server,base}=await require('./browser-test-server.cjs')();const browser=await chromium.launch({channel:'chrome',headless:true});try{
 const page=await browser.newPage({viewport:{width:1672,height:941}}),errors=[],requests=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push(r.url()));
 await page.addInitScript(()=>sessionStorage.setItem('alephonIntroSeen','1'));
 // Observe actual render state in the test response; production exposes no test globals.
 await page.route('**/js/landing-scene.js*',async route=>{
  const response=await route.fetch();let source=await response.text();
  source=source.replace('renderer.render(scene,camera);',`renderer.render(scene,camera);
   const projected=group.position.clone().project(camera),rect=canvas.getBoundingClientRect();
   window.heroProbe={interaction:{...interaction},idleSeconds,animationSeconds,p,
    position:group.position.toArray(),rotation:group.quaternion.toArray(),propeller:propeller.quaternion.toArray(),
    terrain:terrain.mesh.position.toArray(),camera:camera.position.toArray(),
    grab:[rect.left+(projected.x+1)*rect.width/2,rect.top+(1-projected.y)*rect.height/2]};`);
  await route.fulfill({response,body:source});
 });
 await page.goto(base);await page.waitForFunction(()=>window.heroProbe);await page.waitForTimeout(650);
 const read=()=>page.evaluate(()=>window.heroProbe);
 const config=await page.evaluate(async()=>(await import('./js/experience-config.js')).AIRCRAFT_CONFIG);
 const before=await read();
 await page.mouse.move(1600,220);await page.mouse.down();assert.equal(await page.locator('.is-dragging').count(),0);await page.mouse.up();
 await page.mouse.move(...before.grab);await page.mouse.down();assert.equal(await page.locator('.is-dragging').count(),1);
 await page.mouse.move(before.grab[0]+400,before.grab[1]+180,{steps:12});
 const held=await read();assert.ok(held.interaction.yaw>0 && held.interaction.yaw<config.interaction.maxYaw,'aircraft lags the input rather than snapping');assert.ok(held.interaction.pitch<=config.interaction.maxTilt);
 await page.waitForTimeout(700);const later=await read();
 assert.equal(later.idleSeconds,held.idleSeconds,'glide clock freezes during interaction');
 assert.deepEqual(later.position,held.position);assert.ok(later.interaction.yaw>held.interaction.yaw,'rotation accelerates toward input');assert.ok(later.interaction.yaw<=config.interaction.maxYaw);
 assert.notDeepEqual(later.propeller,held.propeller,'propeller keeps spinning');assert.notDeepEqual(later.terrain,held.terrain,'terrain keeps translating');
 assert.deepEqual(later.camera,before.camera,'drag cannot pan or zoom camera');
 assert.equal(await page.locator('.aircraft-drag-hint').count(),0);
 await page.screenshot({path:path.join(os.tmpdir(),'sae-drag-limit.png')});
 await page.mouse.up();await page.waitForTimeout(400);assert.ok(Math.abs((await read()).interaction.yaw-config.interaction.maxYaw)<.002,'pose settles near input after release');
 await page.waitForFunction(()=>heroProbe.interaction.yaw===0&&!heroProbe.interaction.active,{},{timeout:5000});
 const returned=await read();await page.waitForTimeout(250);assert.ok((await read()).idleSeconds>returned.idleSeconds,'glide resumes after returning');
 const momentumGrab=(await read()).grab;await page.mouse.move(...momentumGrab);await page.mouse.down();
 await page.mouse.move(momentumGrab[0]+60,momentumGrab[1],{steps:4});await page.mouse.up();
 const releasedYaw=(await read()).interaction.yaw;await page.waitForTimeout(180);const coastYaw=(await read()).interaction.yaw;
 assert.ok(coastYaw>releasedYaw+.01,'aircraft retains motion after release');
 await page.waitForTimeout(500);const settledYaw=(await read()).interaction.yaw;await page.waitForTimeout(350);
 assert.ok(Math.abs((await read()).interaction.yaw-settledYaw)<Math.abs(coastYaw-releasedYaw)*.2,'momentum decelerates into a settled pose');
 await page.waitForFunction(()=>heroProbe.interaction.yaw===0&&!heroProbe.interaction.active,{},{timeout:5000});
 const grab=(await read()).grab;await page.mouse.move(...grab);await page.mouse.down();await page.mouse.move(grab[0]-200,grab[1]-150,{steps:8});
 assert.ok((await read()).interaction.yaw>=-config.interaction.maxYaw);assert.ok((await read()).interaction.pitch>=-config.interaction.maxTilt);
 await page.locator('canvas').dispatchEvent('pointercancel',{pointerId:1});assert.equal(await page.locator('.is-dragging').count(),0);await page.mouse.up();
 await page.locator('.open-portfolio').click();await page.waitForTimeout(300);
 const closing=await read();assert.equal(closing.interaction.yaw,0);assert.equal(closing.interaction.pitch,0);assert.equal(closing.interaction.idleWeight,0,'known pose before dismissal');
 await page.waitForFunction(()=>document.documentElement.dataset.view==='viewer');assert.equal(await page.locator('.scene-canvas canvas').count(),0);
 await page.locator('[data-home]').click();await page.waitForSelector('.is-scene-ready canvas');
 assert.equal(await page.locator('.aircraft-drag-hint:not([hidden])').count(),0,'hint is one-time per session');
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(100);
 const canvas=page.locator('.scene-canvas canvas');await canvas.focus();await canvas.press('ArrowRight');assert.ok((await read()).interaction.yaw>0);
 await canvas.press('Escape');assert.equal((await read()).interaction.yaw,0,'keyboard return respects reduced motion');
 const climb=await page.evaluate(async()=>{const THREE=await import('./assets/vendor/three/three.module.min.js');const nose=new THREE.Vector3(-1,0,0).applyQuaternion(new THREE.Quaternion(...heroProbe.rotation));return Math.asin(nose.y)*180/Math.PI;});
 assert.ok(Math.abs(climb-3)<1e-6,'default return pose has a 3 degree nose-up attitude');
 assert.ok(!requests.some(url=>url.includes('registration-rings')),'circles are never loaded');assert.deepEqual(errors,[]);
 console.log('PASS: real drag limits, frozen glide, continuing propeller/terrain, fixed camera, timeout return, cancellation, dismissal pose, keyboard/reduced motion, one-time hint, no rings.');
}finally{await browser.close();server.close();}})().catch(e=>{console.error(e);process.exitCode=1});
