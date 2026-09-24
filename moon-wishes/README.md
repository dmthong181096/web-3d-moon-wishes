# Cây đa trên cung trăng

One interactive 3D experience. `src/main.tsx` loads `WishExperience.tsx` and `WishWorld.tsx` for every path; older concept components are not part of the active application.

## Run

```sh
npm install
npm run dev
```

## Build

```sh
npm run build
npm run preview
```

React, TypeScript, Vite, Three.js, React Three Fiber and Drei.

- On each page load, a short introduction explains Mid-Autumn reunion and invites the visitor to write a wish. It waits for the first scene frames and fonts before fading in text, uses opacity-only reveals, and fades out over 650 ms. Its only button, “Ngắm trăng”, enters the scene. Escape also dismisses it.
- Drag to orbit the tree; pinch or scroll to zoom.
- Click a surrounding lantern to open its blessing.
- Click the pink lotus lantern raised by the woman, or the woman herself, to write a wish.
- Submit to release the lantern. The camera follows its ascent; the icon in the corner returns to the tree.
- After releasing, “Thả thêm lồng đèn” creates a new lantern in her hands and opens a fresh wish. Every released lantern keeps its own ID, wish, timestamp and flight. Returning the camera, composing, or cancelling another wish never resets previous flights. Click an airborne wish lantern to read its wish. Finished flights are removed only beyond the visible sky to release their graphics resources.
- After dismissing the intro, the scene has no explanatory text. Keyboard users can tab to the wish action.

The tree uses tapered curved branches, aerial roots and 9,000 instanced curved leaves. The floating moon surface has vertex-colored relief and crater depressions. One woman in an ivory áo dài raises the wish lantern overhead. There are 20 nearby blessing lanterns and 64 instanced sky lanterns, plus the woman's lantern. Lighting combines moonlight, colored rim lights and additive lantern glows.

The special wish lantern has eight rose-colored lotus petals, gold ribs, a warm luminous center, trailing ribbons and sparkles. Nearby lanterns idle with independently phased bobbing, sway, tassel motion and gently breathing light. The held lantern moves subtly to keep contact with the shortened, bent arms. `prefers-reduced-motion` disables idle motion, sparkles, and intro reveals.

A crouching ivory rabbit sits near the woman. Its head, chest and haunches form one smooth sculpted surface; tapered ears, pink inner ears, small reflective eyes, a nose, whiskers and paws complete the model. It breathes gently, moves its ears and occasionally blinks. A low wooden table on the other side holds two patterned mooncakes, a celadon teapot, two filled teacups and subtle steam. Static scene models are memoized so editing wishes and transitioning the intro do not rebuild the tree geometry.

Flight regression checks (Node with TypeScript type stripping, tested on Node 25): `node --test tests/lanternFlights.test.mjs`. These cover independent successive flights, prevention of lantern reuse, offscreen retirement and reduced motion.

The Moon uses a local 2K surface texture by Solar System Scope (CC BY 4.0). Source, license, and adaptation details are included in `public/textures/ATTRIBUTION.md` and shipped in the build.

Wishes are kept only in component memory and disappear after a reload. There is no account, database or server submission.

The existing private Site identity is saved in `.openai/hosting.json`; the project has not been published. Reuse its project ID for future publishing.
