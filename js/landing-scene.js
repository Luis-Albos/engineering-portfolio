import * as THREE from '../assets/vendor/three/three.module.min.js';
import { WYVERN_CONFIG as config } from './experience-config.js';
import {createContourTerrain} from './contour-terrain.js';
import {createRegistrationRings} from './registration-rings.js';

// Adjacency-driven silhouette: draw an edge only when its two faces straddle
// the view direction. Unlike wireframe:true, coplanar tessellation stays hidden.
function edgeLayers(geometry) {
  const positions=geometry.attributes.position, indices=geometry.index.array, edges=new Map();
  const a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3();
  for(let i=0;i<indices.length;i+=3) {
    const ids=[indices[i],indices[i+1],indices[i+2]];
    a.fromBufferAttribute(positions,ids[0]);b.fromBufferAttribute(positions,ids[1]);c.fromBufferAttribute(positions,ids[2]);
    const normal=b.sub(a).cross(c.sub(a)).normalize().toArray();
    for(let j=0;j<3;j++) {
      const first=Math.min(ids[j],ids[(j+1)%3]),second=Math.max(ids[j],ids[(j+1)%3]);
      const key=`${first}:${second}`;
      if(edges.has(key)) edges.get(key).normals.push(normal);
      else edges.set(key,{first,second,normals:[normal]});
    }
  }
  const xyz=[],normalA=[],normalB=[],major=[],secondary=[];
  for(const {first,second,normals} of edges.values()) {
    const angle=normals.length<2?180:Math.acos(THREE.MathUtils.clamp(new THREE.Vector3(...normals[0]).dot(new THREE.Vector3(...normals[1])),-1,1))*180/Math.PI;
    const feature=angle>=config.edges.majorThreshold?major:(angle>=config.edges.secondaryThreshold?secondary:null);
    for(const id of [first,second]) {
      if(feature)feature.push(positions.getX(id),positions.getY(id),positions.getZ(id));
      xyz.push(positions.getX(id),positions.getY(id),positions.getZ(id));
      normalA.push(...normals[0]);
      normalB.push(...(normals[1] || normals[0].map(n=>-n)));
    }
  }
  const result=new THREE.BufferGeometry();
  result.setAttribute('position',new THREE.Float32BufferAttribute(xyz,3));
  result.setAttribute('normalA',new THREE.Float32BufferAttribute(normalA,3));
  result.setAttribute('normalB',new THREE.Float32BufferAttribute(normalB,3));
  const lines=values=>new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(values,3));
  return {silhouette:result,major:lines(major),secondary:lines(secondary)};
}

// Average corner normals only across shallow angles; major CAD creases stay sharp.
function smoothSurface(source,crease) {
  const positions=source.attributes.position,indices=source.index.array;
  const normals=[],adjacent=Array.from({length:positions.count},()=>[]);
  const a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3();
  for(let i=0;i<indices.length;i+=3) {
    a.fromBufferAttribute(positions,indices[i]);b.fromBufferAttribute(positions,indices[i+1]);c.fromBufferAttribute(positions,indices[i+2]);
    normals.push(b.sub(a).cross(c.sub(a)).normalize().clone());
    for(let k=0;k<3;k++)adjacent[indices[i+k]].push(i/3);
  }
  const result=source.toNonIndexed(),output=new Float32Array(indices.length*3),sum=new THREE.Vector3();
  const limit=Math.cos(THREE.MathUtils.degToRad(crease));
  for(let i=0;i<indices.length;i++) {
    sum.set(0,0,0);const normal=normals[Math.floor(i/3)];
    for(const face of adjacent[indices[i]])if(normal.dot(normals[face])>=limit)sum.add(normals[face]);
    sum.normalize().toArray(output,i*3);
  }
  result.setAttribute('normal',new THREE.BufferAttribute(output,3));return result;
}

export async function createLandingScene(host, {signal, reducedMotion=false}={}) {
  const response=await fetch(new URL(config.model,import.meta.url),{signal});
  if(!response.ok) throw new Error('Wyvern mesh unavailable');
  const buffer=await response.arrayBuffer();
  signal?.throwIfAborted();
  const view=new DataView(buffer);
  if(view.getUint32(0,true)!==0x31525657) throw new Error('Invalid Wyvern mesh');
  const vertexCount=view.getUint32(4,true),indexCount=view.getUint32(8,true);
  if(buffer.byteLength!==12+vertexCount*12+indexCount*2) throw new Error('Incomplete Wyvern mesh');
  let renderer;
  // Test context availability first, so a normal no-WebGL fallback is not logged as an error by Three.js.
  const canvas=document.createElement('canvas');
  const context=canvas.getContext('webgl2',{alpha:true,antialias:true,powerPreference:'low-power'});
  if(!context) throw new Error('WebGL unavailable');
  renderer=new THREE.WebGLRenderer({canvas,context,alpha:true,antialias:true});
  const lowDetail=matchMedia('(pointer: coarse)').matches || (navigator.hardwareConcurrency||8)<=4;
  renderer.setPixelRatio(Math.min(devicePixelRatio,lowDetail?1:config.pixelRatio));
  renderer.setClearColor(0x000000,0);
  const scene=new THREE.Scene(), group=new THREE.Group();scene.add(group);
  const terrain=createContourTerrain({lowDetail});scene.add(terrain.mesh);
  const rings=createRegistrationRings();scene.add(rings.mesh);
  scene.add(new THREE.HemisphereLight(0xffffff,0x30363c,config.lighting.fillIntensity));
  const keyLight=new THREE.DirectionalLight(0xffffff,config.lighting.keyIntensity);keyLight.position.set(2,8,-5);scene.add(keyLight);
  group.position.set(config.position.x,config.position.y,config.position.z);
  group.rotation.set(config.rotation.x,config.rotation.y,config.rotation.z);
  group.scale.setScalar(config.scale);
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.BufferAttribute(new Float32Array(buffer,12,vertexCount*3),3));
  geometry.setIndex(new THREE.BufferAttribute(new Uint16Array(buffer,12+vertexCount*12,indexCount),1));
  geometry.computeBoundingBox();
  const edges=edgeLayers(geometry);
  const baseMaterial=new THREE.MeshStandardMaterial({color:config.surface.color,roughness:config.surface.roughness,metalness:config.surface.metalness,flatShading:false,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:1,polygonOffsetUnits:1,transparent:true});
  group.add(new THREE.Mesh(smoothSurface(geometry,config.surface.normalCrease),baseMaterial));
  const majorMaterial=new THREE.LineBasicMaterial({color:0xdcdcdc,transparent:true,opacity:config.edges.major,depthWrite:false});
  const secondaryMaterial=new THREE.LineBasicMaterial({color:0xb0b0b0,transparent:true,opacity:config.edges.secondary,depthWrite:false});
  group.add(new THREE.LineSegments(edges.major,majorMaterial));
  group.add(new THREE.LineSegments(edges.secondary,secondaryMaterial));
  const silhouetteMaterial=new THREE.ShaderMaterial({
    uniforms:{intensity:{value:config.edges.silhouette}},transparent:true,depthWrite:false,
    vertexShader:`attribute vec3 normalA; attribute vec3 normalB; varying vec2 facing;
      void main(){vec4 p=modelViewMatrix*vec4(position,1.0);vec3 direction=normalize(-p.xyz);
      facing=vec2(dot(normalMatrix*normalA,direction),dot(normalMatrix*normalB,direction));gl_Position=projectionMatrix*p;}`,
    fragmentShader:`uniform float intensity;varying vec2 facing;void main(){if(facing.x*facing.y>0.0)discard;gl_FragColor=vec4(.90,.90,.90,intensity);}`
  });
  group.add(new THREE.LineSegments(edges.silhouette,silhouetteMaterial));
  const camera=new THREE.PerspectiveCamera(config.camera.fov,1,.1,200);
  let disposed=false,frame=0,last=0,dismissAt=null,intersecting=true;
  let staticMotion=reducedMotion;
  let animationSeconds=0,animationStamp=performance.now(),slowFrames=0,qualityReduced=lowDetail;
  function resize() {
    if(disposed) return;
    const {width,height}=host.getBoundingClientRect();if(!width||!height)return;
    renderer.setSize(width,height,false);terrain.resize(canvas.width,canvas.height);camera.aspect=width/height;
    rings.resize(width,height);
    const target=new THREE.Vector3(...Object.values(config.camera.target));
    const direction=new THREE.Vector3(...Object.values(config.camera.position)).sub(target).normalize();
    camera.position.copy(direction);camera.lookAt(0,0,0);camera.updateMatrixWorld();
    // Fit the actual vertices to the perspective frustum with breathing room.
    const vertical=Math.tan(THREE.MathUtils.degToRad(camera.fov/2));
    const horizontal=vertical*camera.aspect;let distance=0;
    const rotation=new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(config.rotation.x,config.rotation.y,config.rotation.z));
    const right=new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld,0),up=new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld,1);
    for(let i=0;i<geometry.attributes.position.count;i++) {
      const raw=new THREE.Vector3().fromBufferAttribute(geometry.attributes.position,i).multiplyScalar(config.scale).applyMatrix4(rotation);
      raw.add(new THREE.Vector3(config.position.x,config.position.y,config.position.z)).sub(target);
      const depth=raw.dot(direction);
      distance=Math.max(distance,Math.abs(raw.dot(right))/(horizontal*config.framing.horizontal)+depth,Math.abs(raw.dot(up))/(vertical*config.framing.vertical)+depth);
    }
    camera.position.copy(target).addScaledVector(direction,distance);camera.lookAt(target);
    camera.setViewOffset(width,height,-width*config.framing.centerX,height*config.framing.centerY,width,height);
    camera.updateProjectionMatrix();render(performance.now());
  }
  function render(now) {
    if(!staticMotion)animationSeconds+=Math.min(.1,Math.max(0,(now-animationStamp)/1000));
    animationStamp=now;
    const phase=animationSeconds/(config.idle.period/1000)*Math.PI*2;
    const p=dismissAt===null?0:Math.min(1,(now-dismissAt)/500);
    group.rotation.y=config.rotation.y+(staticMotion?0:Math.sin(phase)*config.idle.yaw)+p*.025;
    // +X is the aircraft's longitudinal axis: roll about X, pitch about Z.
    group.rotation.x=config.rotation.x+(staticMotion?0:Math.sin(phase*.77)*config.idle.bank);
    group.rotation.z=config.rotation.z+(staticMotion?0:Math.sin(phase*.91)*config.idle.pitch);
    group.position.y=config.position.y+(staticMotion?0:Math.sin(phase*.8)*config.idle.vertical);
    group.position.x=config.position.x+(staticMotion?0:Math.sin(phase*.69)*config.idle.longitudinal)-p*.18;
    group.position.z=config.position.z+(staticMotion?0:Math.sin(phase*.82)*config.idle.lateral);
    terrain.update(animationSeconds,1-Math.min(1,p*1.4));
    rings.update(1-p);
    secondaryMaterial.opacity=config.edges.secondary*(1-Math.min(1,p*2.5));
    majorMaterial.opacity=config.edges.major*(1-Math.min(1,Math.max(0,p-.2)*1.7));
    silhouetteMaterial.uniforms.intensity.value=config.edges.silhouette*(1-Math.max(0,(p-.5)*2));
    baseMaterial.opacity=1-p;
    renderer.render(scene,camera);
  }
  function tick(now) {
    frame=0;if(disposed||document.hidden||!intersecting)return;
    if(now-last>=1000/config.idle.fps) {
      if(last && now-last>85)slowFrames++;else slowFrames=Math.max(0,slowFrames-1);
      if(!qualityReduced && slowFrames>=12){qualityReduced=true;renderer.setPixelRatio(1);resize();}
      render(now);last=now;
    }
    if(!staticMotion || (dismissAt!==null&&now-dismissAt<500))frame=requestAnimationFrame(tick);
  }
  function wake() {if(disposed)return;animationStamp=performance.now();last=0;if(frame)cancelAnimationFrame(frame);frame=0;if(!document.hidden&&intersecting){render(performance.now());if(!staticMotion)frame=requestAnimationFrame(tick);}}
  const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(host);
  const intersectionObserver=new IntersectionObserver(entries=>{intersecting=entries[0].isIntersecting;wake();});intersectionObserver.observe(host);
  document.addEventListener('visibilitychange',wake);
  function dispose() {
    if(disposed)return;disposed=true;cancelAnimationFrame(frame);
    resizeObserver.disconnect();intersectionObserver.disconnect();document.removeEventListener('visibilitychange',wake);
    canvas.removeEventListener('webglcontextlost',lost);
    scene.traverse(object=>{object.geometry?.dispose();object.material?.dispose();});
    geometry.dispose();renderer.dispose();renderer.forceContextLoss();canvas.remove();host.parentElement.classList.remove('has-webgl');
  }
  function lost(event){event.preventDefault();dispose();}
  canvas.addEventListener('webglcontextlost',lost);
  host.append(canvas);resize();host.parentElement.classList.add('has-webgl');wake();
  return {dispose,dismiss(){dismissAt=performance.now();if(staticMotion)dismissAt-=500;wake();},setReduced(value){staticMotion=value;wake();},snapshot(type='image/png'){render(performance.now());return canvas.toDataURL(type,.93);}};
}
