const build=document.documentElement.dataset.build;
const versioned=path=>{const url=new URL(path,import.meta.url);url.searchParams.set('v',build);return url.href;};
const [THREE,{AIRCRAFT_CONFIG:config},{createContourTerrain},{createAircraftControls},{GLTFLoader},{createAircraftEdges}]=await Promise.all([
  import(versioned('../assets/vendor/three/three.module.min.js')),
  import(versioned('./experience-config.js')),
  import(versioned('./contour-terrain.js')),
  import(versioned('./aircraft-controls.js')),
  import(versioned('../assets/vendor/three/GLTFLoader.js')),
  import(versioned('./aircraft-edges.js'))
]);

export async function createLandingScene(host, {signal, reducedMotion=false}={}) {
  const modelUrl=new URL(config.model,import.meta.url);modelUrl.searchParams.set('v',build);
  const response=await fetch(modelUrl,{signal});
  if(!response.ok) throw new Error('Aircraft GLB unavailable');
  const buffer=await response.arrayBuffer();
  signal?.throwIfAborted();
  const gltf=await new GLTFLoader().parseAsync(buffer,new URL('.',modelUrl).href);
  signal?.throwIfAborted();
  const aircraft=gltf.scene.getObjectByName('CP1_2024');
  // GLTFLoader sanitizes spaces; original names remain in userData.name.
  let propeller;
  aircraft?.traverse(node=>{if(node.userData.name===config.propeller.node || node.name===config.propeller.node)propeller=node;});
  if(!aircraft || !propeller)throw new Error('Aircraft assembly or verified propeller node missing');
  const propellerRest=propeller.quaternion.clone();
  const spin=new THREE.Quaternion(),shaft=new THREE.Vector3(0,1,0);
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
  scene.add(new THREE.HemisphereLight(0xffffff,0x30363c,config.lighting.fillIntensity));
  const keyLight=new THREE.DirectionalLight(0xffffff,config.lighting.keyIntensity);keyLight.position.set(-4,8,6);scene.add(keyLight);
  group.position.set(config.position.x,config.position.y,config.position.z);
  group.rotation.set(config.rotation.x,config.rotation.y,config.rotation.z);
  group.scale.setScalar(config.scale);
  const baseMaterial=new THREE.MeshStandardMaterial({color:new THREE.Color(config.surface.color).multiplyScalar(config.surface.brightness),roughness:config.surface.roughness,metalness:config.surface.metalness,side:THREE.DoubleSide,transparent:true,opacity:config.surface.opacity,polygonOffset:true,polygonOffsetFactor:1,polygonOffsetUnits:1});
  // Suppress the dielectric specular lobe without changing the scene lighting.
  baseMaterial.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>','outgoingLight *= '+config.surface.lightContribution.toFixed(4)+';\n#include <opaque_fragment>');};
  aircraft.traverse(node=>{if(node.isMesh){
    const materials=Array.isArray(node.material)?node.material:[node.material];
    materials.forEach(material=>{Object.values(material).forEach(value=>{if(value?.isTexture)value.dispose();});material.dispose();});
    node.material=baseMaterial;
  }});
  const edgeMaterial=createAircraftEdges(THREE,aircraft,config.edges);
  // Center and uniformly scale the complete assembly; all component mates stay intact.
  const assemblyBounds=new THREE.Box3().setFromObject(aircraft);
  const center=assemblyBounds.getCenter(new THREE.Vector3());
  const normalization=new THREE.Group();normalization.position.copy(center).negate();
  normalization.add(aircraft);group.add(normalization);
  group.updateMatrixWorld(true);
  const fitPoints=[];
  aircraft.traverse(node=>{if(node.isMesh){
    node.geometry.computeBoundingBox();
    const {min,max}=node.geometry.boundingBox;
    for(const x of [min.x,max.x])for(const y of [min.y,max.y])for(const z of [min.z,max.z])
      fitPoints.push(new THREE.Vector3(x,y,z).applyMatrix4(node.matrixWorld));
  }});
  const camera=new THREE.PerspectiveCamera(config.camera.fov,1,.1,200);
  let disposed=false,frame=0,last=0,dismissAt=null,intersecting=true;
  let staticMotion=reducedMotion;
  let animationSeconds=0,idleSeconds=0,animationStamp=performance.now(),slowFrames=0,qualityReduced=lowDetail;
  let interactionActive=false;
  const cameraRight=new THREE.Vector3(),upAxis=new THREE.Vector3(0,1,0);
  const orbit=new THREE.Quaternion(),tilt=new THREE.Quaternion();
  const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
  const hitBounds=new THREE.Box3(),hitPoint=new THREE.Vector3();
  // The assembly envelope makes the open truss geometry practical to grab.
  function hitTest(event) {
    const rect=canvas.getBoundingClientRect();
    pointer.set((event.clientX-rect.left)/rect.width*2-1,1-(event.clientY-rect.top)/rect.height*2);
    raycaster.setFromCamera(pointer,camera);
    hitBounds.setFromObject(group);
    return raycaster.ray.intersectBox(hitBounds,hitPoint)!==null;
  }
  canvas.tabIndex=0;canvas.setAttribute('role','group');
  canvas.setAttribute('aria-label','Explore the SAE aircraft. Drag or use arrow keys to rotate. Press Escape to return to the hero view.');
  const hint=document.createElement('span');hint.className='aircraft-drag-hint';hint.textContent='Drag to explore';hint.setAttribute('aria-hidden','true');
  function hideHint(){hint.remove();try{sessionStorage.setItem('aircraftExplored','1');}catch(_){}}
  try{if(sessionStorage.getItem('aircraftExplored'))hint.hidden=true;}catch(_){}
  const controls=createAircraftControls(canvas,{config:config.interaction,hitTest,onChange:requestRender,onExplore:hideHint,reducedMotion});
  function resize() {
    if(disposed) return;
    const {width,height}=host.getBoundingClientRect();if(!width||!height)return;
    renderer.setSize(width,height,false);terrain.resize(canvas.width,canvas.height,renderer.getPixelRatio());camera.aspect=width/height;
    const target=new THREE.Vector3(...Object.values(config.camera.target));
    const direction=new THREE.Vector3(...Object.values(config.camera.position)).sub(target).normalize();
    camera.position.copy(direction);camera.lookAt(0,0,0);camera.updateMatrixWorld();
    // Fit mesh bounds to the perspective frustum with breathing room.
    const vertical=Math.tan(THREE.MathUtils.degToRad(camera.fov/2));
    const horizontal=vertical*camera.aspect;let distance=0;
    const right=new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld,0),up=new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld,1);
    for(const point of fitPoints) {
      const raw=point.clone().sub(target),depth=raw.dot(direction);
      distance=Math.max(distance,Math.abs(raw.dot(right))/(horizontal*config.framing.horizontal)+depth,Math.abs(raw.dot(up))/(vertical*config.framing.vertical)+depth);
    }
    camera.position.copy(target).addScaledVector(direction,distance);camera.lookAt(target);
    camera.updateMatrixWorld();cameraRight.setFromMatrixColumn(camera.matrixWorld,0);
    camera.setViewOffset(width,height,-width*config.framing.centerX,height*config.framing.centerY,width,height);
    camera.updateProjectionMatrix();render(performance.now());
  }
  function render(now) {
    const dt=Math.min(.1,Math.max(0,(now-animationStamp)/1000));
    animationStamp=Math.max(animationStamp,now);
    if(!staticMotion)animationSeconds+=dt;
    const interaction=controls.update(now);interactionActive=interaction.active;
    if(interaction.resumed)idleSeconds=0;
    else if(!staticMotion && !interaction.frozen)idleSeconds+=dt;
    const phase=idleSeconds/(config.idle.period/1000)*Math.PI*2;
    const drift=staticMotion?0:interaction.idleWeight;
    const settle=staticMotion?0:config.interaction.dismissReturnDuration;
    const p=dismissAt===null?0:THREE.MathUtils.clamp((now-dismissAt-settle)/500,0,1);
    group.rotation.set(config.rotation.x+Math.sin(phase*.77)*config.idle.bank*drift,
      config.rotation.y+Math.sin(phase)*config.idle.yaw*drift,
      config.rotation.z+Math.sin(phase*.91)*config.idle.pitch*drift);
    orbit.setFromAxisAngle(upAxis,interaction.yaw).multiply(tilt.setFromAxisAngle(cameraRight,interaction.pitch));
    group.quaternion.premultiply(orbit);
    // Keep the corrected spin direction independent of the paused glide clock.
    propeller.quaternion.copy(propellerRest).multiply(spin.setFromAxisAngle(shaft,animationSeconds*config.propeller.radiansPerSecond));
    group.position.set(config.position.x+Math.sin(phase*.69)*config.idle.longitudinal*drift-p*.18,
      config.position.y+Math.sin(phase*.8)*config.idle.vertical*drift,
      config.position.z+Math.sin(phase*.82)*config.idle.lateral*drift);
    terrain.update(animationSeconds,1-Math.min(1,p*1.4));
    baseMaterial.opacity=config.surface.opacity*(1-p);
    edgeMaterial.uniforms.fade.value=1-p;
    renderer.render(scene,camera);
  }
  function tick(now) {
    frame=0;if(disposed||document.hidden||!intersecting)return;
    if(now-last>=1000/config.idle.fps) {
      if(last && now-last>85)slowFrames++;else slowFrames=Math.max(0,slowFrames-1);
      if(!qualityReduced && slowFrames>=12){qualityReduced=true;renderer.setPixelRatio(1);resize();}
      render(now);last=now;
    }
    if(needsFrames(now))frame=requestAnimationFrame(tick);
  }
  function requestRender(){
    if(disposed||document.hidden||!intersecting)return;
    render(performance.now());if(!frame&&needsFrames(performance.now()))frame=requestAnimationFrame(tick);
  }
  function needsFrames(now){return !staticMotion || interactionActive || (dismissAt!==null&&now-dismissAt<config.interaction.dismissReturnDuration+500);}
  function wake() {if(disposed)return;animationStamp=performance.now();last=0;if(frame)cancelAnimationFrame(frame);frame=0;if(!document.hidden&&intersecting){render(performance.now());if(needsFrames(performance.now()))frame=requestAnimationFrame(tick);}}
  const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(host);
  const intersectionObserver=new IntersectionObserver(entries=>{intersecting=entries[0].isIntersecting;wake();});intersectionObserver.observe(host);
  document.addEventListener('visibilitychange',wake);
  function dispose() {
    if(disposed)return;disposed=true;cancelAnimationFrame(frame);
    resizeObserver.disconnect();intersectionObserver.disconnect();document.removeEventListener('visibilitychange',wake);
    controls.dispose();hint.remove();
    canvas.removeEventListener('webglcontextlost',lost);
    const geometries=new Set(),materials=new Set();
    scene.traverse(object=>{if(object.geometry)geometries.add(object.geometry);if(object.material)materials.add(object.material);});
    geometries.forEach(geometry=>geometry.dispose());materials.forEach(material=>material.dispose());
    renderer.dispose();renderer.forceContextLoss();canvas.remove();host.parentElement.classList.remove('has-webgl');
  }
  function lost(event){event.preventDefault();dispose();}
  canvas.addEventListener('webglcontextlost',lost);
  host.append(canvas,hint);
  // Only retire the static fallback after a successful first render.
  try {resize();wake();host.parentElement.classList.add('has-webgl');}
  catch(error){dispose();throw error;}
  return {dispose,dismiss(){dismissAt=performance.now();controls.dismiss(dismissAt);hideHint();if(staticMotion)dismissAt-=500;wake();},setReduced(value){staticMotion=value;controls.setReduced(value);hideHint();wake();},snapshot(type='image/png'){render(performance.now());return canvas.toDataURL(type,.93);}};
}
