// hero-control.js
const hero = document.getElementById('home'); 
const svgShell = document.getElementById('gates-hero'); 
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
  const scroll = document.getElementById('hero-scroll');
  if(copy) {
      copy.removeAttribute('aria-hidden');
      copy.classList.add('visible');
  }
  if(scroll) {
      scroll.classList.add('visible');
  }
  if(skipBtn) {
      skipBtn.classList.add('hidden');
  }
  primaryCta && primaryCta.focus();
}

function revealHero() {
  if (prefersReduced || saveData || deviceMemory < 1.5) {
    setFinalState();
    return;
  }
  // start CSS animation
  if(svgShell) {
      svgShell.classList.add('animate-gates');
  } else if (hero) {
      hero.classList.add('animate-gates');
  }
  
  // lazy-load heavy assets after animation starts
  requestIdleCallback(() => {
    loadGLTFIfCapable();
    lazyLoadAudio();
  }, {timeout: 1500});
  // ensure copy visible after animation duration
  setTimeout(showHeroCopy, 2000);
}

if(skipBtn) {
    skipBtn.addEventListener('click', () => {
      if(svgShell) svgShell.classList.remove('animate-gates');
      if(hero) hero.classList.remove('animate-gates');
      
      // Stop transitions
      document.querySelector('#gate-left').style.transition = 'none';
      document.querySelector('#gate-right').style.transition = 'none';
      document.querySelector('#bg-bloom').style.transition = 'none';
      
      setFinalState();
    });
}

// Start after LCP or load
if (document.readyState === 'complete') revealHero();
else window.addEventListener('load', revealHero);

// Lazy loaders
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
  // load Three.js scene via dynamic import (keeps initial bundle small)
  import('/scripts/hero-three-scene.js').then(m => m.initHeroScene && m.initHeroScene()).catch(e => console.warn('WebGL init skipped:', e));
}
