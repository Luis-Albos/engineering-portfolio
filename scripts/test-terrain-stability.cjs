const {chromium}=require('playwright'),assert=require('node:assert/strict'),sharp=require('sharp');
async function difference(a,b){const left=await sharp(a).raw().toBuffer(),right=await sharp(b).raw().toBuffer();let sum=0,changed=0;for(let i=0;i<left.length;i++){const d=Math.abs(left[i]-right[i]);sum+=d;if(d>8)changed++;}return {mean:sum/left.length,changed:changed/left.length};}
(async()=>{const {server,base}=await require('./browser-test-server.cjs')();const browser=await chromium.launch({channel:'chrome',headless:true});try{
 const page=await browser.newPage({viewport:{width:512,height:512}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/terrain-test.html',r=>r.fulfill({contentType:'text/html',body:'<style>body{margin:0;background:#171a1e}canvas{display:block}</style>'}));
 await page.goto(base+'terrain-test.html');
 for(const lowDetail of [false,true]){
 const result=await page.evaluate(async lowDetail=>{
  window.fixture?.dispose();const THREE=await import('./assets/vendor/three/three.module.min.js');
  const {createContourTerrain}=await import('./js/contour-terrain.js'),{TERRAIN_CONFIG:config}=await import('./js/experience-config.js');
  const terrain=createContourTerrain({lowDetail}),renderer=new THREE.WebGLRenderer({antialias:true});renderer.setSize(512,512);renderer.setClearColor('#171a1e',1);document.body.append(renderer.domElement);terrain.resize(512,512);
  const scene=new THREE.Scene();scene.add(terrain.mesh);
  const camera=new THREE.OrthographicCamera(-7,7,7,-7,.1,100);camera.up.set(0,0,-1);
  const geometry=terrain.mesh.children[0].geometry,position=geometry.attributes.position,original=position.array.slice();
  const n=lowDetail?config.lowSegments:config.segments,row=n+1;let seam=0;
  for(let i=0;i<=n;i++){seam=Math.max(seam,Math.abs(position.getY(i*row)-position.getY(i*row+n)),Math.abs(position.getY(i)-position.getY(n*row+i)));}
  function render(seconds,track=false){terrain.update(seconds);camera.position.set(track?terrain.mesh.position.x:0,12,0);camera.lookAt(camera.position.x,-4,0);renderer.render(scene,camera);}
  window.fixture={render,config,unchanged:()=>original.every((v,i)=>v===position.array[i]),dispose(){renderer.dispose();geometry.dispose();terrain.mesh.children[0].material.dispose();renderer.domElement.remove();}};
  let min=Infinity,max=-Infinity,front=0,back=0,frontCount=0,backCount=0;
  for(let i=0;i<position.count;i++){const y=position.getY(i),z=position.getZ(i);min=Math.min(min,y);max=Math.max(max,y);if(z>8&&z<22){front+=y;frontCount++;}if(z< -8&&z> -22){back+=y;backCount++;}}
  render(0,true);return {seam,vertices:position.count,relief:max-min,front:front/frontCount,back:back/backCount};
 },lowDetail);
 assert.ok(result.seam<1e-6,'opposite tile boundaries match');assert.ok(result.relief>8,'substantial actual terrain displacement');assert.ok(result.back>result.front*2,'background mountains rise above the foreground');
 const first=await page.locator('canvas').screenshot();
 await page.evaluate(()=>fixture.render(4,true));const tracked=await page.locator('canvas').screenshot();
 const rigid=await difference(first,tracked);assert.ok(rigid.mean<.15&&rigid.changed<.001,JSON.stringify({rigid,lowDetail}));
 await page.evaluate(()=>fixture.render(4,false));const moved=await page.locator('canvas').screenshot();assert.ok((await difference(first,moved)).mean>.1,'terrain visibly travels');
 await page.evaluate(()=>fixture.render((fixture.config.size/2-.0001)/fixture.config.forwardSpeed));const pre=await page.locator('canvas').screenshot();
 await page.evaluate(()=>fixture.render((fixture.config.size/2+.0001)/fixture.config.forwardSpeed));const post=await page.locator('canvas').screenshot();
 const wrap=await difference(pre,post);assert.ok(wrap.mean<.15&&wrap.changed<.001,JSON.stringify({wrap,lowDetail}));
 assert.ok(await page.evaluate(()=>fixture.unchanged()),'terrain vertex heights never change over time');
 console.log(JSON.stringify({lowDetail,vertices:result.vertices,relief:result.relief,front:result.front,back:result.back,rigid,wrap}));
 }
 assert.deepEqual(errors,[]);console.log('PASS: rigid contour pattern, immutable geometry, visible travel, matching seams and invisible wrap at both quality levels.');
}finally{await browser.close();server.close();}})().catch(e=>{console.error(e);process.exitCode=1});
