const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const {server,base}=await require('./browser-test-server.cjs')();const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const context=await browser.newContext({viewport:{width:1672,height:941}});const page=await context.newPage(),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(base);await page.waitForFunction(()=>!document.documentElement.dataset.boot,null,{timeout:30000});
  await page.locator('.open-portfolio').click();await page.waitForFunction(()=>document.documentElement.dataset.view==='viewer');
  assert.equal(await page.locator('#portfolio-viewer').evaluate(el=>document.activeElement===el),true);
  await page.locator('.next-button').click();assert.equal(await page.locator('#page-input').inputValue(),'2');
  await page.locator('.portfolio-sidebar .search-button').click();await page.locator('#search-input').fill('23');
  await page.locator('.search-result').first().click();assert.equal(await page.locator('#page-input').inputValue(),'23');
  await page.locator('.portfolio-sidebar .thumbnails-button').click();await page.locator('.thumbnail-button[data-page="8"]').click();
  assert.equal(await page.locator('#page-input').inputValue(),'8');
  await page.locator('[data-home]').click();await page.waitForFunction(()=>document.documentElement.dataset.view==='landing');
  assert.equal(await page.locator('.scene-canvas canvas').count(),1);
  for(const [text,url] of [['Resume','**/resume.html'],['Resources','**/resources/']]){
   await page.locator('.primary-nav a').filter({hasText:text}).click();await page.waitForURL(url);
   assert.deepEqual(await page.locator('.primary-nav a').allTextContents(),['Portfolio','Resume','Resources']);
   await page.locator('.primary-nav a').filter({hasText:'Portfolio'}).click();await page.waitForURL('**/index.html#portfolio-viewer');
   assert.equal(await page.locator('html').getAttribute('data-view'),'viewer');await page.goto(base);
   await page.waitForFunction(()=>!document.documentElement.dataset.boot,null,{timeout:30000});
  }
  for(const [width,height] of [[390,844],[320,740],[768,1024],[1366,768]]){
   await page.setViewportSize({width,height});await page.goto(base);await page.waitForFunction(()=>!document.documentElement.dataset.boot,null,{timeout:30000});
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`no horizontal overflow at ${width}`);
   assert.ok(await page.locator('.open-portfolio').isVisible());
  }
  assert.deepEqual(errors,[]);await context.close();
  for(const number of [10,23]){
   const fresh=await browser.newContext();const p=await fresh.newPage(),requests=[];p.on('request',r=>requests.push(r.url()));
   await p.goto(base+`#page=${number}`);assert.equal(await p.locator('html').getAttribute('data-boot'),null);
   assert.equal(await p.locator('#page-input').inputValue(),String(number));
   assert.ok(!requests.some(url=>/landing-scene\.js|CP1_2024\.glb/.test(url)));await fresh.close();
  }
  console.log('PASS experience: viewer navigation, search, thumbnails, Home, Resume/Resources, responsive, direct links');
 }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1});
