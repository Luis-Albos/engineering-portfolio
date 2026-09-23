import * as THREE from '../assets/vendor/three/three.module.min.js';

// Screen-space construction geometry: CSS-pixel distance preserves circularity
// at every viewport aspect ratio and renderer pixel ratio. No silhouette mask.
export const RING_LAYOUT = { centerX: .66, centerY: .55, radius: .34, innerRatio: .78, spacing: 10, opacity: .40 };
export function createRegistrationRings() {
  const material = new THREE.ShaderMaterial({
    transparent: true, depthTest: false, depthWrite: false,
    uniforms: { size: {value: new THREE.Vector2(1, 1)}, center: {value: new THREE.Vector2()}, radius: {value: 1}, fade: {value: 1} },
    vertexShader: 'varying vec2 uvScreen; void main(){uvScreen=uv;gl_Position=vec4(position.xy,0.0,1.0);}',
    fragmentShader: `
      uniform vec2 size,center; uniform float radius,fade; varying vec2 uvScreen;
      float ring(vec2 p,float r){
        float count=floor(6.28318530718*r/${RING_LAYOUT.spacing.toFixed(1)});
        float stepAngle=6.28318530718/count;
        float angle=floor(atan(p.y,p.x)/stepAngle+.5)*stepAngle;
        float d=length(p-r*vec2(cos(angle),sin(angle)));
        return 1.0-smoothstep(.35,1.1,d);
      }
      void main(){
        vec2 p=uvScreen*size-center;
        float ink=max(ring(p,radius),ring(p,radius*${RING_LAYOUT.innerRatio})*.55);
        gl_FragColor=vec4(vec3(.68,.71,.73),ink*${RING_LAYOUT.opacity}*fade);
      }`
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  mesh.frustumCulled = false;
  // Terrain is -2; aircraft surfaces and edges are 0. Rings never write depth.
  mesh.renderOrder = -1;
  return {mesh, resize(width,height) {
    material.uniforms.size.value.set(width,height);
    material.uniforms.center.value.set(width*RING_LAYOUT.centerX,height*(1-RING_LAYOUT.centerY));
    material.uniforms.radius.value=Math.min(width,height)*RING_LAYOUT.radius;
  }, update(opacity) { material.uniforms.fade.value=opacity; }};
}
