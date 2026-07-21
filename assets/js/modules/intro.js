/**
 * Boot AXION Systems — primeira impressão curta, depois entrega o portfólio
 * Objetivo: identidade técnica, sem bloquear nome/projetos/contato
 */

const BOOT_SKIP_KEY = 'axion_boot_seen';

export default class Intro {
  constructor() {
    this.overlay = document.getElementById('intro-overlay');
    this.skipEl = document.getElementById('intro-skip');
    this.progressEl = document.getElementById('axion-boot-progress');
    this.percentEl = document.getElementById('axion-boot-percent');
    this.stageEl = document.getElementById('axion-boot-stage');
    this.modulesEl = document.getElementById('axion-boot-modules');
    this.welcomeEl = document.getElementById('axion-boot-welcome');
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!this.overlay) return;

    document.body.classList.add('intro-active', 'axion-booting');
    this.skipEl?.addEventListener('click', () => this.close());

    // Revisitantes: boot curto (~1.2s)
    this.seenBefore = sessionStorage.getItem(BOOT_SKIP_KEY) === '1';

    if (this.reducedMotion) {
      this.close();
      return;
    }

    this.run();
  }

  async run() {
    const stages = this.seenBefore
      ? [
          { text: 'Restoring session...', progress: 100, wait: 500 }
        ]
      : [
          { text: 'INITIALIZING...', progress: 12, wait: 450 },
          { text: 'Loading Neural Engine...', progress: 48, wait: 550 },
          { text: 'Syncing repositories...', progress: 78, wait: 500 },
          { text: 'AI Modules Loaded', progress: 100, wait: 400 }
        ];

    for (const stage of stages) {
      if (this._closed) return;
      this.setStage(stage.text, stage.progress);
      await this.wait(stage.wait);
    }

    if (this._closed) return;

    if (!this.seenBefore) {
      this.showModules();
      await this.wait(700);
      if (this._closed) return;
    }

    this.showWelcome();
    await this.wait(this.seenBefore ? 400 : 900);
    if (this._closed) return;

    this.close();
  }

  setStage(text, progress) {
    if (this.stageEl) this.stageEl.textContent = text;
    if (this.progressEl) this.progressEl.style.width = `${progress}%`;
    if (this.percentEl) this.percentEl.textContent = `${progress}%`;
  }

  showModules() {
    this.modulesEl?.classList.add('is-visible');
  }

  showWelcome() {
    this.welcomeEl?.classList.add('is-visible');
    if (this.stageEl) this.stageEl.textContent = 'Welcome, Visitor.';
  }

  wait(ms) {
    return new Promise((resolve) => {
      this._timer = setTimeout(resolve, ms);
    });
  }

  close() {
    if (this._closed) return;
    this._closed = true;
    if (this._timer) clearTimeout(this._timer);

    try {
      sessionStorage.setItem(BOOT_SKIP_KEY, '1');
    } catch {
      // ignore
    }

    this.overlay.classList.add('intro-overlay--hidden');
    document.body.classList.remove('intro-active');
    document.body.classList.add('axion-ready');
    document.body.classList.remove('axion-booting');

    document.dispatchEvent(new CustomEvent('axion:boot-complete'));

    setTimeout(() => {
      this.overlay?.remove();
    }, 700);
  }
}
