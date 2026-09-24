import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

// All animation is anchored at the base, so the lantern stays in her hands at rest.
export const WISH_LANTERN_HOME = [-.254, 2.61, 2.238] as const;

export default function WishLantern({ reduced, sparkle = true }: { reduced: boolean; sparkle?: boolean }) {
  const heart = useRef<THREE.MeshStandardMaterial>(null);
  const ribbons = useRef<THREE.Group>(null);
  const profile = useMemo(() => [[.09, -.32], [.19, -.25], [.27, -.08], [.29, .12], [.23, .32], [.12, .4]].map(([r, y]) => new THREE.Vector2(r, y)), []);
  const petal = useMemo(() => {
    const positions: number[] = [], indices: number[] = [], rows = 20, columns = 10;
    for (let j = 0; j <= rows; j++) for (let i = 0; i <= columns; i++) {
      const t = j / rows, across = i / columns * 2 - 1;
      const width = .17 * Math.pow(Math.sin(Math.PI * t), .8);
      positions.push(across * width, -.32 + t * .66 - across * across * .035, .1 + .32 * Math.sin(t * Math.PI * .65) - across * across * .085);
      if (j < rows && i < columns) { const n = j * (columns + 1) + i; indices.push(n, n + 1, n + columns + 2, n, n + columns + 2, n + columns + 1); }
    }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3)); geo.setIndex(indices); geo.computeVertexNormals(); return geo;
  }, []);
  useFrame(({ clock }) => {
    const breath = reduced ? 0 : Math.sin(clock.elapsedTime * 1.6);
    if (heart.current) heart.current.emissiveIntensity = 1.25 + breath * .15;
    if (ribbons.current) { ribbons.current.rotation.z = breath * .055; ribbons.current.rotation.x = reduced ? 0 : Math.sin(clock.elapsedTime * 1.15) * .06; }
  });
  return <group>
    <mesh castShadow><latheGeometry args={[profile,48]}/><meshStandardMaterial ref={heart} color="#ffe5b7" emissive="#ffc879" emissiveIntensity={1.25} roughness={.45}/></mesh>
    {Array.from({ length: 8 }, (_, i) => <group key={i} rotation-y={i * Math.PI / 4}>
      <mesh geometry={petal}><meshPhysicalMaterial color={i % 2 ? '#d88c91' : '#f0b9a6'} emissive="#d8756a" emissiveIntensity={.26} roughness={.45} metalness={.12} side={THREE.DoubleSide}/></mesh>
      <Line points={Array.from({length:21},(_,j)=>{const t=j/20;return [0,-.32+t*.66,.104+.32*Math.sin(t*Math.PI*.65)] as [number,number,number];})} color="#f7d58e" lineWidth={1.1}/>
    </group>)}
    {[-.31,.4].map(y=><mesh key={y} position={[0,y,0]} rotation-x={Math.PI/2}><torusGeometry args={[y<0?.115:.125,.012,8,40]}/><meshStandardMaterial color="#e6bc66" metalness={.72} roughness={.28}/></mesh>)}
    <mesh position={[0,.46,0]}><torusGeometry args={[.068,.008,8,32,Math.PI]}/><meshStandardMaterial color="#e6bc66" metalness={.65}/></mesh>
    <group ref={ribbons} position={[0,-.32,0]}>
      {[-1,0,1].map((i)=><group key={i} position={[i*.085,0,.02]}>
        <Line points={[[0,0,0],[i*.015,-.15,.008],[i*.026,-.29-Math.abs(i)*.04,.02]]} color="#d5a455" lineWidth={1}/>
        <mesh position={[i*.02,-.19,.01]} rotation-z={i*.12}><boxGeometry args={[.027,.2,.008]}/><meshStandardMaterial color={i?'#d59b89':'#e8c477'} metalness={.2}/></mesh>
        <mesh position={[i*.027,-.33-Math.abs(i)*.04,.02]}><sphereGeometry args={[.022,12,8]}/><meshStandardMaterial color="#f6d58b" metalness={.6}/></mesh>
      </group>)}
    </group>
    {sparkle && !reduced && <Sparkles count={9} scale={[1.05,1.2,1.05]} size={1.8} speed={.35} color="#ffdda0"/>}
  </group>;
}
