// hero-three-scene.js (scaffold)
// Note: Actual imports will require a build step (like Vite) or import maps in production.
// This serves as the scaffold for the final WebGL integration.

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/DRACOLoader.js';
import { EffectComposer } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/postprocessing/UnrealBloomPass.js';

export async function initHeroScene(){
  const container = document.getElementById('hero-webgl');
  if (!container) return;
  
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(0, 1.6, 6);

  // lights
  const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
  scene.add(hemi);

  // load GLTF (Draco) - paths will need to be updated when final assets arrive
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/'); // Using CDN for decoding
  const loader = new GLTFLoader();
  loader.setDRACOLoader(dracoLoader);

  try {
      // NOTE: Using a placeholder path. Update this when the final .glb is provided.
      const gltf = await loader.loadAsync('/assets/gltf/cathedral-scene-draco.glb');
      scene.add(gltf.scene);
  } catch (error) {
      console.warn("WebGL Scene Asset missing, continuing with SVG fallback.", error);
      // Gracefully fail and let SVG handle the visual
  }

  // postprocessing
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(container.clientWidth, container.clientHeight), 0.6, 0.4, 0.1));

  // subtle camera approach animation
  const startTime = performance.now();
  function animate(){
    const t = (performance.now() - startTime) / 1000;
    camera.position.z = 6 - Math.min(t * 0.6, 1.2); // ease forward
    composer.render();
    requestAnimationFrame(animate);
  }
  animate();

  // pointer interaction: parallax and gate drag
  container.addEventListener('pointermove', (e) => {
    const x = (e.clientX / container.clientWidth) * 2 - 1;
    const y = (e.clientY / container.clientHeight) * 2 - 1;
    scene.rotation.y = x * 0.02;
    scene.rotation.x = y * 0.01;
  });

  // resize handler
  window.addEventListener('resize', () => {
    if(!container) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
    composer.setSize(container.clientWidth, container.clientHeight);
  });

  // expose API
  window.heroScene = { scene, camera, renderer, composer };
}
