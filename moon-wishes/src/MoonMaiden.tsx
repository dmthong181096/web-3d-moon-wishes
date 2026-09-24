import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';

type Point = [number, number, number];
const silk = '#e7d9bd', skin = '#e7bea0', hair = '#191b29';

function Curve({ points, radius, color }: { points: Point[]; radius: number; color: string }) {
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p))), [points]);
  return <mesh castShadow><tubeGeometry args={[curve, 24, radius, 12, false]}/><meshStandardMaterial color={color} roughness={.65}/></mesh>;
}

function SilkSkirt({ reduced }: { reduced: boolean }) {
  const mesh = useRef<THREE.Mesh>(null);
  const geometry = useMemo(() => {
    const points: number[] = [], indices: number[] = [], rings = 32, sides = 64;
    for (let j = 0; j <= rings; j++) {
      const t = j / rings, width = .125 + .25 * Math.pow(1 - t, 1.45);
      for (let i = 0; i <= sides; i++) {
        const a = i / sides * Math.PI * 2;
        const fold = 1 + .065 * Math.cos(a * 11 + t * 1.6) * (1 - t);
        points.push(Math.cos(a) * width * fold - .13 * (1 - t) ** 2, .08 + t * 1.04, Math.sin(a) * width * .7 * fold - .16 * (1 - t) ** 2);
        if (j < rings && i < sides) { const n = j * (sides + 1) + i; indices.push(n, n + sides + 2, n + 1, n, n + sides + 1, n + sides + 2); }
      }
    }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(points, 3)); geo.setIndex(indices); geo.computeVertexNormals(); return geo;
  }, []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useFrame(({ clock }) => { if (mesh.current) mesh.current.rotation.z = reduced ? 0 : Math.sin(clock.elapsedTime * .7) * .008; });
  return <mesh ref={mesh} geometry={geometry} castShadow receiveShadow><meshPhysicalMaterial color={silk} emissive="#b39b7d" emissiveIntensity={.12} roughness={.65} sheen={.8} sheenColor="#fff1d4" side={THREE.DoubleSide}/></mesh>;
}

export default function MoonMaiden({ reduced }: { reduced: boolean }) {
  const bodice = useMemo(() => [[.14, .94], [.125, 1.05], [.16, 1.23], [.195, 1.32], [.14, 1.39], [.075, 1.43]].map(([x, y]) => new THREE.Vector2(x, y)), []);
  return <group position={[-.45, .43, 2.1]} rotation-y={.55}>
    <SilkSkirt reduced={reduced}/>
    <mesh scale={[1, 1, .66]} castShadow><latheGeometry args={[bodice, 48]}/><meshPhysicalMaterial color={silk} roughness={.62} sheen={.8} sheenColor="#ffebc9"/></mesh>
    <mesh position={[0, 1.43, 0]} rotation-z={-.09}><cylinderGeometry args={[.047, .06, .17, 24]}/><meshStandardMaterial color={skin}/></mesh>
    {/* A small, upward-turned profile, with sculpted hair instead of doll-like eyes. */}
    <group position={[.025, 1.64, .013]} rotation={[-.24, .42, -.14]}>
      <mesh scale={[.116, .164, .111]} castShadow><sphereGeometry args={[1, 40, 32]}/><meshStandardMaterial color={skin} roughness={.83}/></mesh>
      <mesh position={[0, .005, .105]} scale={[.018, .028, .022]}><sphereGeometry args={[1, 16, 12]}/><meshStandardMaterial color={skin}/></mesh>
      <mesh position={[0, .027, -.024]} scale={[.126, .159, .112]}><sphereGeometry args={[1, 32, 24, 0, Math.PI * 2, 0, Math.PI * .69]}/><meshStandardMaterial color={hair} roughness={.43}/></mesh>
      <mesh position={[0, -.028, -.068]} scale={[.116, .139, .08]}><sphereGeometry args={[1, 32, 24]}/><meshStandardMaterial color={hair} roughness={.48}/></mesh>
      <mesh position={[-.025, .155, -.047]} scale={[.077, .056, .068]}><sphereGeometry args={[1, 24, 20]}/><meshStandardMaterial color={hair}/></mesh>
      <Line points={[[.046, .012, .105], [.064, .01, .094], [.077, .016, .081]]} color="#69504a" lineWidth={.6}/>
      <Line points={[[.012, -.054, .103], [.028, -.053, .102], [.038, -.049, .099]]} color="#a7746b" lineWidth={.5}/>
      <mesh position={[-.02, .155, -.04]} rotation-z={1.24}><cylinderGeometry args={[.005, .005, .23, 8]}/><meshStandardMaterial color="#e7bc66" metalness={.8} roughness={.28}/></mesh>
      {[0, 1, 2].map(i => <mesh key={i} position={[.094 + i * .013, .188 - i * .012, -.04]} scale={[.017, .023, .012]}><sphereGeometry args={[1, 12, 8]}/><meshStandardMaterial color="#efd6a0" metalness={.45}/></mesh>)}
    </group>
    {/* Hair and ribbon follow the same quiet breeze as the skirt. */}
    {[-1, 0, 1].map((i) => <Curve key={i} points={[[i * .053, 1.58, -.075], [i * .059, 1.4, -.12], [i * .065 - .045, 1.16, -.16], [i * .052 - .12, .99, -.12]]} radius={.044} color={hair}/>)}
    <Curve points={[[-.17, 1.29, .015], [-.25, 1.55, .06], [-.14, 1.72, .15], [-.05, 1.82, .2]]} radius={.052} color={silk}/>
    <Curve points={[[.17, 1.3, 0], [.35, 1.53, .07], [.31, 1.69, .17], [.24, 1.82, .24]]} radius={.052} color={silk}/>
    {[[-.05, 1.86, .2], [.24, 1.86, .24]].map((p, i) => <mesh key={i} position={p as Point} rotation-z={i ? .25 : -.25} scale={[.033, .055, .023]}><sphereGeometry args={[1, 20, 16]}/><meshStandardMaterial color={skin} roughness={.8}/></mesh>)}
    <Line points={[[.04, 1.4, .09], [.07, 1.28, .117], [.015, 1.12, .094], [.02, .93, .112], [.095, .56, .17], [.2, .16, .205]]} color="#b89a5e" lineWidth={.8}/>
    {[0, 1, 2].map(i => <mesh key={i} position={[.074 - i * .014, 1.32 - i * .079, .114]}><sphereGeometry args={[.012, 10, 8]}/><meshStandardMaterial color="#eacb85" metalness={.5}/></mesh>)}
    <mesh position={[.11, .06, .075]} scale={[.063, .037, .13]}><sphereGeometry args={[1, 20, 14]}/><meshStandardMaterial color="#d0a76b"/></mesh>
  </group>;
}
