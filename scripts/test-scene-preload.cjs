const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
 const {server,base}=await require('./browser-test-server.cjs')();let browser;
 try{
  browser=await chromium.launch({channel:'chrome',headless:true});
  for(const scenario of ['normal','late','skip','repeat','deep','webgl','cpu','leave']){
   const context=await browser.newContext({viewport:{width:1672,height:941}}),page=await context.newPage();
   const errors=[],requests=[];page.on('pageerror',e=>errors.push(e.message));
   page.on('request',r=>{if(/CP1_2024.glb/.test(r.url()))requests.push(r.url());});
   await page.addInitScript(({scenario})=>{
    if(scenario==='repeat')sessionStorage.setItem('alephonIntroSeen','1');
    window.startupProbe={frames:0,states:[],contexts:0};
    const original=HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext=function(type,...args){
     if(/webgl/.test(type)){window.startupProbe.contexts++;if(scenario==='webgl')return null;}
     return original.call(this,type,...args);
    };
    new MutationObserver(records=>{for(const r of records)if(r.target.matches?.('.boot-cinematic'))window.startupProbe.states.push(r.target.dataset.state);}).observe(document,{subtree:true,attributes:true,attributeFilter:['data-state']});
   },{scenario});
   await page.route('**/js/landing-scene.js*',async route=>{
    const response=await route.fetch();const source=(await response.text()).replace('renderer.render(scene,camera);',`renderer.render(scene,camera);window.startupProbe.frames++;window.startupProbe.firstFrame??={time:performance.now(),boot:document.documentElement.dataset.boot};`);
    await route.fulfill({response,body:source});
   });
   let release;
   if(['late','skip','leave'].includes(scenario)){
    const gate=new Promise(resolve=>release=resolve);
    await page.route('**/CP1_2024.glb*',async route=>{await gate;await route.continue().catch(()=>{});});
   }
   if(scenario==='cpu'){const cdp=await context.newCDPSession(page);await cdp.send('Emulation.setCPUThrottlingRate',{rate:6});}
   await page.goto(base+(scenario==='deep'?'#page=3':''),{waitUntil:'domcontentloaded'});
   if(scenario==='deep'){
    await page.waitForTimeout(1200);assert.equal(requests.length,0);assert.equal(await page.locator('html').getAttribute('data-view'),'viewer');
   }else{
    if(['skip','leave'].includes(scenario)){
     await page.waitForFunction(()=>performance.getEntriesByType('resource').some(r=>r.name.includes('landing-scene.js')));
     await page.locator('.boot-skip').click();assert.equal(await page.locator('html').getAttribute('data-boot'),null);
    }
    if(scenario==='leave'){
     await page.locator('.open-portfolio').click();release();
     await page.waitForFunction(()=>document.documentElement.dataset.view==='viewer');
     assert.equal(await page.locator('.scene-canvas canvas').count(),0);
    }else{
     if(scenario==='normal'){
      await page.waitForSelector('.is-scene-ready canvas',{timeout:30000});
      assert.equal(await page.locator('html').getAttribute('data-boot'),'playing','normal desktop prepares before intro ends');
      await page.waitForTimeout(200);const before=await page.evaluate(()=>window.startupProbe.frames);
      await page.waitForTimeout(350);assert.equal(await page.evaluate(()=>window.startupProbe.frames),before,'hidden scene is paused');
     }
     await page.waitForFunction(()=>!document.documentElement.dataset.boot,null,{timeout:60000});
     if(['late','skip'].includes(scenario)){
      assert.ok(await page.locator('.open-portfolio').isVisible());
      assert.equal(await page.locator('.scene-loading').evaluate(e=>getComputedStyle(e).opacity),'1');release();
     }
     await page.waitForFunction(()=>['ready','unavailable'].includes(document.querySelector('.landing-stage').dataset.scene),null,{timeout:60000});
     if(scenario==='webgl'){
      assert.equal(await page.locator('.landing-stage').getAttribute('data-scene'),'unavailable');
      await page.locator('.open-portfolio').click();await page.waitForFunction(()=>document.documentElement.dataset.view==='viewer');
     }else{
      assert.equal(await page.locator('.landing-stage').getAttribute('data-scene'),'ready');
      const before=await page.evaluate(()=>window.startupProbe.frames);await page.waitForTimeout(350);
      assert.ok(await page.evaluate(n=>window.startupProbe.frames>n,before),'visible animation resumes');
      assert.equal(await page.evaluate(()=>window.startupProbe.contexts),1);
      if(scenario==='normal'){
       const timing=await page.evaluate(()=>({first:window.startupProbe.firstFrame,glb:performance.getEntriesByType('resource').find(r=>r.name.includes('CP1_2024.glb')).startTime}));
       assert.ok(timing.glb>=450);console.log('TIMING',timing);
      }
     }
     if(scenario==='cpu')assert.deepEqual(await page.evaluate(()=>window.startupProbe.states),['BLACK','BOOT','INITIALIZE','RESET','BRAND','LOADING','VERIFY','AUTHENTICATING','VERIFIED','CHECK','LANDING','COMPLETE']);
    }
    assert.equal(requests.length,1,'one model request per Home initialization');
   }
   assert.deepEqual(errors,[]);console.log('PASS startup:',scenario);await context.close();
  }
 }finally{await browser?.close();server.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
