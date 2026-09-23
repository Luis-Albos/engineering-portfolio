import * as THREE from '../assets/vendor/three/three.module.min.js';
import {TERRAIN_CONFIG as config, LANDING_PALETTE} from './experience-config.js';

// Shared height function keeps the displaced mesh and per-pixel contour field aligned.
// Arithmetic hashing avoids trigonometric noise cost; contours remain smooth between vertices.
const heightFunction = `
  uniform float travel,heightScale,roughness,frequency,warp;
  uniform vec2 direction;
  float hash(vec2 p){vec3 q=fract(vec3(p.xyx)*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}
  float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);
    return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1)),f.x),f.y);}
  float heightAt(vec2 ground){
    vec2 p=(ground-direction*travel)*frequency;
    vec2 q=p+warp*vec2(noise(p*.43+vec2(17.2,5.1))-.5,noise(p*.43+vec2(3.8,29.4))-.5);
    float broad=noise(q);
    float ridge=1.0-abs(2.0*noise(q*2.07+vec2(8.3,2.9))-1.0);
    float broken=noise(q*4.31+vec2(41.7,9.3))-.5;
    float fine=noise(q*8.13+vec2(13.1,27.4))-.5;
    return heightScale*(broad+roughness*(.48*ridge+.20*broken+.065*fine));
  }
`;

// A fixed grid samples a continuous world-space height function. Only one time
// uniform changes per frame: no terrain uploads, texture fetches, or chunk churn.
export function createContourTerrain({lowDetail=false}={}) {
  const palette=getComputedStyle(document.documentElement);
  const background=new THREE.Color(palette.getPropertyValue(LANDING_PALETTE.backgroundVariable).trim() || '#171a1e');
  const lineColor=new THREE.Color(palette.getPropertyValue(LANDING_PALETTE.contourVariable).trim() || '#aeb3b8');
  const segments=lowDetail?config.lowSegments:config.segments;
  const geometry=new THREE.PlaneGeometry(config.size,config.size,segments,segments);
  geometry.rotateX(-Math.PI/2);
  const material=new THREE.ShaderMaterial({
    transparent:true,depthWrite:true,side:THREE.DoubleSide,
    uniforms:{
      background:{value:background},lineColor:{value:lineColor},
      travel:{value:0},heightScale:{value:config.heightScale},roughness:{value:config.roughness},
      frequency:{value:config.frequency},warp:{value:config.warp},
      direction:{value:new THREE.Vector2(config.direction.x,config.direction.z).normalize()},
      density:{value:config.contourDensity},intensity:{value:config.contourOpacity},
      lineWidth:{value:config.lineWidth},fade:{value:1},
      fogNear:{value:config.fogNear},fogFar:{value:config.fogFar},resolution:{value:new THREE.Vector2(1,1)},extent:{value:config.size*.5}
    },
    vertexShader:heightFunction+`
      varying float viewDepth;
      varying vec2 ground;
      void main(){
        ground=position.xz;
        vec3 p3=position;p3.y+=heightAt(ground);
        vec4 view=modelViewMatrix*vec4(p3,1.0);viewDepth=-view.z;
        gl_Position=projectionMatrix*view;
      }`,
    fragmentShader:heightFunction+`
      uniform float density,intensity,lineWidth,fade,fogNear,fogFar,extent;
      uniform vec2 resolution;
      uniform vec3 background,lineColor;
      varying float viewDepth;
      varying vec2 ground;
      void main(){
        float level=heightAt(ground)*density;
        float footprint=max(fwidth(level),.0001);
        float d=abs(fract(level+.5)-.5);
        float contour=1.0-smoothstep(footprint*.12,footprint*lineWidth,d);
        // Fade subpixel distant contours instead of producing moire/shimmer.
        contour*=1.0-smoothstep(.55,1.35,footprint);
        float major=1.0-smoothstep(0.0,.7,abs(mod(floor(level+.5),5.0)));
        float fog=1.0-smoothstep(fogNear,fogFar,viewDepth);
        float edge=1.0-smoothstep(extent*.70,extent,max(abs(ground.x),abs(ground.y)));
        vec2 screen=gl_FragCoord.xy/resolution;
        float atmosphere=smoothstep(.06,.75,1.0-screen.y+screen.x*.32);
        float ink=contour*intensity*(.60+.40*major)*fog*atmosphere;
        gl_FragColor=vec4(mix(background,lineColor,ink),fade*edge*fog);
        #include <colorspace_fragment>
      }`
  });
  const mesh=new THREE.Mesh(geometry,material);
  mesh.position.y=config.elevation;
  // Vertex displacement lives in the shader, so don't cull by the original flat bounds.
  mesh.frustumCulled=false;
  mesh.renderOrder=-2;
  return {mesh,resize(width,height){material.uniforms.resolution.value.set(width,height);},update(seconds,opacity=1){material.uniforms.travel.value=seconds*config.forwardSpeed;material.uniforms.fade.value=opacity;}};
}
