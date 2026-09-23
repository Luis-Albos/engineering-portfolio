const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{const {server,base}=await require('./browser-test-server.cjs')();const browser=await chromium.launch({channel:'chrome',headless:true});try{
const page=await browser.newPage();await page.goto(base+'#page=3');
const result=await page.evaluate(async()=>{
 const THREE=await import('./assets/vendor/three/three.module.min.js');
 const {GLTFLoader}=await import('./assets/vendor/three/GLTFLoader.js');
 const gltf=await new GLTFLoader().loadAsync('./reference/CP1_2024.glb');
 const assembly=gltf.scene.getObjectByName('CP1_2024');assembly.updateMatrixWorld(true);
 let prop,motor,count=0;assembly.traverse(n=>{if(n.isMesh)count++;if(n.userData.name==='Propellor 28in-1')prop=n;if(n.userData.name?.includes('Scorpion 5535'))motor=n;});
 const axis=new THREE.Vector3(0,1,0).transformDirection(prop.matrixWorld);
 const motorAxis=new THREE.Vector3(0,1,0).transformDirection(motor.matrixWorld);
 const center=prop.getWorldPosition(new THREE.Vector3()),motorCenter=motor.getWorldPosition(new THREE.Vector3());
 const radialOffset=center.clone().sub(motorCenter).cross(motorAxis).length();
 const body=assembly.children.find(n=>n!==prop),before=body.matrixWorld.toArray();
 const vertex=new THREE.Vector3().fromBufferAttribute(prop.geometry.attributes.position,0).applyMatrix4(prop.matrixWorld);
 prop.rotateY(.2);assembly.updateMatrixWorld(true);
 const after=new THREE.Vector3().fromBufferAttribute(prop.geometry.attributes.position,0).applyMatrix4(prop.matrixWorld);
 return {count,axis:axis.toArray(),motorAxis:motorAxis.toArray(),radialOffset,center:center.toArray(),bodyUnchanged:before.every((x,i)=>x===body.matrixWorld.elements[i]),clockwise:vertex.sub(center).cross(after.sub(center)).dot(axis)<0,bounds:new THREE.Box3().setFromObject(assembly).getSize(new THREE.Vector3()).toArray()};
});
assert.equal(result.count,94);assert.ok(result.axis[0]<-.999);assert.ok(result.bodyUnchanged);assert.equal(result.clockwise,false,'corrected spin is opposite the previous direction from the front');assert.ok(result.radialOffset<.002,'shaft centerlines agree within 2 mm of source export');console.log(JSON.stringify(result,null,2));
}finally{await browser.close();server.close();}})().catch(e=>{console.error(e);process.exitCode=1});
