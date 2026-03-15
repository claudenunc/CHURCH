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
