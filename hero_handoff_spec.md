# Final Developer Handoff Manifest: Cinematic Gates Hero

This is the compact, copy‑paste dev manifest and single source of truth for the Gates Open hero MVP → enhancement rollout.

## 1. Asset Manifest (filenames, MIME types, target sizes)
| Filename | Purpose | MIME Type | Target size |
| --- | --- | --- | --- |
| `/assets/hero-1280.webp` | Poster-first mobile hero | `image/webp` | ≤ 150 KB |
| `/assets/hero-1920.webp` | Poster hero (desktop) | `image/webp` | ≤ 300 KB |
| `/assets/hero-3840.avif` | High-res hero for large screens | `image/avif` | ≤ 600 KB |
| `/assets/gates-hero.svg` | Optimized SVG mask + groups | `image/svg+xml` | ≤ 80 KB |
| `/assets/gates-hero-master.svg`| Editable layered SVG (design) | `image/svg+xml` | source file |
| `/assets/gates-hero.lottie.json`| Optional Lottie fallback | `application/json`| ≤ 200 KB |
| `/assets/cathedral-scene-draco.glb`| Three.js GLTF scene (Draco) | `model/gltf-binary`| 600–900 KB (mobile) |
| `/assets/lightmap-tiles/*.webp`| Baked lightmaps for mobile LOD | `image/webp` | each ≤ 120 KB |
| `/assets/audio/ambient-loop.aac`| User-initiated ambient loop | `audio/aac` | ≤ 150 KB |
| `/assets/portraits/portrait-01.webp`| Social proof portrait examples| `image/webp` | ≤ 200 KB each |
| `/assets/frames/frame-*.png` | Animation keyframe exports | `image/png` | ≤ 200 KB each |

## 2. Repo Layout and Import Paths
```
/src
  /components
    HeroWrapper.jsx
    HeroSVGInline.jsx
    HeroPoster.jsx
    HeroControls.js
    HeroThreeScene.js
  /styles
    _hero-theme.scss
  /assets
    hero-1280.webp
    hero-1920.webp
    hero-3840.avif
    gates-hero.svg
    gates-hero-master.svg
    gates-hero.lottie.json
    cathedral-scene-draco.glb
    /lightmap-tiles/*.webp
    /audio/ambient-loop.aac
    /portraits/*.webp
    /frames/*.png
/scripts
  hero-control.js
  hero-three-scene.js
package.json
```

**Lazy import example:**
```javascript
// in HeroWrapper.jsx
if (capable) import('../scripts/hero-three-scene.js').then(m => m.initHeroScene());
```

## 3. Key Code Snippets (Ready for Devs)

### `package.json` snippet
```json
{
  "name": "heavens-infrastructure",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "three": "^0.158.0",
    "lottie-web": "^5.10.1"
  },
  "scripts": {
    "start": "vite",
    "build": "vite build"
  }
}
```

### Minimal hero HTML structure (MVP)
```html
<div id="gates-hero-wrapper" class="hero-wrapper" role="region" aria-label="Ornate gates opening to a warm light">
  <picture>
    <source type="image/avif" srcset="/assets/hero-3840.avif 3840w, /assets/hero-1920.avif 1920w, /assets/hero-1280.avif 1280w" sizes="100vw">
    <source type="image/webp" srcset="/assets/hero-3840.webp 3840w, /assets/hero-1920.webp 1920w, /assets/hero-1280.webp 1280w" sizes="100vw">
    <img class="hero-poster" src="/assets/hero-1280.webp" alt="Cathedral interior with warm light shafts" loading="eager" decoding="async" width="1920" height="1080">
  </picture>

  <!-- Inline optimized SVG (gates-hero.svg) inserted here for animation control -->
  <div id="hero-svg-container" class="hero-svg" aria-hidden="true"></div>

  <!-- HTML copy for accessibility and SEO -->
  <div id="hero-copy-html" class="hero-overlay" aria-hidden="true">
    <h1>Welcome Home. We’ll Help You Build Your Church’s Presence.</h1>
    <p>A sacred entrance to modern ministry — strategy, technology, and care that meet people where they are.</p>
    <div class="hero-ctas">
      <button id="primary-cta" class="cta-primary">Begin Your Free Audit</button>
      <a href="/work" class="cta-secondary">See Our Work</a>
    </div>
  </div>

  <button id="skip-intro" class="skip-intro" aria-controls="hero-copy-html">Skip the welcome</button>
  <div id="hero-webgl" style="position:absolute;inset:0;pointer-events:none;"></div>
</div>
```

### SCSS tokens and hero utilities (`_hero-theme.scss`)
```scss
// tokens
$color-bg: #0B0B12;
$color-gold: #D9B36A;
$color-altar: #B85A2A;
$text-primary: #F7F6F4;
$hero-height-mobile: 65vh;
$hero-height-desktop: 100vh;

// hero container
.hero-wrapper { position:relative; height:$hero-height-mobile; @media(min-width:1024px){height:$hero-height-desktop;} background:$color-bg; overflow:hidden; color:$text-primary; }
.hero-poster { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; z-index:0; }
.hero-svg { position:absolute; inset:0; z-index:1; pointer-events:none; }
.hero-overlay { position:relative; z-index:2; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:24px; background:linear-gradient(180deg, rgba(11,11,18,0.12), rgba(11,11,18,0.48)); }
.cta-primary { background:linear-gradient(90deg, $color-gold, $color-altar); color:$text-primary; padding:12px 22px; border-radius:10px; font-weight:700; }
.skip-intro { position:absolute; top:18px; right:18px; z-index:10; background:rgba(255,255,255,0.06); color:$text-primary; padding:8px 12px; border-radius:8px; }
@media (prefers-reduced-motion: reduce) { .hero-svg, .particle { animation:none !important; } }
```

### JS control scaffold (`hero-control.js`)
```javascript
const hero = document.getElementById('gates-hero-wrapper');
const skipBtn = document.getElementById('skip-intro');
const primaryCta = document.getElementById('primary-cta');
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const connection = navigator.connection || {};
const saveData = connection.saveData === true;
const deviceMemory = navigator.deviceMemory || 4;

function setFinalState() {
  const left = document.querySelector('#gate-left');
  const right = document.querySelector('#gate-right');
  const bloom = document.querySelector('#bg-bloom');
  if (left) left.style.transform = 'rotateY(-32deg) translateX(-18%)';
  if (right) right.style.transform = 'rotateY(32deg) translateX(18%)';
  if (bloom) bloom.style.opacity = '0.85';
  showHeroCopy();
}

function showHeroCopy(){
  const copy = document.getElementById('hero-copy-html');
  copy.removeAttribute('aria-hidden');
  copy.classList.add('visible');
  primaryCta && primaryCta.focus();
}

function revealHero() {
  if (prefersReduced || saveData || deviceMemory < 1.5) {
    setFinalState();
    return;
  }
  hero.classList.add('animate-gates');
  requestIdleCallback(() => {
    if (window.WebGLRenderingContext) import('../scripts/hero-three-scene.js').then(m => m.initHeroScene && m.initHeroScene());
  }, {timeout:1500});
  setTimeout(showHeroCopy, 2000);
}

skipBtn.addEventListener('click', () => { hero.classList.remove('animate-gates'); setFinalState(); });
if (document.readyState === 'complete') revealHero(); else window.addEventListener('load', revealHero);
```

### Three.js scaffold outline (`hero-three-scene.js`)
```javascript
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

export async function initHeroScene(){
  const container = document.getElementById('hero-webgl');
  if (!container) return;
  const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(0, 1.6, 6);

  const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
  scene.add(hemi);

  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('/libs/draco/');
  const loader = new GLTFLoader();
  loader.setDRACOLoader(dracoLoader);

  const gltf = await loader.loadAsync('/assets/cathedral-scene-draco.glb');
  scene.add(gltf.scene);

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(container.clientWidth, container.clientHeight), 0.6, 0.4, 0.1));

  const start = performance.now();
  function animate(){
    const t = (performance.now() - start) / 1000;
    camera.position.z = 6 - Math.min(t * 0.6, 1.2);
    composer.render();
    requestAnimationFrame(animate);
  }
  animate();

  container.addEventListener('pointermove', (e) => {
    const x = (e.clientX / container.clientWidth) * 2 - 1;
    const y = (e.clientY / container.clientHeight) * 2 - 1;
    scene.rotation.y = x * 0.02;
    scene.rotation.x = y * 0.01;
  });

  window.heroScene = { scene, camera, renderer, composer };
}
```

## 4. Implementation Checklist & Rollout Plan

**Week 1 MVP**
- [ ] Add poster-first `<picture>` and inline `gates-hero.svg`.
- [ ] Implement `hero-control.js` (skip, reduced-motion, lazy-load).
- [ ] Ensure headline and CTAs are HTML text and keyboard accessible.
- [ ] Track analytics events: `hero_intro_started`, `hero_intro_skipped`, `hero_intro_completed`, `primary_cta_clicked`.

**Week 2 Enhancement**
- [ ] Add Lottie fallback and shadered SVG microinteractions.
- [ ] Add AI Companion widget and Prayer Wall MVP.

**Weeks 3–4 Premium**
- [ ] Lazy-load Three.js GLTF scene with Draco compression and mobile LODs.
- [ ] Add volumetric light, pointer interactions, and audio control (user-initiated).
- [ ] Run A/B test: SVG vs WebGL vs Video loop.

**QA**
- [ ] LCP ≤ 2.5s on throttled 4G; CLS < 0.1.
- [ ] Accessibility audit: screen reader, keyboard nav, reduced-motion.
- [ ] Performance audit: initial JS < 12 KB gzipped; Three.js lazy-loaded.
