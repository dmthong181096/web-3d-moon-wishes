import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls, Sparkles, Stars, Line } from '@react-three/drei';
import * as THREE from 'three';

const gold = '#d9a55e';
function Box({at,size,color='#354341',rotation=0}:{at:[number,number,number];size:[number,number,number];color?:string;rotation?:number}) {return <mesh position={at} rotation-y={rotation} castShadow receiveShadow><boxGeometry args={size}/><meshStandardMaterial color={color} roughness={.82}/></mesh>}

export function Lantern({color='#ffbb64',scale=1}:{color?:string;scale?:number}) {
  const ribs = useMemo(()=>Array.from({length:10},(_,i)=>Array.from({length:25},(_,j)=>{const t=j/24*Math.PI;const r=Math.sin(t)*.45+.11; const a=i*Math.PI/5; return new THREE.Vector3(r*Math.cos(a),Math.cos(t)*.59,r*Math.sin(a));})),[]);
  return <group scale={scale}>
    <mesh><sphereGeometry args={[1,28,20]}/><meshStandardMaterial color={color} emissive={color} emissiveIntensity={.72} roughness={.7}/></mesh>
    {ribs.map((points,i)=><Line key={i} points={points.map(p=>new THREE.Vector3(p.x*1.79,p.y*1.25,p.z*1.79))} color="#a16732" lineWidth={1.2} transparent opacity={.42}/>)}
  </group>
}

function PaperLantern({color='#ffbc66',scale=1}:{color?:string;scale?:number}) {
  const lines = useMemo(()=>Array.from({length:12},(_,i)=>Array.from({length:24},(_,j)=>{const t=.22+j/23*(Math.PI-.44); return new THREE.Vector3(Math.sin(t)*.52*Math.cos(i*Math.PI/6),Math.cos(t)*.65,Math.sin(t)*.52*Math.sin(i*Math.PI/6));})),[]);
  return <group scale={scale}>
    <mesh scale={[.52,.65,.52]} castShadow><sphereGeometry args={[1,32,24,0,Math.PI,.22,Math.PI-.44]}/><meshStandardMaterial color={color} emissive={color} emissiveIntensity={.75} side={THREE.DoubleSide}/></mesh>
    <mesh scale={[.52,.65,.52]} rotation-y={Math.PI}><sphereGeometry args={[1,32,24,0,Math.PI,.22,Math.PI-.44]}/><meshStandardMaterial color={color} emissive={color} emissiveIntensity={.75} side={THREE.DoubleSide}/></mesh>
    {lines.map((p,i)=><Line key={i} points={p} color="#674320" lineWidth={1} transparent opacity={.6}/>)}
    {[-.64,.64].map(y=><mesh key={y} position={[0,y,0]}><cylinderGeometry args={[.16,.16,.07,16]}/><meshStandardMaterial color={gold} metalness={.5} roughness={.4}/></mesh>)}
    <Line points={[[0,-.67,0],[0,-1.02,0]]} color={gold} lineWidth={2}/>
    <mesh position={[0,-1.02,0]}><coneGeometry args={[.055,.23,8]}/><meshStandardMaterial color="#d78546"/></mesh>
  </group>
}

function Tree({at,scale=1,flip=1}:{at:[number,number,number];scale?:number;flip?:number}) {
  const branches = [[[0,0,0],[.1,1.1,0],[-.1,2.1,0],[.4,3.25,0]],[[0,1.4,0],[-.75,2.2,.1],[-1.1,2.5,0]],[[.1,2,0],[.8,2.6,.2],[1.4,2.8,.15]],[[.3,2.8,0],[-.1,3.4,-.2]]];
  return <group position={at} scale={[scale*flip,scale,scale]}>
    {branches.map((p,i)=><mesh key={i} castShadow><tubeGeometry args={[new THREE.CatmullRomCurve3(p.map(v=>new THREE.Vector3(...v))),12,i===0?.13:.065,6,false]}/><meshStandardMaterial color="#544a3b"/></mesh>)}
    {[[-1.05,2.6,0,.65],[-.4,2.9,.1,.85],[.5,3.3,0,.9],[1.15,2.85,.15,.65],[0,3.6,-.2,.65],[-.1,2.9,-.5,.7]].map(([x,y,z,s],i)=><mesh key={i} position={[x,y,z]} scale={[s,s*.57,s*.8]} castShadow><icosahedronGeometry args={[1,1]}/><meshStandardMaterial color={['#314e48','#3e6557','#4c7057'][i%3]} flatShading roughness={1}/></mesh>)}
  </group>
}

function Pavilion(){ return <group position={[0,.32,-2.1]}>
  <Box at={[0,.08,0]} size={[3.8,.18,2.3]} color="#747366"/>
  {[-1.5,1.5].flatMap(x=>[-.75,.75].map(z=><group key={`${x}-${z}`}><Box at={[x,1.2,z]} size={[.15,2.4,.15]} color="#854e36"/><Box at={[x,.15,z]} size={[.28,.3,.28]} color="#7e7969"/></group>))}
  <Box at={[0,2.33,0]} size={[3.4,.19,1.9]} color="#8d593c"/>
  {[0,1,2,3,4,5,6,7].map(i=><Box key={i} at={[0,2.46+i*.075,-.91+i*.14]} size={[3.95-i*.12,.14,.2]} color={i%2?'#3d5d57':'#456660'} rotation={0}/>)}
  {[0,1,2,3,4,5,6,7].map(i=><Box key={i} at={[0,2.46+i*.075,.91-i*.14]} size={[3.95-i*.12,.14,.2]} color={i%2?'#3d5d57':'#456660'}/>)}
  <Box at={[0,3.04,0]} size={[3.15,.17,.18]} color="#ab9467"/>
  {[-1,1].map(s=><Line key={s} points={[[s*1.52,3.05,0],[s*1.8,3.13,0],[s*1.95,3.34,0]]} color="#ab9467" lineWidth={5}/>)}
  {[-1.25,1.25].map(x=><group key={x} position={[x,1.73,.74]}><PaperLantern scale={.36}/></group>)}
  <Box at={[0,.8,-.7]} size={[2.8,.13,.28]} color="#865b3b"/>
 </group>}

function Courtyard(){return <group>
  <mesh position={[0,-.25,0]} receiveShadow><cylinderGeometry args={[4.65,4.35,.65,64]}/><meshStandardMaterial color="#343f3a" roughness={1}/></mesh>
  <mesh position={[0,.08,0]} receiveShadow><cylinderGeometry args={[4.64,4.64,.08,64]}/><meshStandardMaterial color="#667165" roughness={1}/></mesh>
  <mesh position={[0,.13,0]} rotation-x={-Math.PI/2}><ringGeometry args={[4.4,4.55,64]}/><meshStandardMaterial color="#ac9a73"/></mesh>
  {Array.from({length:7},(_,i)=><Box key={i} at={[0,.18,i*.65-1.5]} size={[1.4,.1,.55]} color={i%2?'#939080':'#a09c87'}/>)}
  {Array.from({length:5},(_,i)=><Box key={i} at={[0,-.07-i*.14,4+i*.27]} size={[1.95+i*.1,.18,.55]} color="#797c6a"/>)}
  <Pavilion/>
  <Tree at={[-2.7,.15,-.9]} scale={1.35}/><Tree at={[3.1,.15,-.75]} scale={1.08} flip={-1}/>
  {[-1,1].flatMap(side=>[1.6,3.1].map((z,i)=><group key={`${side}${i}`} position={[side*(i?2.5:2.15),.2,z]}><Box at={[0,.12,0]} size={[.48,.25,.48]} color="#555e50"/><Box at={[0,1.15,0]} size={[.09,2.1,.09]} color="#a07548"/><Box at={[-side*.25,2.14,0]} size={[.6,.07,.07]} color="#a07548"/><group position={[-side*.5,1.7,0]}><PaperLantern scale={.44}/></group></group>))}
  {Array.from({length:22},(_,i)=>{const a=i*2.4,r=3.4+(i%3)*.27;return <mesh key={i} position={[Math.sin(a)*r,.23,Math.cos(a)*r]} scale={[.22+(i%3)*.1,.16,.25]} castShadow><dodecahedronGeometry args={[1,0]}/><meshStandardMaterial color={i%2?'#87907a':'#424f43'} flatShading/></mesh>})}
  <group position={[2.45,.25,1.4]}><mesh position={[0,.25,0]} castShadow><cylinderGeometry args={[.52,.45,.5,14]}/><meshStandardMaterial color="#746c54"/></mesh><mesh position={[0,.51,0]}><cylinderGeometry args={[.54,.54,.06,24]}/><meshStandardMaterial color="#c4ad78"/></mesh><mesh position={[0,.61,0]}><sphereGeometry args={[.14,16,12]}/><meshStandardMaterial color="#b99059"/></mesh>{[-.3,.3].map(x=><mesh key={x} position={[x,.57,.13]}><cylinderGeometry args={[.065,.05,.09,12]}/><meshStandardMaterial color="#dad1af"/></mesh>)}</group>
 </group>}

function MainLantern({color,released,reduced}:{color:string;released:number;reduced:boolean}) {
  const group=useRef<THREE.Group>(null); const start=useRef<number|null>(null); const last=useRef(0);
  useFrame(({clock})=>{if(!group.current)return;const t=clock.elapsedTime;if(released!==last.current){start.current=t;last.current=released;}const flight=start.current===null?0:Math.min((t-start.current)*.8,12);group.current.position.set(Math.sin(t*.5)*.1+flight*.11,2.1+(reduced?0:Math.sin(t)*.09)+flight,1.3-flight*.13);group.current.rotation.y=t*.14;group.current.scale.setScalar(flight>8?Math.max(.05,1-(flight-8)*.22):1);});
  return <group ref={group} position={[0,2.1,1.3]}><PaperLantern color={color} scale={.85}/><pointLight color={color} intensity={5} distance={5} decay={2}/></group>
}

function World({color,released,reduced}:{color:string;released:number;reduced:boolean}) {
 return <>
   <fog attach="fog" args={['#0b1722',19,44]}/><ambientLight intensity={.65} color="#a2c9d9"/><hemisphereLight args={['#a2cdd0','#322b18',1.5]}/><directionalLight position={[-3,9,2]} intensity={2.4} color="#ffe1a0" castShadow shadow-mapSize={[1024,1024]} shadow-camera-left={-7} shadow-camera-right={7} shadow-camera-top={7} shadow-camera-bottom={-7}/>
   <Stars radius={36} depth={15} count={900} factor={1.5} saturation={0} fade speed={reduced?0:.12}/>
   <group position={[-3,5.8,-7]}><mesh><sphereGeometry args={[2.25,64,48]}/><meshBasicMaterial color="#f4dfad"/></mesh><mesh><sphereGeometry args={[2.38,48,32]}/><meshBasicMaterial color="#f6d292" transparent opacity={.055} depthWrite={false}/></mesh><mesh><sphereGeometry args={[2.65,48,32]}/><meshBasicMaterial color="#edc679" transparent opacity={.028} depthWrite={false}/></mesh></group>
   <Courtyard/><MainLantern key={released} color={color} released={released} reduced={reduced}/>
   {Array.from({length:10},(_,i)=><Float key={i} speed={reduced?0:.6} floatIntensity={.5} rotationIntensity={.1}><group position={[-7+(i*3.71)%15,3+(i*1.43)%6,-5-(i%3)*2]}><PaperLantern color={i%3===0?'#e38a60':'#eac185'} scale={.09+(i%3)*.035}/></group></Float>)}
   {!reduced&&<Sparkles count={36} scale={[9,5,8]} size={2} speed={.22} color="#ebcf8c" position={[0,2,0]}/>}
   <OrbitControls makeDefault target={[0,2,0]} enablePan={false} enableZoom={false} minPolarAngle={.8} maxPolarAngle={1.3} minAzimuthAngle={-.35} maxAzimuthAngle={.9} autoRotate={false}/>
 </>
}

export default function Scene(props:{color:string;released:number;reduced:boolean}) {
 return <Canvas shadows dpr={[1,1.6]} camera={{position:[9,7.1,14],fov:43}} gl={{antialias:true,alpha:true,powerPreference:'high-performance'}}><World {...props}/></Canvas>
}
