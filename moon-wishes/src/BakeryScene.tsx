import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls, Sparkles, Stars } from '@react-three/drei';
import * as THREE from 'three';

type Props={filling:number;stage:number;stamp:string};
const colors=['#ce765a','#687855','#573746'];
function Box({p,s,c,r=0}:{p:[number,number,number];s:[number,number,number];c:string;r?:number}){return <mesh position={p} rotation-y={r} castShadow receiveShadow><boxGeometry args={s}/><meshStandardMaterial color={c} roughness={.72}/></mesh>}
function Bunny(){const g=useRef<THREE.Group>(null);useFrame(({clock})=>{if(g.current){g.current.position.y=1.05+Math.sin(clock.elapsedTime*.8)*.035;g.current.rotation.y=Math.sin(clock.elapsedTime*.45)*.06}});return <group ref={g} position={[-1.8,1.05,.15]}>
  <mesh position={[0,.95,0]} scale={[.6,.57,.5]} castShadow><sphereGeometry args={[1,28,24]}/><meshStandardMaterial color="#fcf2df" roughness={.83}/></mesh>
  {[[-.32,1.6,0,.82],[.32,1.6,0,.78]].map(([x,y,z,s],i)=><group key={i} position={[x,y,z]} rotation-z={i?-.19:.18}><mesh scale={[.17,.58*s,.15]} castShadow><sphereGeometry args={[1,20,16]}/><meshStandardMaterial color="#fcf2df"/></mesh><mesh position={[0,0,.135]} scale={[.07,.39*s,.018]}><sphereGeometry args={[1,16,12]}/><meshStandardMaterial color="#dc9183"/></mesh></group>)}
  <mesh position={[0,.77,.45]}><sphereGeometry args={[.46,28,22]}/><meshStandardMaterial color="#fff8eb"/></mesh>
  {[-.18,.18].map(x=><mesh key={x} position={[x,.83,.86]}><sphereGeometry args={[.048,12,10]}/><meshBasicMaterial color="#403b38"/></mesh>)}
  <mesh position={[0,.69,.89]}><sphereGeometry args={[.038,12,10]}/><meshBasicMaterial color="#c86e69"/></mesh>
  <mesh position={[0,1.5,0]} scale={[.38,.2,.32]}><sphereGeometry args={[1,24,16]}/><meshStandardMaterial color="#fffaf0"/></mesh>
  <mesh position={[0,1.39,.015]} rotation-x={-.26}><cylinderGeometry args={[.018,.025,.42,8]}/><meshStandardMaterial color="#9a7253"/></mesh>
  <mesh position={[-.15,.64,.48]} scale={[.16,.13,.1]}><sphereGeometry args={[1,16,12]}/><meshStandardMaterial color="#dc9c87"/></mesh><mesh position={[.15,.64,.48]} scale={[.16,.13,.1]}><sphereGeometry args={[1,16,12]}/><meshStandardMaterial color="#dc9c87"/></mesh>
  <mesh position={[.45,1.08,0]} rotation-z={-.9}><capsuleGeometry args={[.14,.25,5,12]}/><meshStandardMaterial color="#fcf2df"/></mesh>
  <mesh position={[-.44,1.06,.08]} rotation-z={.85}><capsuleGeometry args={[.13,.24,5,12]}/><meshStandardMaterial color="#fcf2df"/></mesh>
  <mesh position={[0,.53,.22]}><coneGeometry args={[.36,.24,4]}/><meshStandardMaterial color="#63837a"/></mesh>
  <mesh position={[0,.42,.3]}><boxGeometry args={[.33,.28,.055]}/><meshStandardMaterial color="#67877e"/></mesh>
  <mesh position={[0,.37,.335]}><sphereGeometry args={[.045,12,12]}/><meshStandardMaterial color="#d8b877"/></mesh>
 </group>}

function Crescent(){const shape=useMemo(()=>{const s=new THREE.Shape();s.moveTo(.5,.87);s.absarc(0,0,1,Math.PI/3,5*Math.PI/3,false);s.quadraticCurveTo(-.36,0,.5,.87);return s},[]);return <group position={[-3.6,5.05,-2.7]} rotation-y={-.12}><mesh><extrudeGeometry args={[shape,{depth:.2,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.035,bevelThickness:.04}]}/><meshStandardMaterial color="#f4ca7d" emissive="#e3a642" emissiveIntensity={.28} roughness={.6}/></mesh></group>}

function Oven({stage}:{stage:number}){const warm=stage===2;return <group position={[1.65,1.02,-.5]}>
  <Box p={[0,.75,0]} s={[1.25,1.55,.8]} c="#a65541"/>
  <mesh position={[0,.68,.414]}><circleGeometry args={[.37,36]}/><meshStandardMaterial color={warm?'#fff0c1':'#5e2927'} emissive={warm?'#ffbc4b':'#200c12'} emissiveIntensity={warm?3:.15}/></mesh>
  <mesh position={[0,.67,.443]}><circleGeometry args={[.28,36]}/><meshStandardMaterial color="#3d2024" emissive={warm?'#e17c37':'#3c1c22'} emissiveIntensity={warm?1.4:.6}/></mesh>
  <Box p={[0,1.47,.02]} s={[1.55,.13,1.05]} c="#eac99b"/>
  <Box p={[0,.02,.02]} s={[1.5,.14,1]} c="#814331"/>
  {[[-.43,.4,.43],[.43,.4,.43]].map((p,i)=><mesh key={i} position={p as [number,number,number]}><sphereGeometry args={[.055,14,12]}/><meshStandardMaterial color="#ebbf7c" emissive="#b66a36" emissiveIntensity={warm?1:.2}/></mesh>)}
  <mesh position={[0,1.57,.08]}><cylinderGeometry args={[.26,.26,.04,32]}/><meshStandardMaterial color="#d7aa67"/></mesh>
  <mesh position={[0,1.61,.08]}><cylinderGeometry args={[.2,.2,.025,32]}/><meshStandardMaterial color="#7b4836"/></mesh>
 </group>}

function Mooncake({filling,stage,stamp}:{filling:number;stage:number;stamp:string}){const g=useRef<THREE.Group>(null);const color=stage===2?['#d59c50','#c38a43','#dfa962'][filling]:'#f0dfba';const radius=.57;const shape=useMemo(()=>{const s=new THREE.Shape();for(let i=0;i<=72;i++){const a=i/72*Math.PI*2;const r=.56*(.89+.11*Math.cos(a*12));if(i===0)s.moveTo(Math.cos(a)*r,Math.sin(a)*r);else s.lineTo(Math.cos(a)*r,Math.sin(a)*r)}return s},[]);useFrame(({clock})=>{if(g.current)g.current.rotation.y=clock.elapsedTime*.22});return <group ref={g} position={[0,1.24,.94]}>
  <mesh rotation-x={-Math.PI/2} castShadow><extrudeGeometry args={[shape,{depth:.3,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.035,bevelThickness:.035}]}/><meshStandardMaterial color={color} roughness={stage===2?.64:.86}/></mesh>
  <mesh position={[0,.37,0]} rotation-x={-Math.PI/2}><circleGeometry args={[radius*.66,40]}/><meshStandardMaterial color={stage===2?'#edc16f':'#f7ebd2'}/></mesh>
  <mesh position={[0,.39,0]} rotation-x={-Math.PI/2}><torusGeometry args={[radius*.69,.025,8,40]}/><meshStandardMaterial color={stage===2?'#b2753e':'#dbbc87'}/></mesh>
  {stamp==='hoa'?Array.from({length:8},(_,i)=><mesh key={i} position={[Math.cos(i*Math.PI/4)*.19,.407,Math.sin(i*Math.PI/4)*.19]} rotation-x={-Math.PI/2} rotation-z={-i*Math.PI/4}><capsuleGeometry args={[.058,.105,3,8]}/><meshStandardMaterial color={stage===2?'#b8793c':'#d5ad74'}/></mesh>):<mesh position={[0,.405,0]} rotation-x={-Math.PI/2}><shapeGeometry args={[crescentShape]}/><meshStandardMaterial color={stage===2?'#a96832':'#c39962'} side={THREE.DoubleSide}/></mesh>}
  {stage===2&&<group position={[.33,.54,-.15]} rotation-y={.35}><mesh><sphereGeometry args={[.1,14,12]}/><meshStandardMaterial color="#c35345"/></mesh><mesh position={[0,.09,0]} rotation-z={-.25}><coneGeometry args={[.04,.1,8]}/><meshStandardMaterial color="#56714d"/></mesh></group>}
 </group>}
const crescentShape=(()=>{const s=new THREE.Shape();s.moveTo(.13,.16);s.absarc(0,0,.21,Math.PI/3,5*Math.PI/3,false);s.quadraticCurveTo(-.07,0,.13,.16);return s})();

function Bakery({filling,stage,stamp}:Props){return <>
 <fog attach="fog" args={['#211c32',20,44]}/><ambientLight intensity={.8} color="#e2c5d5"/><hemisphereLight args={['#f1d0d1','#48323a',1.15]}/><directionalLight position={[-4,8,4]} intensity={2.4} color="#ffe4b5" castShadow shadow-mapSize={[1024,1024]}/><pointLight position={[1.7,2.1,-.1]} intensity={stage===2?3:.8} color="#ff8e49" distance={4}/>
 <Stars radius={34} depth={16} count={760} factor={1.35} saturation={.3} fade speed={.15}/><Crescent/>
 <mesh position={[0,-.4,-.1]} receiveShadow><cylinderGeometry args={[4.5,4.35,.7,64]}/><meshStandardMaterial color="#66516a"/></mesh>
 <mesh position={[0,-.02,-.1]} receiveShadow><cylinderGeometry args={[4.45,4.45,.1,64]}/><meshStandardMaterial color="#aa827a"/></mesh>
 <mesh position={[0,.04,-.1]} rotation-x={-Math.PI/2}><ringGeometry args={[4.23,4.35,64]}/><meshStandardMaterial color="#edc895"/></mesh>
 {[[-2.7,.6,1.8],[-3.3,.1,.5],[2.8,.5,-1.9],[3.1,.2,.1],[0,.2,-2.6]].map(([x,y,z],i)=><Float key={i} speed={.55+i*.08} floatIntensity={.14}><mesh position={[x,y,z]} scale={[.75,.24,.42]}><dodecahedronGeometry args={[1,1]}/><meshStandardMaterial color="#e2d3df" roughness={1} flatShading/></mesh></Float>)}
 <group position={[0,.02,-.05]}><mesh position={[0,.12,0]}><cylinderGeometry args={[2.5,2.6,.18,40]}/><meshStandardMaterial color="#744c50"/></mesh>
 {[0,1,2,3,4,5,6].map(i=><mesh key={i} position={[0,.22+i*.07,0]}><cylinderGeometry args={[2.48-i*.14,2.52-i*.14,.11,40]}/><meshStandardMaterial color={i%2?'#e3a85e':'#eaba70'}/></mesh>)}
 <mesh position={[0,.75,0]}><cylinderGeometry args={[1.9,2,.17,40]}/><meshStandardMaterial color="#7a5150"/></mesh></group>
 <group><Box p={[-.1,.72,.92]} s={[5.35,.25,1.65]} c="#764b42"/><Box p={[-.1,.88,.92]} s={[5.5,.1,1.72]} c="#e1bb85"/>
 <Box p={[-.1,1.64,-.05]} s={[5.15,1.25,.28]} c="#9e5b4f"/>
 {[-2,1.8].map(x=><group key={x} position={[x,2.05,.1]}><mesh rotation-y={Math.PI/4}><coneGeometry args={[1.15,.48,4]}/><meshStandardMaterial color="#785965"/></mesh><mesh position={[0,-.25,0]}><boxGeometry args={[1.9,.09,.42]}/><meshStandardMaterial color="#eed0a1"/></mesh></group>)}
 {[-1.83,-.96,-.09,.78,1.65].map((x,i)=><group key={i}><Box p={[x,1.55,.12]} s={[.055,.65,.055]} c="#f0ce9d"/><mesh position={[x,1.89,.13]}><sphereGeometry args={[.1,12,10]}/><meshStandardMaterial color={i%2?'#e7bd6d':'#edb893'} emissive="#d67b56" emissiveIntensity={.35}/></mesh></group>)}
 <Box p={[-2.1,1.03,.14]} s={[.6,.08,.36]} c="#653f3a"/><Box p={[2,1.03,.14]} s={[.6,.08,.36]} c="#653f3a"/></group>
 <Oven stage={stage}/><Bunny/>
 <group position={[-.1,1.02,1.08]}><mesh position={[0,.07,0]}><cylinderGeometry args={[.78,.78,.12,40]}/><meshStandardMaterial color="#82584a"/></mesh><mesh position={[0,.145,0]}><cylinderGeometry args={[.77,.77,.05,40]}/><meshStandardMaterial color="#edce99"/></mesh><Mooncake filling={filling} stage={stage} stamp={stamp}/>
  {stage===1&&<Float speed={.5} floatIntensity={.18}><mesh position={[.25,1,.13]} rotation-z={-.3}><cylinderGeometry args={[.13,.19,.38,12]}/><meshStandardMaterial color="#e8dfcd"/></mesh></Float>}
  {stage===2&&<Float speed={1.1} floatIntensity={.22}><group position={[0,1.3,.05]}><mesh><sphereGeometry args={[.11,14,12]}/><meshBasicMaterial color="#fff3d4"/></mesh></group></Float>}
 </group>
 {stage===2&&<Sparkles position={[0,1.4,1]} count={30} scale={[2.7,1.7,2.2]} size={3} speed={.5} color="#ffd68b"/>}
 <OrbitControls makeDefault target={[0,1.4,0]} enablePan={false} enableZoom={false} minPolarAngle={.8} maxPolarAngle={1.28} minAzimuthAngle={-.75} maxAzimuthAngle={.75}/>
 </>}
export default function BakeryScene(props:Props){return <Canvas shadows dpr={[1,1.5]} camera={{position:[8,6.2,12.5],fov:42}} gl={{antialias:true,alpha:true,powerPreference:'high-performance'}}><Bakery {...props}/></Canvas>}
