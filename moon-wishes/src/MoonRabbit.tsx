import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import { MarchingCubes } from 'three-stdlib';
import * as THREE from 'three';

type Point = [number, number, number];
function SoftShape({ position, scale, color='#f5eddf' }: { position: Point; scale: Point; color?: string }) {
  return <mesh position={position} scale={scale} castShadow receiveShadow><sphereGeometry args={[1,32,24]}/><meshStandardMaterial color={color} roughness={.88}/></mesh>;
}
function useRabbitSculpture() {
  return useMemo(() => {
    // A smooth union joins head, chest and haunches into one continuous silhouette.
    const shapes = [
      {p:[0,.27,-.12],r:[.285,.285,.37]}, {p:[0,.46,.16],r:[.215,.235,.255]},
      {p:[0,.55,.26],r:[.223,.212,.218]}, {p:[0,.465,.407],r:[.12,.092,.098]},
      {p:[-.18,.165,-.22],r:[.16,.17,.245]}, {p:[.18,.165,-.22],r:[.16,.17,.245]},
    ];
    const resolution=52,material=new THREE.MeshStandardMaterial(),field=new MarchingCubes(resolution,material,false,false,16000);
    field.isolation=0;
    for(let z=0;z<resolution;z++)for(let y=0;y<resolution;y++)for(let x=0;x<resolution;x++) {
      const p=[x/resolution*2-1,y/resolution*2-1,z/resolution*2-1];let distance=10;
      for(const shape of shapes){const d=(Math.hypot((p[0]-shape.p[0])/shape.r[0],(p[1]-shape.p[1])/shape.r[1],(p[2]-shape.p[2])/shape.r[2])-1)*Math.min(...shape.r);const h=Math.max(.085-Math.abs(distance-d),0)/.085;distance=Math.min(distance,d)-h*h*.085*.25;}
      field.setCell(x,y,z,-distance);
    }
    field.update();const geometry=new THREE.BufferGeometry();
    geometry.setAttribute('position',new THREE.BufferAttribute(field.positionArray.slice(0,field.count*3),3));
    geometry.setAttribute('normal',new THREE.BufferAttribute(field.normalArray.slice(0,field.count*3),3));
    geometry.computeBoundingSphere();field.geometry.dispose();material.dispose();return geometry;
  },[]);
}
function Ear({side}:{side:number}) {
  const geometry=useMemo(()=>{
    const positions:number[]=[],indices:number[]=[];const rows=24,sides=20;
    for(let j=0;j<=rows;j++)for(let i=0;i<=sides;i++){
      const t=j/rows,a=i/sides*Math.PI*2,w=.073*Math.pow(Math.sin(Math.PI*t),.75)+.015*(1-t);
      positions.push(Math.cos(a)*w+side*.025*t*t,t*.48,Math.sin(a)*w*.48-.075*t*t);
      if(j<rows&&i<sides){const n=j*(sides+1)+i;indices.push(n,n+sides+2,n+1,n,n+sides+1,n+sides+2);}
    }
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setIndex(indices);geo.computeVertexNormals();return geo;
  },[side]);
  return <group position={[side*.095,.693,.19]} rotation={[side===1?-.16:.1,0,side*-.16]}>
    <mesh geometry={geometry} castShadow><meshStandardMaterial color="#f5eddf" roughness={.87} side={THREE.DoubleSide}/></mesh>
    <mesh geometry={geometry} position={[0,.044,.032]} scale={[.54,.79,.2]}><meshStandardMaterial color="#ddb5ad" roughness={.95} side={THREE.DoubleSide}/></mesh>
  </group>;
}
export default function MoonRabbit({reduced}:{reduced:boolean}) {
  const geometry=useRabbitSculpture(),body=useRef<THREE.Group>(null),ears=useRef<THREE.Group>(null),eyes=useRef<THREE.Group>(null);
  useFrame(({clock})=>{const t=clock.elapsedTime;
    if(body.current)body.current.scale.y=reduced?1:1+Math.sin(t*1.5)*.006;
    if(ears.current)ears.current.rotation.x=reduced?0:Math.sin(t*.7)*.018;
    if(eyes.current){const phase=t%7;eyes.current.scale.y=reduced||phase<6.72?1:.12+.88*Math.abs((phase-6.86)/.14);}
  });
  return <group position={[1.16,.445,2.13]} rotation-y={-.62} scale={1.23}>
    <group ref={body}>
      <mesh geometry={geometry} castShadow receiveShadow><meshStandardMaterial color="#eee6d8" roughness={.9} emissive="#d4bd99" emissiveIntensity={.035}/></mesh>
      <SoftShape position={[.245,.185,-.41]} scale={[.115,.112,.12]}/>
      {[-1,1].map(side=><group key={side}>
        <SoftShape position={[side*.15,.043,.3]} scale={[.091,.046,.176]}/>
        <SoftShape position={[side*.251,.055,-.11]} scale={[.096,.065,.21]}/>
        <Line points={[[side*.15-.022,.077,.401],[side*.15-.02,.083,.442]]} color="#c9bcab" lineWidth={.45}/>
        <Line points={[[side*.15+.018,.077,.401],[side*.15+.02,.083,.442]]} color="#c9bcab" lineWidth={.45}/>
      </group>)}
      <group ref={ears}><Ear side={-1}/><Ear side={1}/></group>
      <group ref={eyes} position={[0,.557,.459]}>
        {[-1,1].map(side=><group key={side} position={[side*.131,0,-.006]} rotation-y={side*.42} rotation-z={side*-.13}>
          <mesh scale={[.027,.035,.013]}><sphereGeometry args={[1,24,20]}/><meshStandardMaterial color="#352529" roughness={.15}/></mesh>
          <mesh position={[-.006,.009,.012]}><sphereGeometry args={[.005,12,8]}/><meshBasicMaterial color="#fff4d9"/></mesh>
        </group>)}
      </group>
      <SoftShape position={[0,.479,.521]} scale={[.021,.014,.012]} color="#bf8d87"/>
      <Line points={[[0,.47,.529],[0,.452,.528],[-.014,.446,.52]]} color="#ac9992" lineWidth={.5}/>
      <Line points={[[0,.452,.528],[.014,.446,.52]]} color="#ac9992" lineWidth={.5}/>
      {[-1,1].map(side=><group key={side}>{[-1,1].map(i=><Line key={i} points={[[side*.073,.473+i*.013,.505],[side*.165,.485+i*.03,.52],[side*.223,.49+i*.037,.51]]} color="#d8cbbb" lineWidth={.45} transparent opacity={.7}/>)}</group>)}
    </group>
  </group>;
}
