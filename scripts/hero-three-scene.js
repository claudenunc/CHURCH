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
