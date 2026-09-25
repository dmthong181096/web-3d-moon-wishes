import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { flightPose } from './lanternFlights';
import type { LanternFlight } from './lanternFlights';
import { WISH_LANTERN_HOME as home } from './WishLantern';

const ignoreRaycast = () => {};
const fragment = `
  varying vec3 vTint;
  varying float vLight;
  void main() {
    vec2 p = gl_PointCoord - .5;
    float r = length(p);
    float core = exp(-r * r * 65.);
    float cross = exp(-abs(p.x) * 52.) * exp(-abs(p.y) * 8.)
                + exp(-abs(p.y) * 52.) * exp(-abs(p.x) * 8.);
    float alpha = (core + cross * .5 + .08 * exp(-r*r*12.)) * (1. - smoothstep(.28, .5, r)) * vLight;
    gl_FragColor = vec4(vTint, alpha);
  }
`;

export function TwinklingStars({ reduced }: { reduced: boolean }) {
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uMotion: { value: 0 }, uPixelRatio: { value: 1 } }), []);
  const geometry = useMemo(() => {
    const positions:number[] = [], colors:number[] = [], sizes:number[] = [], phases:number[] = [];
    let seed = 2319;
    const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
    const color = new THREE.Color();
    for (let i = 0; i < 480; i++) {
      const a = random() * Math.PI * 2, radius = 28 + random() * 18;
      positions.push(Math.cos(a) * radius, -9 + random() * 42, Math.sin(a) * radius);
      color.set(i % 4 === 0 ? '#ffe0aa' : '#cfe5ff');
      colors.push(color.r, color.g, color.b);
      sizes.push(i % 6 === 0 ? 30 : 10 + random() * 8);
      phases.push(random() * Math.PI * 2);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geo.setAttribute('aSize', new THREE.Float32BufferAttribute(sizes, 1));
    geo.setAttribute('aPhase', new THREE.Float32BufferAttribute(phases, 1));
    return geo;
  }, []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useFrame(({ clock, gl }) => {
    uniforms.uTime.value = clock.elapsedTime;
    uniforms.uMotion.value = reduced ? 0 : 1;
    uniforms.uPixelRatio.value = Math.min(gl.getPixelRatio(), 1.6);
  });
  return <points geometry={geometry} raycast={ignoreRaycast}>
    <shaderMaterial uniforms={uniforms} transparent depthWrite={false} blending={THREE.AdditiveBlending}
      vertexShader={`
        uniform float uTime, uMotion, uPixelRatio;
        attribute float aSize, aPhase;
        attribute vec3 color;
        varying vec3 vTint;
        varying float vLight;
        void main() {
          float wave = .5 + .5 * sin(uTime * (.55 + aPhase * .07) + aPhase);
          vLight = mix(.65, .3 + .7 * wave * wave, uMotion);
          vTint = color;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
          gl_PointSize = aSize * uPixelRatio * (.75 + .25 * vLight);
        }
      `} fragmentShader={fragment}/>
  </points>;
}

// Each flight owns its own particle buffer, independent of subsequent wishes.
export function LanternRelease({ lantern }: { lantern: LanternFlight }) {
  const points = useRef<THREE.Points>(null), halo = useRef<THREE.Mesh>(null);
  const haloMaterial = useRef<THREE.MeshBasicMaterial>(null);
  const count = 80;
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3).setUsage(THREE.DynamicDrawUsage));
    geo.setAttribute('aLight', new THREE.BufferAttribute(new Float32Array(count), 1).setUsage(THREE.DynamicDrawUsage));
    return geo;
  }, []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useFrame(() => {
    if (!points.current || lantern.releasedAt === null) return;
    const now = performance.now() / 1000, age = Math.max(0, now - lantern.releasedAt);
    points.current.visible = age > 0 && age < 18;
    if (halo.current && haloMaterial.current) {
      const p = Math.min(age / 1.8, 1);
      halo.current.visible = p < 1;
      halo.current.scale.setScalar(.15 + p * 1.15);
      haloMaterial.current.opacity = Math.sin(p * Math.PI) * .24;
    }
    if (!points.current.visible) return;
    const positions = geometry.attributes.position, lights = geometry.attributes.aLight;
    const fade = Math.min(age / .6, 1) * Math.min(1, (18 - age) / 4);
    for (let i = 0; i < count; i++) {
      const lag = i / count * 2.8, emitted = age - lag;
      const pose = flightPose(lantern, lantern.releasedAt + Math.max(0, emitted), false);
      const angle = i * 2.399 + age * .65, width = .045 + lag * .11;
      positions.setXYZ(i, home[0] + pose.drift + Math.cos(angle) * width,
        home[1] + pose.rise - .35 - lag * .12, home[2] + pose.depth + Math.sin(angle) * width);
      lights.setX(i, emitted < 0 ? 0 : fade * (1 - lag / 2.8) ** 1.5 * (.5 + .5 * Math.sin(i * 4 + age * 3) ** 2));
    }
    positions.needsUpdate = true; lights.needsUpdate = true;
  });
  return <group>
    <points ref={points} geometry={geometry} frustumCulled={false} raycast={ignoreRaycast}>
      <shaderMaterial transparent depthWrite={false} blending={THREE.AdditiveBlending}
        vertexShader={`
          attribute float aLight;
          varying float vLight;
          varying vec3 vTint;
          void main() {
            vLight = aLight;
            vTint = vec3(1., .72, .35);
            vec4 p = modelViewMatrix * vec4(position, 1.);
            gl_Position = projectionMatrix * p;
            gl_PointSize = clamp(150. / max(1., -p.z), 2., 11.);
          }
        `} fragmentShader={fragment}/>
    </points>
    <mesh ref={halo} position={[home[0],home[1]-.3,home[2]]} rotation-x={-Math.PI/2} raycast={ignoreRaycast}>
      <ringGeometry args={[.92,1,64]}/>
      <meshBasicMaterial ref={haloMaterial} color="#ffdb95" transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending}/>
    </mesh>
  </group>;
}
