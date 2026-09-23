"""Generate a compact indexed Wyvern mesh from the authoritative binary STL.
Runtime format: WVR1 magic, uint32 vertex/index counts, xyz float32, uint16 indices.
No simplification: every source triangle is retained. Python standard library only.
"""
import argparse, hashlib, json, struct
from pathlib import Path

parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--source',type=Path,default=Path('cad/Wyvern.STL'))
parser.add_argument('--output',type=Path,default=Path('assets/landing/x02s.mesh'))
args=parser.parse_args()
data=args.source.read_bytes(); count=struct.unpack_from('<I',data,80)[0]
if len(data)!=84+50*count: raise ValueError('Expected binary STL')
vertices=[]; indices=[]; lookup={}
for i in range(count):
    for j in range(3):
        xyz=struct.unpack_from('<3f',data,96+i*50+j*12)
        if xyz not in lookup:
            lookup[xyz]=len(vertices); vertices.append(xyz)
        indices.append(lookup[xyz])
if len(vertices)>65535: raise ValueError('Mesh needs a 32-bit index format')
# Source +X is the nose; -Z is dorsal. Rotate into Three.js Y-up, preserving handedness.
lo=[min(v[k] for v in vertices) for k in range(3)]
hi=[max(v[k] for v in vertices) for k in range(3)]
center=[(a+b)/2 for a,b in zip(lo,hi)]; scale=10/(hi[0]-lo[0])
points=[((x-center[0])*scale,-(z-center[2])*scale,(y-center[1])*scale) for x,y,z in vertices]
result=struct.pack('<4sII',b'WVR1',len(points),len(indices))
result+=b''.join(struct.pack('<3f',*p) for p in points)
result+=struct.pack('<'+'H'*len(indices),*indices)
args.output.parent.mkdir(parents=True,exist_ok=True); args.output.write_bytes(result)
meta={'source':args.source.as_posix(),'sha256':hashlib.sha256(data).hexdigest(),'triangles':count,'vertices':len(points),'runtimeBytes':len(result),'coordinates':'Y-up; +X nose; normalized length 10; original triangles preserved'}
args.output.with_suffix('.json').write_text(json.dumps(meta,indent=2)+'\n')
print(json.dumps(meta))
