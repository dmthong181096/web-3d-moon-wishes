import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';

type Point = [number,number,number];
const porcelain='#adc9bf',gold='#caaa69';
function Ring({radius,y,color=gold,tube=.008}:{radius:number;y:number;color?:string;tube?:number}) {
  return <mesh position={[0,y,0]} rotation-x={Math.PI/2}><torusGeometry args={[radius,tube,8,48]}/><meshStandardMaterial color={color} metalness={.55} roughness={.4}/></mesh>;
}
function Mooncake({position,rotation=0,scale=1}:{position:Point;rotation?:number;scale?:number}) {
  const geometry=useMemo(()=>{
    const shape=new THREE.Shape();
    for(let i=0;i<=144;i++){const a=i/144*Math.PI*2,r=.165*(1+.055*Math.cos(a*12)),x=Math.cos(a)*r,y=Math.sin(a)*r;if(i===0)shape.moveTo(x,y);else shape.lineTo(x,y);}
    const geo=new THREE.ExtrudeGeometry(shape,{depth:.09,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.008,bevelThickness:.008,curveSegments:48});geo.rotateX(-Math.PI/2);return geo;
  },[]);
  return <group position={position} rotation-y={rotation} scale={scale}>
    <mesh geometry={geometry} castShadow receiveShadow><meshStandardMaterial color="#c5863b" roughness={.76}/></mesh>
    <Ring radius={.139} y={.101} color="#e1aa57" tube={.006}/>
    <Ring radius={.119} y={.102} color="#95602e" tube={.003}/>
    {Array.from({length:8},(_,i)=>{const angle=i/8*Math.PI*2;return <Line key={i} points={Array.from({length:25},(_,j)=>{const a=j/24*Math.PI*2,r=.058+Math.cos(a)*.043,w=Math.sin(a)*.019;return [Math.cos(angle)*r-Math.sin(angle)*w,.102,Math.sin(angle)*r+Math.cos(angle)*w] as Point;})} color="#e4b365" lineWidth={1.2}/>;})}
    <mesh position={[0,.103,0]}><cylinderGeometry args={[.022,.022,.006,16]}/><meshStandardMaterial color="#e2ac58" roughness={.7}/></mesh>
    {Array.from({length:24},(_,i)=>{const a=i/24*Math.PI*2;return <mesh key={i} position={[Math.cos(a)*.168,.046,Math.sin(a)*.168]} rotation-y={-a}><boxGeometry args={[.012,.055,.009]}/><meshStandardMaterial color="#a9692d" roughness={.8}/></mesh>;})}
  </group>;
}
function Teacup({position}:{position:Point}) {
  const profile=useMemo(()=>[[.034,0],[.047,.015],[.078,.065],[.087,.115],[.078,.115],[.069,.06],[.035,.022],[0,.022]].map(([r,y])=>new THREE.Vector2(r,y)),[]);
  return <group position={position}>
    <mesh><cylinderGeometry args={[.127,.109,.016,40]}/><meshStandardMaterial color={porcelain} roughness={.27}/></mesh>
    <Ring radius={.12} y={.01} tube={.004}/>
    <mesh castShadow><latheGeometry args={[profile,40]}/><meshPhysicalMaterial color={porcelain} roughness={.23} clearcoat={.8}/></mesh>
    <Ring radius={.083} y={.115} tube={.005}/>
    <mesh position={[0,.088,0]} rotation-x={-Math.PI/2}><circleGeometry args={[.075,40]}/><meshPhysicalMaterial color="#6b3d15" roughness={.17} clearcoat={1}/></mesh>
  </group>;
}
function Teapot() {
  const profile=useMemo(()=>[[.09,0],[.16,.035],[.188,.12],[.175,.2],[.12,.265],[.095,.272]].map(([r,y])=>new THREE.Vector2(r,y)),[]);
  const spout=useMemo(()=>new THREE.CatmullRomCurve3([new THREE.Vector3(.14,.09,0),new THREE.Vector3(.24,.13,0),new THREE.Vector3(.29,.25,0),new THREE.Vector3(.35,.285,0)]),[]);
  return <group position={[.29,.57,-.12]} rotation-y={-.5}>
    <mesh castShadow><latheGeometry args={[profile,48]}/><meshPhysicalMaterial color={porcelain} roughness={.23} clearcoat={.85}/></mesh>
    <mesh position={[0,.27,0]} scale={[.116,.035,.116]}><sphereGeometry args={[1,32,20]}/><meshPhysicalMaterial color={porcelain} roughness={.25} clearcoat={.8}/></mesh>
    <Ring radius={.105} y={.279} tube={.006}/>
    <mesh position={[0,.32,0]}><sphereGeometry args={[.029,20,16]}/><meshStandardMaterial color={gold} metalness={.5} roughness={.35}/></mesh>
    <mesh position={[-.178,.15,0]} scale={[.68,1,.8]}><torusGeometry args={[.142,.024,12,40]}/><meshPhysicalMaterial color={porcelain} roughness={.25} clearcoat={.8}/></mesh>
    <mesh castShadow><tubeGeometry args={[spout,24,.035,14,false]}/><meshPhysicalMaterial color={porcelain} roughness={.23} clearcoat={.8}/></mesh>
    <Ring radius={.168} y={.06} tube={.006}/>
    {[0,1,2,3,4].map(i=><mesh key={i} position={[Math.sin(i*1.256)*.036,.15+Math.cos(i*1.256)*.035,.178]} rotation-z={-i*1.256} scale={[.013,.026,.004]}><sphereGeometry args={[1,12,8]}/><meshStandardMaterial color="#527f7a" roughness={.35}/></mesh>)}
  </group>;
}
function Steam({reduced}:{reduced:boolean}) {
  const group=useRef<THREE.Group>(null);
  useFrame(({clock})=>{if(group.current)group.current.rotation.y=reduced?0:Math.sin(clock.elapsedTime*.45)*.35;});
  if(reduced)return null;
  return <group ref={group} position={[.32,.88,-.12]}>{[-1,0,1].map(i=><Line key={i} points={Array.from({length:18},(_,j)=>{const t=j/17;return [Math.sin(t*6+i)*.025+i*.022,t*.32,Math.cos(t*4+i)*.02] as Point;})} color="#e6e2d2" transparent opacity={.12} lineWidth={1} depthWrite={false}/>)}</group>;
}
export default function MoonTeaTable({reduced}:{reduced:boolean}) {
  return <group position={[-1.85,.43,2.27]} rotation-y={.15}>
    {/* Low carved wood table with a brass edge and an inset serving tray. */}
    <mesh position={[0,.475,0]} castShadow receiveShadow><cylinderGeometry args={[.79,.77,.09,80]}/><meshStandardMaterial color="#67432e" roughness={.6}/></mesh>
    <Ring radius={.774} y={.517} tube={.012}/>
    <mesh position={[0,.415,0]}><cylinderGeometry args={[.66,.69,.06,64]}/><meshStandardMaterial color="#3b2a25" roughness={.8}/></mesh>
    {[0,1,2,3].map(i=>{const a=i/4*Math.PI*2+.7;return <group key={i} position={[Math.cos(a)*.48,.2,Math.sin(a)*.48]} rotation-z={Math.cos(a)*-.1} rotation-x={Math.sin(a)*.1}><mesh castShadow><cylinderGeometry args={[.042,.062,.4,12]}/><meshStandardMaterial color="#503526" roughness={.72}/></mesh><mesh position={[0,-.175,0]}><cylinderGeometry args={[.065,.065,.035,16]}/><meshStandardMaterial color={gold} metalness={.55} roughness={.5}/></mesh></group>;})}
    <mesh position={[0,.529,0]} rotation-y={.15}><boxGeometry args={[.54,.012,1.46]}/><meshStandardMaterial color="#ad8663" roughness={.95}/></mesh>
    <group position={[-.26,.552,-.03]}>
      <mesh receiveShadow><cylinderGeometry args={[.36,.33,.026,64]}/><meshPhysicalMaterial color="#d8ded0" roughness={.32} clearcoat={.6}/></mesh>
      <Ring radius={.348} y={.018} tube={.006}/>
      <Mooncake position={[-.12,.023,.075]} rotation={.2}/>
      <Mooncake position={[.115,.023,-.11]} rotation={-.25} scale={.85}/>
    </group>
    <Teapot/>
    <Teacup position={[.35,.55,.33]}/><Teacup position={[-.02,.55,.43]}/>
    <Steam reduced={reduced}/>
  </group>;
}
