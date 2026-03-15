# Cinematic Hero Implementation Handoff

## 1. Project summary and success criteria
**Summary:** Full‑bleed hero that visually opens ornate gates and reveals headline + three pillar CTAs. Primary implementation: Three.js WebGL cathedral interior with shadered holographic gates and pointer-driven interaction. Fallbacks: SVG mask + CSS animation, Lottie (optional), and poster WebP/AVIF for low-power or reduced‑motion users.

**Success metrics**
- LCP ≤ 2.5s (mobile 4G, hero poster first paint)
- CLS < 0.1
- Time to interactive (hero controls) ≤ 2.5s
- Skip Intro click rate < 10% (target)
- Primary CTA conversion lift vs current baseline

## 2. Asset inventory and exact specs
| Asset | Purpose | Deliverable(s) | Target size |
| --- | --- | --- | --- |
| Hero poster | LCP-first fallback | WebP 1920×1080; WebP 1280×720; AVIF variants | ≤150 KB (mobile) |
| Hero hi‑res | Full hero for desktop/retina | WebP 3840×2160; AVIF | ≤600 KB (desktop progressive) |
| SVG gates (master) | SVG mask + CSS fallback | gates-hero-master.svg (layered, named groups) + optimized gates-hero.svg | |
| GLTF scene | WebGL 3D scene | cathedral-scene.glb (Draco compressed) + LODs | ≤ 600–900 KB (mobile LOD) |
| Baked lightmaps | Mobile fallback for depth | PNG/WEBP lightmaps for GLTF | small tiles, each ≤ 120 KB |
| Lottie JSON | Vector animation fallback | gates-hero.lottie.json | ≤ 200 KB |
| Audio | Optional ambient loop | AAC/MP3 8–12s, user-initiated | ≤ 150 KB (short loop) |
| Portraits & stained glass | Social proof & sections | WebP/AVIF multiple sizes (see image strategy) | per image ≤ 200 KB |
| Design frames | Handoff frames for animation timing | PNG frames: 0%,25%,50%,75%,90%,100% | each ≤ 200 KB |

**Licensing & legal**
- Use extended/commercial license for hero images or secure property/model releases for custom shoot.
- If using stock, prefer editorial/rights-managed hero images or extended license.

## 3. Exact SVG layer breakdown and defs (paste-ready)
```svg
<!-- gates-hero-master.svg (excerpt) -->
<svg id="gates-hero" viewBox="0 0 1920 1080" role="img" aria-label="Ornate gates opening to a warm light, revealing Heaven's Infrastructure — we help build your church's presence." preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Soft shadow filter -->
    <filter id="soft-shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="8" result="b"/>
      <feOffset dx="0" dy="6" result="o"/>
      <feMerge><feMergeNode in="o"/><feMergeNode in="b"/></feMerge>
    </filter>

    <!-- Bloom radial -->
    <radialGradient id="bloom" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#FFDFA8" stop-opacity="0.95"/>
      <stop offset="45%" stop-color="#FFDFA8" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="#0B0B12" stop-opacity="0"/>
    </radialGradient>

    <!-- Mask for gate silhouette -->
    <mask id="gate-mask">
      <rect width="100%" height="100%" fill="white"/>
      <!-- carved negative space where gates open -->
      <g id="mask-open" fill="black">
        <!-- placeholder path for the opening; replace with designer path -->
        <path d="M960 0 L960 1080 L1000 1080 L1000 0 Z"/>
      </g>
    </mask>
  </defs>

  <!-- Background -->
  <g id="bg">
    <rect id="bg-rect" width="100%" height="100%" fill="#0B0B12"/>
    <rect id="bg-bloom" width="100%" height="100%" fill="url(#bloom)" opacity="0"/>
    <g id="bg-particles" aria-hidden="true"></g>
  </g>

  <!-- Left gate -->
  <g id="gate-left" transform-origin="left center">
    <g id="gate-left-frame" filter="url(#soft-shadow)">
      <!-- filigree paths here -->
    </g>
  </g>

  <!-- Right gate -->
  <g id="gate-right" transform-origin="right center">
    <g id="gate-right-frame" filter="url(#soft-shadow)">
      <!-- filigree paths here -->
    </g>
  </g>

  <!-- Foreground overlay and copy -->
  <g id="hero-overlay" pointer-events="none" aria-hidden="true">
    <rect id="overlay-fade" width="100%" height="100%" fill="rgba(11,11,18,0.48)"/>
    <g id="hero-copy" aria-hidden="true">
      <!-- text placeholders; actual text rendered in HTML for accessibility -->
    </g>
  </g>
</svg>
```
**Notes for designers:**
- Export separate groups for filigree-1, filigree-2, hinge, shadow, glint so JS can animate micro-parallax.
- Keep path counts reasonable; split complex filigree into multiple paths to animate staggered parallax.

## 4. CSS keyframes, variables, and SCSS tokens (copy/paste)
```css
:root{
  --gate-duration: 1.8s;
  --gate-ease: cubic-bezier(.22,.9,.3,1);
  --bloom-duration: 1.2s;
  --particle-duration: 12s;
  --cta-stagger: 120ms;
  --color-bg: #0B0B12;
  --color-gold: #D9B36A;
  --color-altar: #B85A2A;
  --text-primary: #F7F6F4;
}

/* Gate open animations */
@keyframes gate-open-left {
  0%   { transform: rotateY(0deg) translateX(0); }
  40%  { transform: rotateY(-18deg) translateX(-6%); }
  70%  { transform: rotateY(-28deg) translateX(-12%); }
  100% { transform: rotateY(-32deg) translateX(-18%); }
}
@keyframes gate-open-right {
  0%   { transform: rotateY(0deg) translateX(0); }
  40%  { transform: rotateY(18deg) translateX(6%); }
  70%  { transform: rotateY(28deg) translateX(12%); }
  100% { transform: rotateY(32deg) translateX(18%); }
}
@keyframes bloom {
  0%   { opacity: 0; transform: scale(0.96); }
  50%  { opacity: 1; transform: scale(1.06); }
  100% { opacity: 0.85; transform: scale(1); }
}
@keyframes particle-drift {
  0%   { transform: translateY(0) translateX(0) scale(0.9); opacity:0.95; }
  50%  { transform: translateY(-18vh) translateX(6vw) scale(1.05); opacity:0.6; }
  100% { transform: translateY(0) translateX(0) scale(0.9); opacity:0.95; }
}

/* Apply */
#gate-left { transform-origin: left center; will-change: transform; }
#gate-right { transform-origin: right center; will-change: transform; }
.animate-gates #gate-left { animation: gate-open-left var(--gate-duration) var(--gate-ease) forwards; }
.animate-gates #gate-right { animation: gate-open-right var(--gate-duration) var(--gate-ease) forwards; }
.animate-gates #bg-bloom { animation: bloom var(--bloom-duration) var(--gate-ease) forwards; }
#bg-particles > * { animation: particle-drift var(--particle-duration) linear infinite; will-change: transform, opacity; }

/* Reduced motion */
@media (prefers-reduced-motion: reduce){
  .animate-gates #gate-left, .animate-gates #gate-right, #bg-particles, #bg-bloom { animation: none !important; transform: none !important; opacity: 1 !important; }
}
```

**SCSS color tokens (paste-ready):**
```scss
$color-bg: #0B0B12;
$color-gold: #D9B36A;
$color-altar: #B85A2A;
$glass-blue: #1E4A7A;
$glass-ruby: #8B1E3F;
$text-primary: #F7F6F4;

.hero-gradient {
  background: linear-gradient(180deg, rgba(11,11,18,0.6) 0%, rgba(11,11,18,0.2) 60%), linear-gradient(120deg, rgba(217,179,106,0.08), rgba(184,90,42,0.06));
}
.cta-primary {
  background: linear-gradient(90deg, $color-gold, $color-altar);
  color: $text-primary;
  border-radius: 8px;
  padding: 12px 20px;
  font-weight: 700;
}
```

## 5. JavaScript scaffolds (control, skip, lazy load)
```javascript
// hero-control.js
const hero = document.getElementById('gates-hero-wrapper'); // wrapper div
const svgShell = document.getElementById('gates-hero'); // inline SVG
const skipBtn = document.getElementById('skip-intro');
const primaryCta = document.getElementById('primary-cta');
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const connection = navigator.connection || {};
const saveData = connection.saveData === true;
const deviceMemory = navigator.deviceMemory || 4;

function setFinalState() {
  document.querySelector('#gate-left').style.transform = 'rotateY(-32deg) translateX(-18%)';
  document.querySelector('#gate-right').style.transform = 'rotateY(32deg) translateX(18%)';
  document.querySelector('#bg-bloom').style.opacity = '0.85';
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
    loadGLTFIfCapable();
    lazyLoadAudio();
  }, {timeout: 1500});
  setTimeout(showHeroCopy, 2000);
}

skipBtn.addEventListener('click', () => {
  hero.classList.remove('animate-gates');
  setFinalState();
});

if (document.readyState === 'complete') revealHero();
else window.addEventListener('load', revealHero);

function lazyLoadAudio(){
  const audioBtn = document.getElementById('play-ambient');
  if (!audioBtn) return;
  audioBtn.addEventListener('click', async () => {
    const audio = new Audio('/assets/audio/ambient-loop.aac');
    audio.loop = true;
    await audio.play();
    audioBtn.setAttribute('aria-pressed','true');
  });
}

function loadGLTFIfCapable(){
  if (!window.WebGLRenderingContext) return;
  import('/scripts/hero-three-scene.js').then(m => m.initHeroScene && m.initHeroScene());
}
```

## 6. Image strategy, responsive srcset, and color grading instructions
```html
<picture>
  <source type="image/avif" srcset="/assets/hero-3840.avif 3840w, /assets/hero-1920.avif 1920w, /assets/hero-1280.avif 1280w" sizes="(min-width:1200px) 100vw, 100vw">
  <source type="image/webp" srcset="/assets/hero-3840.webp 3840w, /assets/hero-1920.webp 1920w, /assets/hero-1280.webp 1280w" sizes="(min-width:1200px) 100vw, 100vw">
  <img src="/assets/hero-1280.webp" alt="Cathedral interior with warm light shafts" loading="eager" decoding="async" width="1920" height="1080">
</picture>
```
**Color grading LUT:**
- Base LUT: warm highlights (+6% warmth), teal shadows (-4% blue shift), +8 saturation on jewel tones.
- Film grain: 0.8% global grain.
- Sharpening: 0.3 radius, 0.8 amount for web exports.

## 7. Copy and microcopy
**Hero headline:** Welcome Home. We’ll Help You Build Your Church’s Presence.
**Hero subhead:** A sacred entrance to modern ministry — strategy, technology, and care that meet people where they are.
**Primary CTA:** Begin Your Free Audit
**Secondary CTA:** See Our Work
**Skip control:** Skip the welcome

**Three pillar cards:**
- Automate — Free your team from busywork. Automations for giving, follow-up, and scheduling.
- Amplify — Get found. Local landing pages, SEO, and social storytelling that bring people in.
- Accompany — 24/7 pastoral presence. AI companion with human escalation and real care.

**AI Companion widget:**
- Label: Pastoral Companion — Ask, Pray, or Get Help
- Entry: A caring guide that listens and routes urgent needs to real people. Not a replacement for emergency services.

## 8. Accessibility, analytics, and QA checklist
- Hero headline and CTAs must be HTML text.
- Skip Intro button: visible, keyboard-focusable, aria-controls to hero content.
- Respect prefers-reduced-motion and prefers-contrast.
- Analytics events: hero_intro_started, hero_intro_skipped, hero_intro_completed, primary_cta_clicked.

## SVG Defs Ready for Paste
```svg
<defs>
  <filter id="soft-shadow" x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur in="SourceAlpha" stdDeviation="8" result="blur"/>
    <feOffset in="blur" dx="0" dy="6" result="offset"/>
    <feMerge>
      <feMergeNode in="offset"/>
      <feMergeNode in="SourceGraphic"/>
    </feMerge>
  </filter>

  <filter id="inner-depth" x="-20%" y="-20%" width="140%" height="140%">
    <feComponentTransfer in="SourceAlpha"><feFuncA type="table" tableValues="0 0.9"/></feComponentTransfer>
    <feGaussianBlur stdDeviation="2" result="innerBlur"/>
    <feComposite in="innerBlur" in2="SourceAlpha" operator="in" result="innerMask"/>
    <feMerge>
      <feMergeNode in="innerMask"/>
      <feMergeNode in="SourceGraphic"/>
    </feMerge>
  </filter>

  <radialGradient id="bloom" cx="50%" cy="38%" r="60%">
    <stop offset="0%" stop-color="#FFDFA8" stop-opacity="0.98"/>
    <stop offset="35%" stop-color="#FFDFA8" stop-opacity="0.48"/>
    <stop offset="70%" stop-color="#D9B36A" stop-opacity="0.12"/>
    <stop offset="100%" stop-color="#0B0B12" stop-opacity="0"/>
  </radialGradient>

  <linearGradient id="rim-warm" x1="0%" y1="0%" x2="100%" y2="0%">
    <stop offset="0%" stop-color="#F7E6C2" stop-opacity="0.95"/>
    <stop offset="50%" stop-color="#D9B36A" stop-opacity="0.85"/>
    <stop offset="100%" stop-color="#B85A2A" stop-opacity="0.6"/>
  </linearGradient>

  <pattern id="grain" patternUnits="userSpaceOnUse" width="64" height="64">
    <image href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAAAQCAYAAAB49l0/AAAAF0lEQVR42mNgGAWjYBSMglEwCjAAAw0AAc2m3qkAAAAASUVORK5CYII=" x="0" y="0" width="64" height="64" opacity="0.06"/>
  </pattern>

  <filter id="specular" x="-20%" y="-20%" width="140%" height="140%">
    <feGaussianBlur stdDeviation="1.2" result="sblur"/>
    <feMerge>
      <feMergeNode in="sblur"/>
      <feMergeNode in="SourceGraphic"/>
    </feMerge>
  </filter>
</defs>
```
