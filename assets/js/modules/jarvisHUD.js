/**
 * AXION Command Center — HUD contido
 * Após o boot, só mantém status que "pensa" + glow sutil no cursor
 */

const SECTION_THOUGHTS = {
  home: ['Core idle', 'Systems nominal', 'Awaiting input'],
  about: ['Reading profile...', 'Mapping experience...', 'Profile loaded'],
  projects: ['Scanning projects...', 'Analyzing stack...', 'Rendering grid...'],
  skills: ['Indexing skills...', 'Correlating languages...', 'Skills synced'],
  experience: ['Loading timeline...', 'Parsing history...', 'Timeline ready'],
  contact: ['Opening channel...', 'Ready to connect', 'Contact online']
};

export default class JarvisHUD {
  constructor() {
    this.root = document.getElementById('jarvis-hud');
    this.statusEl = document.getElementById('axion-status');
    this.bootLayer = document.getElementById('axion-boot-hud');
    this.cursorGlow = document.getElementById('jarvis-cursor-glow');
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.thoughtTimer = null;

    if (!this.root) return;
    this.init();
  }

  init() {
    document.body.classList.add('axion-mode', 'jarvis-mode');
    this.bindCursorGlow();
    this.bindSectionThoughts();
    this.bindSoftTilt();

    document.addEventListener('axion:boot-complete', () => this.enterAmbient());

    // Se boot já fechou / reduzido
    if (document.body.classList.contains('axion-ready') || this.reducedMotion) {
      this.enterAmbient();
    }
  }

  enterAmbient() {
    this.root.classList.add('jarvis-hud--ambient');
    this.bootLayer?.classList.add('is-dismantled');
    this.setStatus('Status · ONLINE');

    // Núcleo 3D mais discreto após boot
    window.portfolio?.jarvisScene?.setAmbientMode?.(true);
  }

  bindCursorGlow() {
    if (!this.cursorGlow || this.isTouch()) {
      this.cursorGlow?.classList.add('is-hidden');
      return;
    }

    // Glow acompanha o mouse — sem esconder o cursor nativo
    window.addEventListener('pointermove', (e) => {
      this.cursorGlow.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      document.documentElement.style.setProperty('--cursor-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--cursor-y', `${e.clientY}px`);
    }, { passive: true });
  }

  isTouch() {
    return window.matchMedia('(pointer: coarse)').matches;
  }

  setStatus(text) {
    if (this.statusEl) this.statusEl.textContent = text;
  }

  think(sequence, holdMs = 1600) {
    if (!sequence?.length) return;
    clearTimeout(this.thoughtTimer);

    let i = 0;
    const tick = () => {
      this.setStatus(sequence[i]);
      i += 1;
      if (i < sequence.length) {
        this.thoughtTimer = setTimeout(tick, 420);
      } else {
        this.thoughtTimer = setTimeout(() => {
          this.setStatus('Status · ONLINE');
        }, holdMs);
      }
    };
    tick();
  }

  bindSectionThoughts() {
    const sections = document.querySelectorAll('section[id]');
    if (!sections.length || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        const thoughts = SECTION_THOUGHTS[id];
        if (thoughts) this.think(thoughts);
      });
    }, { threshold: 0.35 });

    sections.forEach((section) => observer.observe(section));
  }

  bindSoftTilt() {
    if (this.isTouch() || this.reducedMotion) return;

    // Delegation — cards entram depois via sync
    document.addEventListener('pointermove', (e) => {
      const panel = e.target.closest?.('.projects__card, .about__stat-card');
      if (!panel || !this._tiltActive) return;

      const rect = panel.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      panel.style.transform = `perspective(800px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg) translateY(-2px)`;
    }, { passive: true });

    document.addEventListener('pointerover', (e) => {
      if (e.target.closest?.('.projects__card, .about__stat-card')) {
        this._tiltActive = true;
      }
    }, { passive: true });

    document.addEventListener('pointerout', (e) => {
      const panel = e.target.closest?.('.projects__card, .about__stat-card');
      if (panel && !panel.contains(e.relatedTarget)) {
        panel.style.transform = '';
        this._tiltActive = false;
      }
    }, { passive: true });
  }

  /**
   * Scan cinematográfico antes de abrir um projeto
   */
  async runProjectScan(projectTitle = 'Project') {
    const overlay = document.getElementById('axion-scan');
    if (!overlay || this.reducedMotion) return;

    const fill = overlay.querySelector('.axion-scan__fill');
    const label = overlay.querySelector('.axion-scan__label');
    const title = overlay.querySelector('.axion-scan__title');

    if (title) title.textContent = projectTitle;
    overlay.classList.add('is-active');
    overlay.setAttribute('aria-hidden', 'false');

    const steps = [
      { text: 'Scanning...', width: 18 },
      { text: 'Loading...', width: 42 },
      { text: 'Analyzing...', width: 68 },
      { text: 'Rendering...', width: 88 },
      { text: 'ACCESS GRANTED', width: 100 }
    ];

    for (const step of steps) {
      if (label) label.textContent = step.text;
      if (fill) fill.style.width = `${step.width}%`;
      await new Promise((r) => setTimeout(r, 160));
    }

    await new Promise((r) => setTimeout(r, 220));
    overlay.classList.remove('is-active');
    overlay.setAttribute('aria-hidden', 'true');
    if (fill) fill.style.width = '0%';
  }

  destroy() {
    clearTimeout(this.thoughtTimer);
  }
}
