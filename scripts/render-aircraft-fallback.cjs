const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path');
(async()=>{const {server,base}=await require('./browser-test-server.cjs')();const browser=await chromium.launch({channel:'chrome',headless:true});try{
 const p=await browser.newPage({viewport:{width:1400,height:900}});p.on('console',m=>{if(m.type()==='error')console.error(m.text())});p.on('pageerror',e=>console.error(e));
 await p.emulateMedia({reducedMotion:'reduce'});
 await p.addInitScript(()=>sessionStorage.setItem('alephonIntroSeen','1'));
 await p.goto(base);const stage=await p.locator('.landing-stage').evaluate(element=>{const {width,height}=element.getBoundingClientRect();return {width,height};});
 await p.route('**/capture.html',route=>route.fulfill({contentType:'text/html',body:`<style>body{margin:0}#host{width:${stage.width}px;height:${stage.height}px}canvas{display:block}</style><div><div id="host"></div></div>`}));
 await p.goto(base+'capture.html');
 const capture=await p.evaluate(async()=>{const {createLandingScene}=await import('./js/landing-scene.js');const scene=await createLandingScene(document.querySelector('#host'),{reducedMotion:true});const data=scene.snapshot('image/webp');const canvas=document.querySelector('canvas');const size={width:canvas.width,height:canvas.height};scene.dispose();return {data,...size};});
 const output=path.join(__dirname,'../assets/landing/sae-aero-fallback.webp');fs.writeFileSync(output,Buffer.from(capture.data.split(',')[1],'base64'));
 console.log(`${output} (${capture.width}x${capture.height}; ${stage.width}x${stage.height} CSS pixels)`);
}finally{await browser.close();server.close();}})().catch(e=>{console.error(e);process.exitCode=1});
