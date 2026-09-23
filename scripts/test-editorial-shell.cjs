const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path'),os=require('node:os');
(async()=>{const {server,base}=await require('./browser-test-server.cjs')();const browser=await chromium.launch({channel:'chrome',headless:true});try{
 const page=await browser.newPage({reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>sessionStorage.setItem('alephonIntroSeen','1'));
 const header=()=>page.evaluate(()=>{
  const selectors=['.site-header','.brand','.brand-name','.brand-details','.brand-label','.brand-role','.primary-nav','.primary-nav a','.menu-button'];
  return selectors.map(selector=>{const el=document.querySelector(selector),r=el.getBoundingClientRect(),s=getComputedStyle(el);return {selector,x:r.x,y:r.y,width:r.width,height:r.height,font:s.fontSize,line:s.lineHeight,spacing:s.letterSpacing,gap:s.gap,padding:s.padding,border:s.borderBottomWidth};});
 });
 for(const [width,height] of [[1672,941],[1366,768],[768,1024],[390,844],[320,740]]){
  await page.setViewportSize({width,height});await page.goto(base);await page.waitForSelector('.has-webgl canvas');
  assert.equal(await page.locator('.brand-role').textContent(),'Aerospace Systems & Mechatronics');
  assert.equal(await page.locator('.landing-biography p').count(),1);
  assert.match(await page.locator('.landing-biography').textContent(),/multidisciplinary engineer/);
  assert.deepEqual(await page.locator('.rail-facts dt').allTextContents(),['Texas A&M','Focus']);
  assert.equal(await page.locator('.rail-contact .email-link').getAttribute('href'),'mailto:luis.e.albos@gmail.com');
  assert.equal(await page.locator('.rail-contact .linkedin-link').getAttribute('href'),'https://www.linkedin.com/in/luis-albos');
  assert.equal(await page.locator('#about').evaluate(e=>getComputedStyle(e).display),'none');assert.equal(await page.locator('#contact').evaluate(e=>getComputedStyle(e).display),'none');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  if(width>760){assert.ok(await page.evaluate(()=>document.documentElement.scrollHeight<=innerHeight+1),'desktop home has no lower scroll flow');assert.ok(await page.locator('.landing-rail').evaluate(e=>e.scrollHeight<=e.clientHeight+1),'rail content fits');}
  else {await page.locator('.rail-contact .email-link').scrollIntoViewIfNeeded();assert.ok(await page.locator('.rail-contact .email-link').isVisible());await page.evaluate(()=>scrollTo(0,0));}
  const baseline=await header();
  await page.locator('.open-portfolio').focus();await page.keyboard.press('Tab');
  assert.equal(await page.locator('.landing-actions a[href="resume.html"]').evaluate(e=>getComputedStyle(e,'::after').transform),'matrix(1, 0, 0, 1, 0, 0)','keyboard focus reveals underline');
  await page.screenshot({path:path.join(os.tmpdir(),`editorial-home-${width}.png`),fullPage:width<760});
  await page.locator('.open-portfolio').click();await page.waitForFunction(()=>document.documentElement.dataset.view==='viewer');
  assert.notEqual(await page.locator('#about').evaluate(e=>getComputedStyle(e).display),'none');assert.notEqual(await page.locator('#contact').evaluate(e=>getComputedStyle(e).display),'none');
  assert.deepEqual(await header(),baseline,'viewer header matches home');
  await page.locator('[data-home]').click();await page.waitForFunction(()=>document.documentElement.dataset.view==='landing');assert.equal(await page.locator('#about').evaluate(e=>getComputedStyle(e).display),'none');
  for(const route of ['resume.html','resources/']){
   await page.goto(base+route);assert.deepEqual(await header(),baseline,`${route} header geometry at ${width}`);
   if(route==='resume.html')assert.notEqual(await page.locator('#contact').evaluate(e=>getComputedStyle(e).display),'none');
   await page.screenshot({path:path.join(os.tmpdir(),`editorial-${route.startsWith('resume')?'resume':'resources'}-${width}.png`)});
  }
 }
 await page.goto(base+'#about');assert.equal(await page.locator('html').getAttribute('data-view'),'viewer');assert.notEqual(await page.locator('#about').evaluate(e=>getComputedStyle(e).display),'none');
 assert.deepEqual(errors,[]);console.log('PASS: editorial facts/contacts, single-screen desktop, natural mobile flow, keyboard underline, state-specific About/Footer, Resume footer, identical shared header geometry at five viewport sizes, About deep link.');
}finally{await browser.close();server.close();}})().catch(e=>{console.error(e);process.exitCode=1});
