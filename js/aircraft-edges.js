// Weld triangle corners by position so CAD seams do not become a wireframe.
// Adjacent face normals let the GPU select silhouettes as the assembly rotates.
export function createAircraftEdges(THREE, aircraft, config) {
  const material=new THREE.ShaderMaterial({
    transparent:true,depthTest:true,depthWrite:false,
    uniforms:{
      edgeColor:{value:new THREE.Color(config.color).multiplyScalar(config.brightness)},
      silhouetteOpacity:{value:config.silhouetteOpacity},internalOpacity:{value:config.internalOpacity},
      thresholdCos:{value:Math.cos(THREE.MathUtils.degToRad(config.threshold))},fade:{value:1}
    },
    vertexShader:`
      attribute vec3 faceA; attribute vec3 faceB; attribute vec3 midpoint;
      attribute float boundary;
      uniform float silhouetteOpacity, internalOpacity, thresholdCos;
      varying float edgeOpacity;
      void main(){
        vec3 viewDirection=normalize(-(modelViewMatrix*vec4(midpoint,1.0)).xyz);
        vec3 a=normalize(normalMatrix*faceA), b=normalize(normalMatrix*faceB);
        float facingA=dot(a,viewDirection), facingB=dot(b,viewDirection);
        bool silhouette=boundary>0.5 || facingA*facingB<0.0;
        bool crease=dot(faceA,faceB)<thresholdCos;
        edgeOpacity=silhouette?silhouetteOpacity:(crease?internalOpacity:0.0);
        gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);
      }`,
    fragmentShader:`
      uniform vec3 edgeColor; uniform float fade;
      varying float edgeOpacity;
      void main(){
        if(edgeOpacity<0.001) discard;
        gl_FragColor=vec4(edgeColor,edgeOpacity*fade);
        #include <colorspace_fragment>
      }`
  });
  const cache=new Map(),meshes=[];
  aircraft.traverse(node=>{if(node.isMesh)meshes.push(node);});
  for(const mesh of meshes){
    let geometry=cache.get(mesh.geometry);
    if(!geometry){
      const position=mesh.geometry.attributes.position,index=mesh.geometry.index;
      const edges=new Map(),corners=[new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3()];
      const normal=new THREE.Vector3(),delta=new THREE.Vector3();
      const key=v=>`${Math.round(v.x*1e6)},${Math.round(v.y*1e6)},${Math.round(v.z*1e6)}`;
      for(let i=0;i<(index?index.count:position.count);i+=3){
        corners.forEach((v,j)=>v.fromBufferAttribute(position,index?index.getX(i+j):i+j));
        normal.subVectors(corners[1],corners[0]).cross(delta.subVectors(corners[2],corners[0]));
        if(normal.lengthSq()<1e-20)continue;
        normal.normalize();
        for(let j=0;j<3;j++){
          const a=corners[j],b=corners[(j+1)%3],ka=key(a),kb=key(b);
          if(ka===kb)continue;
          const id=ka<kb?`${ka}/${kb}`:`${kb}/${ka}`,existing=edges.get(id);
          if(existing)existing.b=normal.clone();
          else edges.set(id,{start:a.clone(),end:b.clone(),a:normal.clone(),b:null});
        }
      }
      const attributes={position:[],faceA:[],faceB:[],midpoint:[],boundary:[]};
      for(const edge of edges.values()){
        // Coplanar triangles can never form a visible silhouette or crease.
        if(edge.b && edge.a.dot(edge.b)>0.999999)continue;
        const midpoint=edge.start.clone().add(edge.end).multiplyScalar(.5);
        for(const vertex of [edge.start,edge.end]){
          attributes.position.push(...vertex.toArray());attributes.faceA.push(...edge.a.toArray());
          attributes.faceB.push(...(edge.b||edge.a).toArray());attributes.midpoint.push(...midpoint.toArray());
          attributes.boundary.push(edge.b?0:1);
        }
      }
      geometry=new THREE.BufferGeometry();
      for(const [name,values] of Object.entries(attributes))geometry.setAttribute(name,new THREE.Float32BufferAttribute(values,name==='boundary'?1:3));
      cache.set(mesh.geometry,geometry);
    }
    const lines=new THREE.LineSegments(geometry,material);
    lines.name='Aircraft technical edges';lines.renderOrder=1;
    mesh.add(lines); // Inherit the propeller and all component transforms exactly.
  }
  return material;
}
