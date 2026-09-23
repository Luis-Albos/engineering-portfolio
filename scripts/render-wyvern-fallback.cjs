const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path');
(async()=>{const {server,base}=await require('./browser-test-server.cjs')();const browser=await chromium.launch({channel:'chrome',headless:true});try{
 const p=await browser.newPage({viewport:{width:1400,height:900}});p.on('console',m=>{if(m.type()==='error')console.error(m.text())});p.on('pageerror',e=>console.error(e));
 await p.route('**/capture.html',route=>route.fulfill({contentType:'text/html',body:'<style>body{margin:0}#host{width:1400px;height:900px}canvas{display:block}</style><div><div id="host"></div></div>'}));
 await p.goto(base+'capture.html');
 const data=await p.evaluate(async()=>{const {createLandingScene}=await import('./js/landing-scene.js');const scene=await createLandingScene(document.querySelector('#host'),{reducedMotion:true});const png=scene.snapshot('image/webp');scene.dispose();return png;});
 const output=path.join(__dirname,'../assets/landing/wyvern-fallback.webp');fs.writeFileSync(output,Buffer.from(data.split(',')[1],'base64'));console.log(output);
}finally{await browser.close();server.close();}})().catch(e=>{console.error(e);process.exitCode=1});
