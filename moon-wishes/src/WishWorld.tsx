import { memo, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import type { ReactNode } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Line, OrbitControls, Sparkles, Stars, useTexture } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import MoonMaiden from './MoonMaiden';
import MoonRabbit from './MoonRabbit';
import MoonTeaTable from './MoonTeaTable';
import { flightPose } from './lanternFlights';
import type { LanternFlight } from './lanternFlights';
import WishLantern, { WISH_LANTERN_HOME } from './WishLantern';

type Point = [number, number, number];
type Blessing = { title: string; message: string };
type Props = { onRead: (wish: Blessing) => void; onWrite: () => void; lanterns: LanternFlight[]; followId: number | null; homeRevision: number; onRetire: (id: number) => void; onReady: () => void; entry: number; reduced: boolean };
function random(seed: number) { let n = seed; return () => { n = (n * 1664525 + 1013904223) >>> 0; return n / 4294967296; }; }
const ignoreRaycast = () => {};
const glowMap = (() => {
  const size = 64, data = new Uint8Array(size * size * 4);
  for(let y=0;y<size;y++) for(let x=0;x<size;x++) {
    const distance = Math.hypot((x-size/2)/(size/2),(y-size/2)/(size/2));
    const i = (y*size+x)*4; data[i]=data[i+1]=data[i+2]=255;
    data[i+3]=Math.round(Math.pow(Math.max(0,1-distance),3)*255);
  }
  const texture = new THREE.DataTexture(data,size,size); texture.needsUpdate=true; return texture;
})();
function Glow({ position=[0,0,0], size=2, color='#ffc176', opacity=.25 }: {position?:Point;size?:number;color?:string;opacity?:number}) {
  return <sprite position={position} scale={[size,size,1]} raycast={ignoreRaycast}><spriteMaterial map={glowMap} color={color} opacity={opacity} transparent blending={THREE.AdditiveBlending} depthWrite={false}/></sprite>;
}
function Wood({ points, radius=.2, end=.025, color='#645044' }: {points:Point[];radius?:number;end?:number;color?:string}) {
  const geometry=useMemo(()=>{
    const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));
    const steps=32, sides=12, geometry=new THREE.TubeGeometry(curve,steps,1,sides,false);
    const vertices=geometry.attributes.position;
    for(let i=0;i<=steps;i++) { const t=i/steps, center=curve.getPointAt(t); const radiusAt=radius*Math.pow(1-t,.85)+end*t;
      for(let j=0;j<=sides;j++) {const index=i*(sides+1)+j, angle=j/sides*Math.PI*2;const r=radiusAt*(1+.085*Math.sin(angle*5+t*14));
        vertices.setXYZ(index,center.x+(vertices.getX(index)-center.x)*r,center.y+(vertices.getY(index)-center.y)*r,center.z+(vertices.getZ(index)-center.z)*r);
      }
    }
    geometry.computeVertexNormals();return geometry;
  },[points,radius,end]);
  useEffect(()=>()=>geometry.dispose(),[geometry]);
  return <mesh geometry={geometry} castShadow receiveShadow><meshStandardMaterial color={color} roughness={.95}/></mesh>;
}
const crowns: [number,number,number,number][]=[[-2.85,4.55,.05,.84],[-2.35,5.12,-.55,1.02],[-1.55,5.6,-.3,1.05],[-.5,5.98,-.3,1.03],[.58,5.94,-.6,.97],[1.57,5.53,-.36,1],[2.5,5.05,-.25,.96],[2.95,4.45,.3,.72],[-2.12,4.52,1.02,.8],[-1.15,5.06,1.22,.91],[.08,5.26,1.17,.98],[1.32,4.96,1.15,.87],[2.08,4.36,1.1,.68],[-1.55,4.94,-1.3,.9],[-.2,5.37,-1.45,.94],[1.38,5.03,-1.4,.9]];
function Foliage() {
  const leaves=useRef<THREE.InstancedMesh>(null);
  const geometry=useMemo(()=>{
    const geo=new THREE.BufferGeometry();
    geo.setAttribute('position',new THREE.Float32BufferAttribute([-1,0,0,-.65,.04,.31,0,.06,.47,.65,.035,.27,1,0,0,.65,.035,-.27,0,.06,-.47,-.65,.04,-.31,0,.18,0],3));
    const indices:number[]=[];for(let i=0;i<8;i++)indices.push(8,i,(i+1)%8);
    geo.setIndex(indices);geo.computeVertexNormals();return geo;
  },[]);
  useEffect(()=>()=>geometry.dispose(),[geometry]);
  useLayoutEffect(()=>{
    if(!leaves.current)return;
    const rng=random(2711),object=new THREE.Object3D(),color=new THREE.Color();
    const palette=['#456b4d','#527b55','#789663','#386750','#8fa36b','#397566'];
    for(let i=0;i<9000;i++){
      const c=crowns[i%crowns.length],a=rng()*Math.PI*2,v=rng()*2-1,r=Math.cbrt(rng())*c[3];
      object.position.set(c[0]+Math.cos(a)*Math.sqrt(1-v*v)*r,c[1]+v*r*.65,c[2]+Math.sin(a)*Math.sqrt(1-v*v)*r*.85);
      object.rotation.set(rng()*1.8-.9,rng()*Math.PI*2,rng()*1.4-.7);
      const size=.08+rng()*.08;object.scale.set(size,size,size);object.updateMatrix();
      leaves.current.setMatrixAt(i,object.matrix);color.set(palette[Math.floor(rng()*palette.length)]);leaves.current.setColorAt(i,color);
    }
    leaves.current.instanceMatrix.needsUpdate=true;leaves.current.computeBoundingSphere();
  },[]);
  return <instancedMesh ref={leaves} args={[geometry,undefined,9000]}><meshStandardMaterial roughness={.79} side={THREE.DoubleSide}/></instancedMesh>;
}
function Banyan() {
  return <group position={[0,.48,-.45]} onClick={e=>e.stopPropagation()}>
    <Wood points={[[0,0,0],[-.14,1.15,.07],[.1,2.4,-.15],[-.15,3.55,0],[.25,4.85,.05]]} radius={.68} end={.19}/>
    <Wood points={[[-.5,0,.12],[-.44,1.35,.28],[-.13,2.47,.35],[-.27,3.4,.1],[-1.25,4.78,.3]]} radius={.34} end={.055} color="#76604a"/>
    <Wood points={[[.46,0,-.2],[.53,1.2,-.14],[.4,2.37,-.02],[.72,3.67,-.14],[1.58,4.75,0]]} radius={.32} end={.06}/>
    {Array.from({length:9},(_,i)=>{const a=i/9*Math.PI*2;return <Wood key={'root'+i} points={[[Math.sin(a)*.35,.64,Math.cos(a)*.35],[Math.sin(a)*.78,.21,Math.cos(a)*.83],[Math.sin(a)*1.31,.06,Math.cos(a)*1.38],[Math.sin(a)*1.95,-.03,Math.cos(a)*1.92]]} radius={.22} end={.015} color={i%2?'#645043':'#79614d'}/>})}
    {crowns.map(([x,y,z],i)=><group key={'branch'+i}><Wood points={[[.1,2.7+(i%3)*.3,0],[x*.3,3.9,z*.25],[x*.72,y-.48,z*.65],[x,y,z]]} radius={.14+(i%3)*.035} end={.025}/><Wood points={[[x*.68,y-.48,z*.6],[x*.92,y-.2,z+.13],[x+.38,y+.23,z+.31]]} radius={.05} end={.006}/></group>)}
    <Foliage/>
    {Array.from({length:26},(_,i)=>{const side=i%2?1:-1,x=side*(1.1+(i%7)*.22),z=-.9+Math.floor(i/7)*.49,top=4.7+Math.sin(i*2.3)*.25,bottom=i%4===0?.12:1.55+(i%3)*.45;return <Wood key={'vine'+i} points={[[x,top,z],[x+Math.sin(i)*.11,top-1,z+.04],[x-.06,(top+bottom)*.5,z+.1],[x+Math.sin(i*.7)*.15,bottom,z+.15]]} radius={i%4===0?.045:.02} end={.005} color="#897451"/>})}
  </group>;
}
function MoonIsland() {
  const geometry=useMemo(()=>{
    const vertices:number[]=[],colors:number[]=[],indices:number[]=[],segments=96,rings=42,color=new THREE.Color();
    const craters=[[-2.9,1.4,.52],[2.8,.9,.62],[-1.9,-2.6,.6],[2,-2.5,.43],[.8,3.05,.41]];
    for(let j=0;j<=rings;j++) for(let i=0;i<=segments;i++) {
      const a=i/segments*Math.PI*2,top=j<=24,u=top?j/24:(j-24)/(rings-24);
      const r=(top?4.25*u:4.25*Math.pow(1-u,.68))*(1+.026*Math.sin(a*5)+.035*Math.sin(a*9+1));
      const x=Math.cos(a)*r,z=Math.sin(a)*r,noise=Math.sin(x*3.8+z*2.3)*Math.cos(z*4.1-x*1.6);
      let y=top?.3+.2*(1-u*u)+noise*.055:-.04-2.3*u+noise*.16*Math.sin(u*Math.PI);
      if(top) for(const [cx,cz,cr] of craters){const d=Math.hypot(x-cx,z-cz)/cr;y-=.19*Math.exp(-d*d*3);y+=.07*Math.exp(-Math.pow(d-1,2)*22);}
      vertices.push(x,y,z);
      if(top){color.set('#929c9e').lerp(new THREE.Color('#53675e'),Math.max(0,1-r/2.6)*.7);color.multiplyScalar(.89+noise*.045+u*.09);}
      else color.set('#7c8392').lerp(new THREE.Color('#263245'),u*.85).multiplyScalar(1+noise*.1);
      colors.push(color.r,color.g,color.b);
      if(j<rings && i<segments){const n=j*(segments+1)+i;indices.push(n,n+segments+2,n+segments+1,n,n+1,n+segments+2);}
    }
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geo.setIndex(indices);geo.computeVertexNormals();return geo;
  },[]);
  useEffect(()=>()=>geometry.dispose(),[geometry]);
  return <group><mesh geometry={geometry} receiveShadow castShadow><meshStandardMaterial vertexColors roughness={.96}/></mesh>
    {Array.from({length:14},(_,i)=>{const a=i*2.4,r=2.6+(i%4)*.27,s=.09+(i%5)*.045;return <mesh key={i} position={[Math.cos(a)*r,.36,Math.sin(a)*r]} scale={[s,s*.6,s*.8]} rotation={[i,i*.4,0]}><icosahedronGeometry args={[1,1]}/><meshStandardMaterial color={i%3?'#7f898c':'#a3a69e'} roughness={1}/></mesh>})}
  </group>;
}
function PaperLantern({color='#e3a360',scale=1}:{color?:string;scale?:number}) {
  const profile=useMemo(()=>Array.from({length:33},(_,i)=>{const t=i/32;return new THREE.Vector2(.105+.2*Math.pow(Math.sin(t*Math.PI),.68)+.003*Math.sin(t*24*Math.PI),-.36+t*.72)}),[]);
  return <group scale={scale}>
    <mesh><latheGeometry args={[profile,24]}/><meshStandardMaterial color={color} emissive={color} emissiveIntensity={.73} roughness={.56} side={THREE.DoubleSide}/></mesh>
    {Array.from({length:4},(_,i)=>{const a=i/4*Math.PI*2;return <Line key={i} points={profile.map(p=>[p.x*Math.cos(a),p.y,p.x*Math.sin(a)] as Point)} color="#9f683b" lineWidth={.65} transparent opacity={.6}/>})}
    {[-.367,.367].map(y=><mesh key={y} position={[0,y,0]}><cylinderGeometry args={[.115,.115,.037,16]}/><meshStandardMaterial color="#be934f" metalness={.65} roughness={.4}/></mesh>)}
    <mesh position={[0,.437,0]}><torusGeometry args={[.072,.009,8,16,Math.PI]}/><meshStandardMaterial color="#b9975f"/></mesh>
    <group>
    <Line points={[[0,-.38,0],[0,-.59,0]]} color="#d3a260" lineWidth={1}/>
    {[-.016,0,.016].map((x,i)=><Line key={i} points={[[0,-.53,0],[x,-.71+(i%2)*.015,.005]]} color="#bc7541" lineWidth={1.3}/>)}
    <mesh position={[.023,-.53,.025]} rotation-z={-.12}><boxGeometry args={[.07,.13,.006]}/><meshStandardMaterial color="#e8cf9c"/></mesh>
    </group>
  </group>;
}
const words:Blessing[]=[{title:'Bình an',message:'Mong bạn và người thương luôn trở về nhà an yên.'},{title:'Đoàn viên',message:'Mong mỗi mùa trăng đều có một chỗ ngồi chờ bạn.'},{title:'Can đảm',message:'Mong bạn đủ can đảm bước tới điều mình yêu.'},{title:'Dịu dàng',message:'Mong những ngày khó rồi cũng hóa thành chuyện nhẹ tênh.'},{title:'Ấm áp',message:'Mong nhà luôn sáng đèn và đầy tiếng cười.'},{title:'May mắn',message:'Mong điều đẹp đẽ tìm đến bạn đúng lúc.'},{title:'Hy vọng',message:'Mong ngày mai dịu dàng hơn hôm nay.'},{title:'Thương nhau',message:'Mong chúng ta luôn nhớ cách ở bên nhau.'}];
const positions:Point[]=[[-4.8,2.4,0],[4.9,3,-.4],[-4.1,4.4,-1],[4.3,5,-2],[-3.2,6.9,-3],[3.6,7.3,-3.4],[-2.65,3.8,.85],[2.65,3.9,.85],[-1.75,3.3,.4],[1.8,3.1,.3],[-3.6,.6,2.8],[3.7,.8,2.7],[-2.9,1.3,1.9],[2.9,1.65,1.8],[-3.3,2.7,-.2],[3.1,3,-.3],[-2.2,2.1,-2.3],[2.1,1.8,-2.5],[-1.4,3.7,-1.6],[1.45,3.6,-1.5]];
function IdleLantern({position,index,onRead,reduced}:{position:Point;index:number}&Pick<Props,'onRead'|'reduced'>) {
  const group=useRef<THREE.Group>(null),phase=index*2.399;
  useFrame(({clock})=>{if(!group.current)return;const t=clock.elapsedTime;
    group.current.position.set(position[0]+(reduced?0:Math.sin(t*.48+phase)*.07),position[1]+(reduced?0:Math.sin(t*.75+phase)*.12),position[2]);
    group.current.rotation.set(reduced?0:Math.sin(t*.57+phase)*.035,reduced?0:Math.sin(t*.35+phase)*.15,reduced?0:Math.sin(t*.65+phase)*.075);
  });
  return <group ref={group} position={position} onClick={e=>{e.stopPropagation();onRead(words[index%words.length]);}} onPointerOver={e=>{e.stopPropagation();document.body.style.cursor='pointer';}} onPointerOut={()=>{document.body.style.cursor='auto';}}><PaperLantern scale={.65+(index%3)*.07} color={['#e8a95f','#e28650','#d7b773'][index%3]}/></group>;
}
function Lanterns({onRead,reduced}:Pick<Props,'onRead'|'reduced'>) {
  return <>{positions.map((position,i)=><IdleLantern key={i} position={position} index={i} onRead={onRead} reduced={reduced}/>)}</>;
}
const MovingWishLantern = memo(function MovingWishLantern({lantern,onWrite,onRead,onRetire,reduced}:{lantern:LanternFlight}&Pick<Props,'onWrite'|'onRead'|'onRetire'|'reduced'>) {
  const group=useRef<THREE.Group>(null),retired=useRef(false);
  useFrame(()=>{
    if(!group.current)return;
    const now=performance.now()/1000,pose=flightPose(lantern,now,reduced);
    group.current.position.set(WISH_LANTERN_HOME[0]+pose.drift,WISH_LANTERN_HOME[1]+pose.rise,WISH_LANTERN_HOME[2]+pose.depth);
    group.current.rotation.set(0,reduced?0:Math.sin(now*.65+lantern.id)*.045,reduced?0:Math.sin(now*.9+lantern.id)*.018);
    group.current.scale.setScalar(pose.scale);
    if(pose.finished&&!retired.current){retired.current=true;onRetire(lantern.id);}
  });
  return <group ref={group} name={'wish-lantern-'+lantern.id} position={[...WISH_LANTERN_HOME]} onClick={e=>{e.stopPropagation();if(lantern.releasedAt===null)onWrite();else onRead({title:'Điều ước của bạn',message:lantern.wish});}} onPointerOver={e=>{e.stopPropagation();document.body.style.cursor='pointer';}} onPointerOut={()=>{document.body.style.cursor='auto';}}><WishLantern reduced={reduced} sparkle={lantern.releasedAt===null}/><Glow size={2.4} color="#ffb69b" opacity={.35}/></group>;
});
function CameraRig({followId,homeRevision,reduced,entry}:Pick<Props,'followId'|'homeRevision'|'reduced'|'entry'>) {
  const controls=useRef<OrbitControlsImpl>(null);
  const lastFollow=useRef<number|null>(null);
  const lastHome=useRef(homeRevision);
  const start=useRef<number|null>(null);
  const homing=useRef(false);
  const position=useRef(new THREE.Vector3());
  const target=useRef(new THREE.Vector3());
  const homePosition=useRef(new THREE.Vector3());
  const homeTarget=useRef(new THREE.Vector3(0,2.3,0));

  const hasEntered=useRef(entry > 0);
  const swoopStart=useRef<number|null>(null);
  const swoopFromPos=useRef(new THREE.Vector3());
  const swoopFromTarget=useRef(new THREE.Vector3());
  const introPosition=useRef(new THREE.Vector3());
  const introTarget=useRef(new THREE.Vector3(-1.4, 4.2, -2.8));

  const {camera,size}=useThree();

  useEffect(()=>{
    const distance=size.width/size.height<.85?23:17.5;
    homePosition.current.set(.23,.25,1).normalize().multiplyScalar(distance).add(homeTarget.current);
    introPosition.current.set(distance * 0.38, 11.2, distance * 1.25);
    introTarget.current.set(-1.4, 4.2, -2.8);

    if (entry === 0 && !hasEntered.current && !reduced) {
      camera.position.copy(introPosition.current);
      controls.current?.target.copy(introTarget.current);
      controls.current?.update();
    } else if (hasEntered.current || reduced) {
      if (!homing.current && swoopStart.current === null && start.current === null) {
        camera.position.copy(homePosition.current);
        controls.current?.target.copy(homeTarget.current);
        controls.current?.update();
      }
    }
  },[camera,size.width,size.height,reduced]);

  useEffect(() => {
    if (entry > 0 && !hasEntered.current) {
      hasEntered.current = true;
      if (!reduced && controls.current) {
        // Record exact current camera position & target so there is ZERO jump or stutter
        swoopFromPos.current.copy(camera.position);
        swoopFromTarget.current.copy(controls.current.target);
        swoopStart.current = performance.now() / 1000;
      } else {
        camera.position.copy(homePosition.current);
        controls.current?.target.copy(homeTarget.current);
        controls.current?.update();
      }
    }
  }, [entry, reduced, camera]);

  useFrame(({clock},delta)=>{
    if(!controls.current)return;
    const now = performance.now() / 1000;

    // 1. Idle intro camera float looking at the moonlit sky
    if (entry === 0 && !hasEntered.current && !reduced) {
      const t = clock.elapsedTime;
      camera.position.x = introPosition.current.x + Math.sin(t * 0.28) * 0.45;
      camera.position.y = introPosition.current.y + Math.cos(t * 0.35) * 0.22;
      camera.position.z = introPosition.current.z + Math.sin(t * 0.2) * 0.3;
      controls.current.target.copy(introTarget.current);
      controls.current.update();
      return;
    }

    // 2. Cinematic entry swoop with smooth S-curve acceleration & deceleration (zero jerk at start)
    if (swoopStart.current !== null) {
      const elapsed = now - swoopStart.current;
      const duration = 2.6;
      const p = Math.min(1, elapsed / duration);

      // Smooth S-curve quartic ease-in-out: velocity begins at 0, accelerates gently, glides to a stop
      const ease = p < 0.5 
        ? 8 * p * p * p * p 
        : 1 - Math.pow(-2 * p + 2, 4) / 2;

      controls.current.target.lerpVectors(swoopFromTarget.current, homeTarget.current, ease);
      camera.position.lerpVectors(swoopFromPos.current, homePosition.current, ease);

      // Parabolic arc with zero derivative at 0 (no vertical popping)
      const arc = Math.pow(Math.sin(p * Math.PI), 2) * 0.45;
      camera.position.y += arc;
      controls.current.update();

      if (p >= 1) {
        swoopStart.current = null;
      }
      return;
    }

    // 3. Normal controls & follow lantern
    if(homeRevision!==lastHome.current){lastHome.current=homeRevision;start.current=null;homing.current=true;}
    if(followId!==lastFollow.current){lastFollow.current=followId;if(followId!==null){homing.current=false;start.current=clock.elapsedTime;position.current.copy(camera.position);target.current.copy(controls.current.target);}else start.current=null;}
    const smooth=reduced?1:1-Math.exp(-delta*5);
    if(homing.current){camera.position.lerp(homePosition.current,smooth);controls.current.target.lerp(homeTarget.current,smooth);controls.current.update();if(camera.position.distanceTo(homePosition.current)<.01)homing.current=false;return;}
    if(start.current===null)return;const t=clock.elapsedTime-start.current;if(t>11)return;
    const rise=reduced?4:Math.min(t*.66,6.5);camera.position.y=THREE.MathUtils.lerp(camera.position.y,position.current.y+rise,smooth);controls.current.target.y=THREE.MathUtils.lerp(controls.current.target.y,target.current.y+rise,smooth);controls.current.update();
  });

  return <OrbitControls
    ref={controls}
    makeDefault
    target={[0,2.3,0]}
    enablePan={false}
    minDistance={9}
    maxDistance={30}
    minPolarAngle={.35}
    maxPolarAngle={1.48}
    rotateSpeed={.55}
    enableDamping
    dampingFactor={.065}
    onStart={()=>{
      start.current=null;
      homing.current=false;
      swoopStart.current=null;
    }}
  />;
}
const starShape = (() => {
  const shape = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const a = (i * Math.PI) / 5 - Math.PI / 2;
    const r = i % 2 === 0 ? 0.38 : 0.155;
    const x = Math.cos(a) * r, y = Math.sin(a) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  return shape;
})();

function StarLantern({ position, rotation = [0, 0, 0], scale = 1, standing = false, reduced }: { position: Point; rotation?: Point; scale?: number; standing?: boolean; reduced: boolean }) {
  const group = useRef<THREE.Group>(null);
  const geo = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(starShape, { depth: 0.05, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015, bevelSegments: 3 });
    g.center();
    return g;
  }, []);
  useEffect(() => () => geo.dispose(), [geo]);

  useFrame(({ clock }) => {
    if (!group.current || reduced) return;
    const t = clock.elapsedTime;
    if (standing) {
      group.current.rotation.y = rotation[1] + Math.sin(t * 0.8) * 0.04;
    } else {
      group.current.rotation.z = rotation[2] + Math.sin(t * 1.1 + position[0]) * 0.07;
      group.current.rotation.x = rotation[0] + Math.cos(t * 0.9 + position[2]) * 0.05;
    }
  });

  return <group ref={group} position={position} rotation={rotation as [number, number, number]} scale={scale}>
    {/* Translucent cellophane star body */}
    <mesh geometry={geo} castShadow>
      <meshStandardMaterial color="#ff2e2e" emissive="#ff1a1a" emissiveIntensity={0.88} roughness={0.35} opacity={0.9} transparent side={THREE.DoubleSide} />
    </mesh>
    {/* Bamboo center ring */}
    <mesh><torusGeometry args={[0.138, 0.008, 8, 36]} /><meshStandardMaterial color="#fcd462" metalness={0.4} roughness={0.5} /></mesh>
    {/* Bamboo rim lines to 5 points */}
    {Array.from({ length: 5 }, (_, i) => {
      const a = (i * 2 * Math.PI) / 5 - Math.PI / 2;
      return <Line key={i} points={[[0, 0, 0], [Math.cos(a) * 0.38, Math.sin(a) * 0.38, 0]]} color="#fcd462" lineWidth={1.2} />;
    })}
    {/* Bamboo pole if standing */}
    {standing && <group position={[0, -0.65, 0]}>
      <mesh castShadow><cylinderGeometry args={[0.012, 0.014, 1.25, 12]} /><meshStandardMaterial color="#c29958" roughness={0.7} /></mesh>
      {[-0.3, 0, 0.3].map((y, i) => <mesh key={i} position={[0, y, 0]}><torusGeometry args={[0.015, 0.003, 6, 16]} /><meshStandardMaterial color="#8e6834" /></mesh>)}
    </group>}
    {/* Hanging cord if hung */}
    {!standing && <Line points={[[0, 0.38, 0], [0, 0.9, 0]]} color="#d4af37" lineWidth={1} />}
    {/* Flowing colorful streamers */}
    <group position={[0, -0.36, 0]}>
      {[-0.07, 0, 0.07].map((x, i) => <Line key={i} points={[[x, 0, 0], [x * 1.3, -0.24, 0.02], [x * 1.6, -0.45, 0.04]]} color={['#ff5e57', '#ffd32a', '#0be881'][i]} lineWidth={1.5} />)}
    </group>
    {/* Warm glowing heart light */}
    {standing && <pointLight color="#ff8243" intensity={2.2} distance={3.2} decay={2} />}
    <Glow size={1.8} color="#ff793f" opacity={0.3} />
  </group>;
}
function MoonClouds({ reduced }: { reduced: boolean }) {
  const group = useRef<THREE.Group>(null);
  const puffs = useMemo(() => {
    const rng = random(9931);
    return Array.from({ length: 22 }, (_, i) => {
      const angle = (i / 22) * Math.PI * 2 + (rng() - 0.5) * 0.25;
      const radius = 3.6 + rng() * 0.8;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = -0.28 - rng() * 0.72;
      const scale = 0.58 + rng() * 0.52;
      return { x, y, z, scale, phase: rng() * Math.PI * 2 };
    });
  }, []);
  const mists = useMemo(() => {
    const rng = random(7315);
    return Array.from({ length: 8 }, (_, i) => {
      const angle = (i / 8) * Math.PI * 2 + (rng() - 0.5) * 0.3;
      const radius = 2.8 + rng() * 1.2;
      return {
        x: Math.cos(angle) * radius,
        y: 0.38 + rng() * 0.08,
        z: Math.sin(angle) * radius,
        scaleX: 1.1 + rng() * 0.5,
        scaleZ: 0.9 + rng() * 0.4,
      };
    });
  }, []);

  useFrame(({ clock }, delta) => {
    if (!group.current || reduced) return;
    group.current.rotation.y += delta * 0.02;
  });

  return <group ref={group}>
    {/* Floating base celestial clouds */}
    {puffs.map((p, i) => <group key={i} position={[p.x, p.y, p.z]} scale={p.scale}>
      <mesh receiveShadow={false}>
        <sphereGeometry args={[1, 16, 12]} />
        <meshStandardMaterial color="#d4e8f5" roughness={0.96} transparent opacity={0.38} depthWrite={false} emissive="#4d6f88" emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[0.42, 0.12, -0.2]} scale={0.76}>
        <sphereGeometry args={[1, 12, 10]} />
        <meshStandardMaterial color="#e8f3fc" roughness={0.96} transparent opacity={0.32} depthWrite={false} emissive="#4d6f88" emissiveIntensity={0.18} />
      </mesh>
      <mesh position={[-0.38, -0.08, 0.25]} scale={0.7}>
        <sphereGeometry args={[1, 12, 10]} />
        <meshStandardMaterial color="#c2ddf0" roughness={0.96} transparent opacity={0.34} depthWrite={false} emissive="#4d6f88" emissiveIntensity={0.19} />
      </mesh>
    </group>)}
    {/* Soft ground mists around island perimeter */}
    {mists.map((m, i) => <mesh key={'mist' + i} position={[m.x, m.y, m.z]} scale={[m.scaleX, 0.06, m.scaleZ]}>
      <sphereGeometry args={[0.9, 16, 8]} />
      <meshStandardMaterial color="#eaf4fb" roughness={1} transparent opacity={0.22} depthWrite={false} emissive="#628ea8" emissiveIntensity={0.18} />
    </mesh>)}
  </group>;
}
function FallingLeaves({ reduced }: { reduced: boolean }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const leaves = useMemo(() => {
    const rng = random(5512);
    return Array.from({ length: 36 }, () => ({
      x: (rng() - 0.5) * 5.2,
      y: 1.2 + rng() * 4.4,
      z: (rng() - 0.5) * 4.6,
      speedY: 0.22 + rng() * 0.32,
      swaySpeed: 1.1 + rng() * 1.3,
      swayDist: 0.22 + rng() * 0.32,
      rotSpeed: 0.7 + rng() * 1.5,
      phase: rng() * Math.PI * 2,
      size: 0.042 + rng() * 0.032,
    }));
  }, []);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }, delta) => {
    if (!mesh.current || reduced) return;
    const t = clock.elapsedTime;
    leaves.forEach((l, i) => {
      l.y -= delta * l.speedY;
      if (l.y < 0.42) {
        l.y = 5.2 + Math.random() * 0.4;
      }
      const currX = l.x + Math.sin(t * l.swaySpeed + l.phase) * l.swayDist;
      const currZ = l.z + Math.cos(t * (l.swaySpeed * 0.8) + l.phase) * (l.swayDist * 0.7);
      dummy.position.set(currX, l.y, currZ);
      dummy.rotation.set(t * l.rotSpeed + l.phase, t * (l.rotSpeed * 0.7), Math.sin(t * 1.5 + l.phase));
      dummy.scale.set(l.size * 1.3, l.size * 0.25, l.size);
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return <instancedMesh ref={mesh} args={[undefined, undefined, leaves.length]} frustumCulled={false}>
    <coneGeometry args={[1, 1.8, 4]} />
    <meshStandardMaterial color="#fcd462" emissive="#e5a93b" emissiveIntensity={0.35} roughness={0.65} side={THREE.DoubleSide} />
  </instancedMesh>;
}
function ShootingStars({ reduced }: { reduced: boolean }) {
  const s0 = useRef<THREE.Group>(null);
  const s1 = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (reduced) return;
    const t = clock.elapsedTime;
    // Meteor 0: cycle 6.4s, visible for 0.7s
    const m0 = t % 6.4;
    if (s0.current) {
      if (m0 < 0.7) {
        const p = m0 / 0.7;
        const x = 15 - p * 26;
        const y = 16 - p * 11;
        const z = -17 - p * 5;
        const fade = Math.sin(p * Math.PI);
        s0.current.visible = true;
        s0.current.position.set(x, y, z);
        s0.current.scale.setScalar(fade * 1.2);
      } else {
        s0.current.visible = false;
      }
    }
    // Meteor 1: cycle 9.6s, offset 4.2s, visible for 0.8s
    const m1 = (t + 4.2) % 9.6;
    if (s1.current) {
      if (m1 < 0.8) {
        const p = m1 / 0.8;
        const x = -13 + p * 24;
        const y = 17 - p * 12;
        const z = -21 - p * 4;
        const fade = Math.sin(p * Math.PI);
        s1.current.visible = true;
        s1.current.position.set(x, y, z);
        s1.current.scale.setScalar(fade * 1.1);
      } else {
        s1.current.visible = false;
      }
    }
  });

  if (reduced) return null;
  return <>
    <group ref={s0} visible={false}>
      <Line points={[[0, 0, 0], [2.4, 1.05, 0.35]]} color="#ffffff" lineWidth={2.4} transparent opacity={0.85} blending={THREE.AdditiveBlending} />
      <mesh><sphereGeometry args={[0.075, 8, 8]} /><meshBasicMaterial color="#ffffff" toneMapped={false} /></mesh>
      <Glow size={1.8} color="#ffeaa7" opacity={0.55} />
    </group>
    <group ref={s1} visible={false}>
      <Line points={[[0, 0, 0], [-2.5, 1.25, 0.3]]} color="#e0f2fe" lineWidth={2.2} transparent opacity={0.8} blending={THREE.AdditiveBlending} />
      <mesh><sphereGeometry args={[0.065, 8, 8]} /><meshBasicMaterial color="#ffffff" toneMapped={false} /></mesh>
      <Glow size={1.6} color="#74b9ff" opacity={0.5} />
    </group>
  </>;
}
function Fireflies({ reduced }: { reduced: boolean }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const flies = useMemo(() => {
    const rng = random(4812);
    return Array.from({ length: 26 }, () => ({
      x: (rng() - 0.5) * 6.5,
      y: 0.9 + rng() * 3.6,
      z: 0.2 + (rng() - 0.5) * 5.2,
      speedX: 0.35 + rng() * 0.45,
      speedY: 0.4 + rng() * 0.5,
      speedZ: 0.3 + rng() * 0.4,
      phase: rng() * Math.PI * 2,
      size: 0.028 + rng() * 0.022,
    }));
  }, []);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }) => {
    if (!mesh.current || reduced) return;
    const t = clock.elapsedTime;
    flies.forEach((f, i) => {
      const pulse = Math.pow(Math.sin(t * 2.8 + f.phase), 4);
      const currX = f.x + Math.sin(t * f.speedX + f.phase) * 0.45;
      const currY = f.y + Math.cos(t * f.speedY + f.phase) * 0.32;
      const currZ = f.z + Math.sin(t * f.speedZ + f.phase) * 0.4;
      dummy.position.set(currX, currY, currZ);
      dummy.scale.setScalar(f.size * (0.4 + pulse * 1.1));
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return <instancedMesh ref={mesh} args={[undefined, undefined, flies.length]} frustumCulled={false}>
    <sphereGeometry args={[1, 10, 8]} />
    <meshBasicMaterial color="#ffeaa7" toneMapped={false} />
  </instancedMesh>;
}
function BloomingLotus({ position, scale = 1 }: { position: Point; scale?: number }) {
  const petals = useMemo(() => Array.from({ length: 8 }, (_, i) => ({ angle: (i / 8) * Math.PI * 2 })), []);
  return <group position={position} scale={scale}>
    <mesh position={[0, 0.005, 0]} rotation-x={-Math.PI / 2} receiveShadow>
      <circleGeometry args={[0.22, 24]} />
      <meshStandardMaterial color="#416b53" roughness={0.8} />
    </mesh>
    {petals.map((p, i) => <group key={i} rotation-y={p.angle}>
      <mesh position={[0.07, 0.045, 0]} rotation-z={-0.65} scale={[0.08, 0.035, 0.055]} castShadow>
        <sphereGeometry args={[1, 12, 10]} />
        <meshPhysicalMaterial color={i % 2 ? '#f8b4b8' : '#ffffff'} emissive="#d67b84" emissiveIntensity={0.25} roughness={0.4} />
      </mesh>
    </group>)}
    <mesh position={[0, 0.045, 0]}>
      <cylinderGeometry args={[0.035, 0.035, 0.02, 16]} />
      <meshStandardMaterial color="#ffcf4b" emissive="#ffa502" emissiveIntensity={0.5} roughness={0.4} />
    </mesh>
  </group>;
}
function MoonFlora() {
  const osmanthus = useMemo(() => {
    const rng = random(6129);
    return Array.from({ length: 32 }, () => ({
      x: (rng() - 0.5) * 5.2,
      z: (rng() - 0.5) * 4.8,
      rot: rng() * Math.PI * 2,
      size: 0.032 + rng() * 0.025,
      color: rng() > 0.4 ? '#fcd462' : '#ffffff',
    })).filter(f => Math.hypot(f.x, f.z) > 0.8 && Math.hypot(f.x, f.z) < 3.2);
  }, []);

  return <group>
    <BloomingLotus position={[-1.75, 0.38, 1.45]} scale={0.9} />
    <BloomingLotus position={[2.1, 0.36, 1.6]} scale={0.75} />
    {osmanthus.map((o, i) => <group key={i} position={[o.x, 0.36, o.z]} rotation-y={o.rot} scale={o.size}>
      {[0, 1, 2, 3].map(j => <mesh key={j} position={[Math.cos(j * Math.PI / 2) * 0.7, 0.005, Math.sin(j * Math.PI / 2) * 0.7]} scale={[0.5, 0.1, 0.35]}>
        <sphereGeometry args={[1, 8, 6]} />
        <meshStandardMaterial color={o.color} emissive={o.color} emissiveIntensity={0.3} roughness={0.7} />
      </mesh>)}
      <mesh position={[0, 0.01, 0]}><cylinderGeometry args={[0.2, 0.2, 0.04, 8]} /><meshStandardMaterial color="#e67e22" roughness={0.8} /></mesh>
    </group>)}
  </group>;
}
function Moon() {
  const texture = useTexture('/textures/moon.jpg');
  useLayoutEffect(() => { texture.colorSpace = THREE.SRGBColorSpace; }, [texture]);
  return <group position={[-7.2,7.8,-14]}>
    <Glow position={[0,0,-2.5]} size={16} color="#486581" opacity={.24}/>
    <Glow position={[0,0,-2]} size={12} color="#d5cbb4" opacity={.23}/>
    <Glow position={[0,0,-1]} size={7.5} color="#d8d9c8" opacity={.17}/>
    {/* Iridescent Lunar Halo ring */}
    <mesh position={[0,0,-.5]}>
      <ringGeometry args={[2.35,2.65,64]}/>
      <meshBasicMaterial color="#ffeaa7" transparent opacity={.18} side={THREE.DoubleSide} blending={THREE.AdditiveBlending}/>
    </mesh>
    <mesh position={[0,0,-.6]}>
      <ringGeometry args={[3.2,3.48,64]}/>
      <meshBasicMaterial color="#74b9ff" transparent opacity={.1} side={THREE.DoubleSide} blending={THREE.AdditiveBlending}/>
    </mesh>
    <mesh position={[0,0,-.7]}>
      <ringGeometry args={[4.2,4.55,64]}/>
      <meshBasicMaterial color="#ffd8a8" transparent opacity={.065} side={THREE.DoubleSide} blending={THREE.AdditiveBlending}/>
    </mesh>
    <mesh rotation={[.14,-1.8,.2]} raycast={ignoreRaycast}>
      <sphereGeometry args={[2.1,80,64]}/>
      <meshBasicMaterial map={texture} color="#e7ddc6" toneMapped={false} fog={false}/>
    </mesh>
  </group>;
}
function SkyLanterns({onRead,reduced}:Pick<Props,'onRead'|'reduced'>) {
  const mesh=useRef<THREE.InstancedMesh>(null);
  const lamps=useMemo(()=>{const rng=random(1726);return Array.from({length:64},()=>({x:(rng()-.5)*28,y:1+rng()*21,z:-7-rng()*20,size:.19+rng()*.36,phase:rng()*6.28}));},[]);
  const object=useMemo(()=>new THREE.Object3D(),[]),lastUpdate=useRef(-1);
  const profile=useMemo(()=>Array.from({length:17},(_,i)=>{const t=i/16;return new THREE.Vector2(.19+.09*Math.sin(t*Math.PI),-.4+t*.8);}),[]);
  useLayoutEffect(()=>{if(!mesh.current)return;const color=new THREE.Color();lamps.forEach((_,i)=>mesh.current!.setColorAt(i,color.set(['#ffc887','#f6a06c','#f4d4a0'][i%3])));mesh.current.instanceColor!.needsUpdate=true;},[lamps]);
  useFrame(({clock})=>{
    if(!mesh.current||clock.elapsedTime-lastUpdate.current<1/30)return;
    lastUpdate.current=clock.elapsedTime;
    lamps.forEach((lamp,i)=>{const t=reduced?0:clock.elapsedTime;object.position.set(lamp.x+Math.sin(t*.12+lamp.phase)*.13,lamp.y+Math.sin(t*.2+lamp.phase)*.28,lamp.z);object.scale.setScalar(lamp.size);object.rotation.set(.04, lamp.phase, Math.sin(t*.15+lamp.phase)*.08);object.updateMatrix();mesh.current!.setMatrixAt(i,object.matrix);});
    mesh.current.instanceMatrix.needsUpdate=true;
  });
  return <instancedMesh ref={mesh} args={[undefined,undefined,lamps.length]} frustumCulled={false} onClick={e=>{e.stopPropagation();onRead(words[(e.instanceId??0)%words.length]);}} onPointerOver={()=>{document.body.style.cursor='pointer';}} onPointerOut={()=>{document.body.style.cursor='auto';}}>
    <latheGeometry args={[profile,12]}/><meshStandardMaterial color="#ffffff" emissive="#ffb868" emissiveIntensity={1.3} roughness={.8}/>
  </instancedMesh>;
}
const StaticBanyan=memo(Banyan),StaticIsland=memo(MoonIsland),StaticMaiden=memo(MoonMaiden),StaticRabbit=memo(MoonRabbit),StaticTeaTable=memo(MoonTeaTable),StaticLanterns=memo(Lanterns),StaticFlora=memo(MoonFlora);
function SceneAtmosphere({reduced}:{reduced:boolean}) {
  return <>
    <fog attach="fog" args={['#071221', reduced ? 30 : 25, reduced ? 67 : 62]} />
    <ambientLight intensity={.28} color="#9fbada" />
    <hemisphereLight args={['#a9cce3', '#252640', .85]} />
    <directionalLight
      position={[-4, 9, 6]}
      color="#e3dabd"
      intensity={2.35}
      castShadow
      shadow-mapSize={[1024, 1024]}
      shadow-camera-left={-7}
      shadow-camera-right={7}
      shadow-camera-top={9}
      shadow-camera-bottom={-5}
      shadow-normalBias={.04}
    />
    <directionalLight position={[4, 5, -7]} color="#69c1d4" intensity={2.5} />
    <pointLight position={[-2, 2, 1.8]} color="#f2b96d" intensity={7} distance={8} />
    <pointLight position={[2.5, 2.3, -1]} color="#a997ee" intensity={6} distance={9} />
    <pointLight position={[...WISH_LANTERN_HOME]} color="#ffb77b" intensity={3.2} distance={3.8} decay={2} />
    <Stars radius={45} depth={30} count={1600} factor={2.1} saturation={.3} fade speed={reduced ? 0 : .08} />
    <Glow position={[-9, 5, -20]} size={24} color="#465592" opacity={.21} />
    <Glow position={[12, 4, -22]} size={26} color="#246c83" opacity={.17} />
  </>;
}
function SceneEntry({reduced,children}:{reduced:boolean;children:ReactNode}) {
  const group=useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!group.current) return;
    if (reduced) {
      group.current.position.set(0, 0, 0);
      group.current.rotation.set(0, 0, 0);
      return;
    }
    // Celestial island weightless hover
    group.current.position.y = Math.sin(clock.elapsedTime * 0.7) * 0.022;
    group.current.rotation.y = Math.sin(clock.elapsedTime * 0.35) * 0.005;
  });

  return <group ref={group}>
    {children}
    {!reduced && (
      <Sparkles count={42} scale={[10, 6, 8]} size={2} speed={0.25} color="#ffd48a" position={[0, 2.8, 0]} />
    )}
  </group>;
}
function World(props:Props) {
  const readyFrames=useRef(0);
  useFrame(()=>{if(readyFrames.current<3){readyFrames.current++;if(readyFrames.current===3)props.onReady();}});
  return <>
    <SceneAtmosphere reduced={props.reduced} />
    <ShootingStars reduced={props.reduced} />
    <SceneEntry reduced={props.reduced}>
      <Moon/>
      <SkyLanterns onRead={props.onRead} reduced={props.reduced}/>
      <MoonClouds reduced={props.reduced} />
      <StaticIsland/><StaticBanyan/><StaticRabbit reduced={props.reduced}/><StaticTeaTable reduced={props.reduced}/>
      <StaticFlora />
      <FallingLeaves reduced={props.reduced} />
      <Fireflies reduced={props.reduced} />
      {/* 1 Standing Star Lantern planted proudly on bamboo pole on the right foreground */}
      <StarLantern position={[2.15, 1.65, 1.8]} rotation={[0, -0.45, 0]} standing={true} reduced={props.reduced} scale={1.05} />
      {/* 1 Cute small star lantern resting near the moon rabbit */}
      <StarLantern position={[0.78, 0.46, 2.38]} rotation={[0.45, -0.32, -0.35]} standing={false} reduced={props.reduced} scale={0.52} />
      {/* 3 Hanging Star Lanterns in the Banyan Tree */}
      <StarLantern position={[-1.38, 3.45, 0.85]} rotation={[0.08, 0.4, -0.05]} reduced={props.reduced} scale={0.78} />
      <StarLantern position={[1.45, 3.55, 0.6]} rotation={[-0.05, -0.3, 0.08]} reduced={props.reduced} scale={0.75} />
      <StarLantern position={[-0.15, 4.35, -1.05]} rotation={[0.1, -0.25, 0.04]} reduced={props.reduced} scale={0.65} />
      <group onClick={e=>{e.stopPropagation();props.onWrite();}} onPointerOver={()=>{document.body.style.cursor='pointer';}} onPointerOut={()=>{document.body.style.cursor='auto';}}><StaticMaiden reduced={props.reduced}/></group>
      <StaticLanterns onRead={props.onRead} reduced={props.reduced}/>
      {props.lanterns.map(lantern=><MovingWishLantern key={lantern.id} lantern={lantern} onWrite={props.onWrite} onRead={props.onRead} onRetire={props.onRetire} reduced={props.reduced}/>)}
    </SceneEntry>
    <CameraRig followId={props.followId} homeRevision={props.homeRevision} reduced={props.reduced} entry={props.entry}/>
  </>;
}
function WishWorld(props:Props) {
  return <Canvas shadows dpr={[1,1.25]} camera={{position:[4,6,19],fov:43}} gl={{antialias:true,alpha:true,powerPreference:'high-performance',toneMapping:THREE.ACESFilmicToneMapping,toneMappingExposure:1.05}}><World {...props}/></Canvas>;
}

export default memo(WishWorld);
