import * as THREE from 'three';

// Small, shared, deterministic surface maps. Detail costs no extra meshes or animation work.
function surface(size: number, sample: (u: number, v: number, grain: number) => number) {
  const data = new Uint8Array(size * size * 4);
  let seed = 9173;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const value = THREE.MathUtils.clamp(sample(x / size, y / size, seed / 4294967296), 0, 1);
    const i = (y * size + x) * 4;
    data[i] = data[i + 1] = data[i + 2] = Math.round(value * 255);
    data[i + 3] = 255;
  }
  const map = new THREE.DataTexture(data, size, size);
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.magFilter = THREE.LinearFilter;
  map.minFilter = THREE.LinearMipmapLinearFilter;
  map.generateMipmaps = true;
  map.needsUpdate = true;
  return map;
}

const tau = Math.PI * 2;
// TubeGeometry's U follows the branch; V goes around its circumference.
export const barkRelief = surface(256, (u, v, grain) => {
  const bend = .025 * Math.sin(u * tau) + .009 * Math.sin(u * tau * 3 + v * tau * 2);
  const furrow = Math.pow(.5 + .5 * Math.sin((v + bend) * tau * 13), 10);
  const fine = Math.sin((v + bend) * tau * 37) * .07;
  return .76 - furrow * .42 + fine + (grain - .5) * .085;
});

export const leafSurface = surface(128, (u, v, grain) => {
  const center = Math.exp(-Math.abs(v - .5) * 95);
  const branches = Math.pow(.5 + .5 * Math.cos((u * 7 - Math.abs(v - .5) * 3.2) * tau), 22);
  const edge = Math.abs(v - .5) * .17;
  return .8 + center * .15 + branches * .055 - edge + grain * .035;
});

export const lunarRelief = surface(256, (u, v, grain) => {
  const broad = Math.sin(u * tau * 3 + Math.sin(v * tau * 2)) * Math.cos(v * tau * 4);
  const grit = Math.sin(u * tau * 19 + Math.sin(v * tau * 7)) * Math.cos(v * tau * 23);
  return .68 + broad * .12 + grit * .06 + (grain - .5) * .14;
});

export const lanternPaper = surface(256, (u, v, grain) => {
  const rib = Math.pow(.5 + .5 * Math.cos(u * tau * 12), 40);
  const hoop = Math.pow(.5 + .5 * Math.cos(v * tau * 18), 24);
  const light = Math.pow(Math.sin(v * Math.PI), .55);
  return .6 + light * .33 - rib * .19 - hoop * .055 + (grain - .5) * .045;
});

export const petalSurface = surface(128, (u, v, grain) => {
  const vein = Math.pow(.5 + .5 * Math.cos((u - .5) * tau * 9), 18);
  return .65 + Math.sin(v * Math.PI) * .24 + vein * .065 + grain * .025;
});
