/**
 * Arquivo Principal
 * Inicializa todos os módulos
 */

import Navigation from './modules/navigation.js';
import Projects from './modules/projects.js';
import Animations from './modules/animations.js';
import Theme from './modules/theme.js';
import Contact from './modules/contact.js';
import Skills from './modules/skills.js';
import Experience from './modules/experience.js';
import Intro from './modules/intro.js';
import Interactions from './modules/interactions.js';
import JarvisHUD from './modules/jarvisHUD.js';
import { lazyLoadImages, measurePerformance } from './utils/performance.js';

async function initJarvisScene() {
  const canvas = document.getElementById('jarvis-canvas');
  if (!canvas) return null;

  try {
    const { default: JarvisScene } = await import('./modules/jarvisScene.js');
    return new JarvisScene(canvas);
  } catch (error) {
    console.warn('Cena 3D indisponível neste dispositivo.', error);
    return null;
  }
}

// Aguarda DOM estar pronto
document.addEventListener('DOMContentLoaded', () => {
  // Intro de apresentação (roda primeiro)
  new Intro();

  // HUD cinematográfico J.A.R.V.I.S.
  const jarvisHUD = new JarvisHUD();

  // Inicializa módulos
  const navigation = new Navigation();
  const skills = new Skills();
  const projects = new Projects();
  const animations = new Animations();
  const interactions = new Interactions();
  const theme = new Theme();
  const contact = new Contact();
  const experience = new Experience();

  // Cena 3D em lazy load (Three.js)
  let jarvisScene = null;
  initJarvisScene().then((scene) => {
    jarvisScene = scene;
    if (document.body.classList.contains('axion-ready')) {
      scene?.setAmbientMode?.(true);
    }
    if (window.portfolio) window.portfolio.jarvisScene = scene;
  });

  // Performance
  lazyLoadImages();
  measurePerformance();

  // Console personalizado
  console.log('%cAXION SYSTEMS · ONLINE',
    'font-size: 16px; font-weight: bold; color: #5eead4;');
  console.log('%chttps://github.com/VandinDev221',
    'font-size: 12px; color: #5eead4;');

  // Easter egg
  let konamiCode = [];
  const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  
  document.addEventListener('keydown', (e) => {
    konamiCode.push(e.key);
    if (konamiCode.length > konamiSequence.length) {
      konamiCode.shift();
    }
    
    if (konamiCode.join(',') === konamiSequence.join(',')) {
      console.log('%c🎉 Código Konami ativado!', 'font-size: 24px; font-weight: bold; color: #00eaff;');
      document.body.style.animation = 'pulse 1s infinite';
      setTimeout(() => {
        document.body.style.animation = '';
      }, 3000);
      konamiCode = [];
    }
  });

  // Exporta para uso global se necessário
  window.portfolio = {
    navigation,
    projects,
    animations,
    interactions,
    theme,
    contact,
    skills,
    experience,
    jarvisHUD,
    jarvisScene
  };
});
