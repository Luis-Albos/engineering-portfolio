const build=document.documentElement.dataset.build;
const versioned=path=>{const url=new URL(path,import.meta.url);url.searchParams.set('v',build);return url.href;};
const [THREE,{TERRAIN_CONFIG:config,LANDING_PALETTE}]=await Promise.all([
  import(versioned('../assets/vendor/three/three.module.min.js')),
  import(versioned('./experience-config.js'))
]);

// Integer-periodic noise is evaluated ONCE at construction, never per frame.
// Opposite tile edges have identical heights, including at the travel wrap.
function noise(x,z,period) {
  const wrap=n=>((n%period)+period)%period;
  const hash=(a,b)=>{let n=Math.imul(wrap(a),374761393)+Math.imul(wrap(b),668265263);n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967295;};
  const ix=Math.floor(x),iz=Math.floor(z),fx=x-ix,fz=z-iz;
  const smooth=t=>t*t*t*(t*(t*6-15)+10),u=smooth(fx),v=smooth(fz);
  const mix=(a,b,t)=>a+(b-a)*t;
  return mix(mix(hash(ix,iz),hash(ix+1,iz),u),mix(hash(ix,iz+1),hash(ix+1,iz+1),u),v);
}
function heightAt(x,z) {
  const cycles=config.cycles;
  const u=x/config.size,v=z/config.size;
  const wx=config.warp*(noise(u*cycles+17,v*cycles+5,cycles)-.5);
  const wz=config.warp*(noise(u*cycles+3,v*cycles+29,cycles)-.5);
  const px=u*cycles+wx,pz=v*cycles+wz;
  const broad=noise(px,pz,cycles);
  const ridgeSample=2*noise(px*2+8,pz*2+3,cycles*2)-1;
  const ridge=1-ridgeSample*ridgeSample;
  const detail=noise(px*4+41,pz*4+9,cycles*4)-.5;
  // A fixed, periodic depth envelope keeps the flight corridor low and the
  // larger mountains behind it. It travels with the same immutable geometry.
  const background=Math.max(0,-Math.sin(v*Math.PI*2));
  const depthScale=config.valleyScale+(1-config.valleyScale)*background*background;
  return config.heightScale*depthScale*(broad+config.roughness*(.48*ridge+.16*detail));
}

export function createContourTerrain(options={}) {
  const work=buildContourTerrain(options);
  if(!options.yieldWork){let step;do{step=work.next();}while(!step.done);return step.value;}
  return (async()=>{try{let step;while(!(step=work.next()).done)await options.yieldWork();return step.value;}catch(error){work.return();throw error;}})();
}
function* buildContourTerrain({lowDetail=false}={}) {
  const palette=getComputedStyle(document.documentElement);
  const background=new THREE.Color(palette.getPropertyValue(LANDING_PALETTE.backgroundVariable).trim()||'#171a1e');
  const lineColor=new THREE.Color(palette.getPropertyValue(LANDING_PALETTE.contourVariable).trim()||'#aeb3b8');
  const segments=lowDetail?config.lowSegments:config.segments;
  const geometry=new THREE.PlaneGeometry(config.size,config.size,segments,segments);
  geometry.rotateX(-Math.PI/2);
  const positions=geometry.attributes.position;
  let complete=false;
  try {
  for(let i=0;i<positions.count;i++){
    if(i%512===0)yield;
    positions.setY(i,heightAt(positions.getX(i),positions.getZ(i)));
  }
  positions.needsUpdate=true;geometry.computeVertexNormals();geometry.computeBoundingSphere();
  const material=new THREE.ShaderMaterial({
    transparent:true,depthWrite:true,side:THREE.DoubleSide,
    uniforms:{background:{value:background},lineColor:{value:lineColor},density:{value:config.contourDensity},
      intensity:{value:config.contourOpacity},lineWidth:{value:config.lineWidth},fade:{value:1},
      fogNear:{value:config.fogNear},fogFar:{value:config.fogFar},extent:{value:config.size*.5},
      resolution:{value:new THREE.Vector2(1,1)},aliasFade:{value:new THREE.Vector2(...config.aliasFade)}},
    vertexShader:`
      varying float elevation,viewDepth;varying vec2 ground;varying vec3 terrainNormal;
      void main(){
        // Both the surface and contour scalar are immutable in model space.
        elevation=position.y;terrainNormal=mat3(modelMatrix)*normal;
        vec4 world=modelMatrix*vec4(position,1.0);ground=world.xz;
        vec4 view=viewMatrix*world;viewDepth=-view.z;
        gl_Position=projectionMatrix*view;
      }`,
    fragmentShader:`
      uniform float density,intensity,lineWidth,fade,fogNear,fogFar,extent;
      uniform vec2 resolution,aliasFade;uniform vec3 background,lineColor;
      varying float elevation,viewDepth;varying vec2 ground;varying vec3 terrainNormal;
      // Integral of a periodic line pulse. Integrating over the pixel footprint
      // preserves coverage during subpixel movement instead of toggling a threshold.
      float integral(float x,float halfWidth){
        float f=fract(x);
        return floor(x)*2.0*halfWidth+min(f,halfWidth)+max(0.0,f-(1.0-halfWidth));
      }
      float coverage(float level,float footprint,float halfWidth){
        return clamp((integral(level+footprint*.5,halfWidth)-integral(level-footprint*.5,halfWidth))/footprint,0.0,1.0);
      }
      void main(){
        float level=elevation*density;
        float footprint=max(fwidth(level),.0001);
        float halfWidth=min(.45,footprint*lineWidth*.5);
        float minor=coverage(level,footprint,halfWidth);
        float major=coverage(level/5.0,footprint/5.0,halfWidth/5.0);
        float contour=(.65*minor+.35*major)*(1.0-smoothstep(aliasFade.x,aliasFade.y,footprint));
        float fog=1.0-smoothstep(fogNear,fogFar,viewDepth);
        // Fade in world space, not at moving tile edges; seams remain invisible.
        float edge=1.0-smoothstep(extent*.72,extent,max(abs(ground.x),abs(ground.y)));
        vec2 screen=gl_FragCoord.xy/resolution;
        float atmosphere=smoothstep(.06,.75,1.0-screen.y+screen.x*.32);
        float ink=contour*intensity*fog*atmosphere;
        // Subtle terrain-only relief lighting makes the fixed ridges legible.
        float light=max(0.0,dot(normalize(terrainNormal),normalize(vec3(-.35,.8,.3))));
        vec3 relief=background*(.60+.65*light);
        gl_FragColor=vec4(mix(relief,lineColor,ink),fade*edge*fog);
        #include <colorspace_fragment>
      }`
  });
  const mesh=new THREE.Group();mesh.position.y=config.elevation;
  // Shared-geometry tiles support either ground-plane travel direction.
  // Tiles outside the camera frustum are culled normally.
  const columns=config.direction.x?1:0,rows=config.direction.z?1:0;
  for(let x=-columns;x<=columns;x++)for(let z=-rows;z<=rows;z++){
    const tile=new THREE.Mesh(geometry,material);tile.position.set(x*config.size,0,z*config.size);tile.renderOrder=-2;mesh.add(tile);
  }
  const direction=new THREE.Vector2(config.direction.x,config.direction.z).normalize();
  const wrap=value=>THREE.MathUtils.euclideanModulo(value+config.size*.5,config.size)-config.size*.5;
  complete=true;
  return {mesh,
    resize(width,height,pixelRatio=1){material.uniforms.resolution.value.set(width,height);material.uniforms.lineWidth.value=config.lineWidth*pixelRatio;},
    update(seconds,opacity=1){
      mesh.position.x=wrap(seconds*config.forwardSpeed*direction.x);
      mesh.position.z=wrap(seconds*config.forwardSpeed*direction.y);
      material.uniforms.fade.value=opacity;
    }
  };
  } finally {if(!complete)geometry.dispose();}
}
