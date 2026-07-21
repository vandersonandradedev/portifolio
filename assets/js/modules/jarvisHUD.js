/**
 * Overlays HUD cinematográficos — scanner, radar, dataflow, hologramas, cursor
 */

export default class JarvisHUD {
  constructor() {
    this.root = document.getElementById('jarvis-hud');
    this.cursor = document.getElementById('jarvis-cursor');
    this.cursorGlow = document.getElementById('jarvis-cursor-glow');
    this.scanner = document.querySelector('.jarvis-hud__scanner');
    this.radar = document.querySelector('.jarvis-hud__radar-sweep');
    this.bars = document.querySelectorAll('[data-hud-bar]');
    this.holoValues = document.querySelectorAll('[data-hud-value]');
    this.voiceDots = document.querySelectorAll('.jarvis-hud__voice-dot');
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.raf = null;

    if (!this.root) return;
    this.init();
  }

  init() {
    document.body.classList.add('jarvis-mode');
    this.bindCursor();
    this.startMetrics();
    this.startVoicePulse();
    this.bindTiltPanels();

    if (!this.reducedMotion) {
      this.animate();
    }
  }

  bindCursor() {
    if (!this.cursor || this.isTouch()) {
      this.cursor?.classList.add('is-hidden');
      this.cursorGlow?.classList.add('is-hidden');
      return;
    }

    document.body.classList.add('jarvis-custom-cursor');

    window.addEventListener('pointermove', (e) => {
      const x = e.clientX;
      const y = e.clientY;
      this.cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      this.cursorGlow.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      document.documentElement.style.setProperty('--cursor-x', `${x}px`);
      document.documentElement.style.setProperty('--cursor-y', `${y}px`);
    }, { passive: true });

    document.addEventListener('pointerdown', () => {
      this.cursor.classList.add('is-active');
    });
    document.addEventListener('pointerup', () => {
      this.cursor.classList.remove('is-active');
    });
  }

  isTouch() {
    return window.matchMedia('(pointer: coarse)').matches;
  }

  startMetrics() {
    const metrics = [
      { el: document.querySelector('[data-hud-metric="cpu"]'), base: 62, amp: 22 },
      { el: document.querySelector('[data-hud-metric="mem"]'), base: 48, amp: 18 },
      { el: document.querySelector('[data-hud-metric="net"]'), base: 71, amp: 15 },
      { el: document.querySelector('[data-hud-metric="gpu"]'), base: 55, amp: 25 }
    ];

    this.metrics = metrics.filter(m => m.el);
  }

  startVoicePulse() {
    this.voicePhase = 0;
  }

  bindTiltPanels() {
    this.panels = document.querySelectorAll('[data-hud-tilt]');
    if (!this.panels.length || this.isTouch()) return;

    window.addEventListener('pointermove', (e) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const dx = (e.clientX - cx) / cx;
      const dy = (e.clientY - cy) / cy;

      this.panels.forEach((panel) => {
        const intensity = parseFloat(panel.dataset.hudTilt) || 6;
        panel.style.transform = `perspective(900px) rotateY(${dx * intensity}deg) rotateX(${-dy * intensity}deg)`;
      });
    }, { passive: true });
  }

  animate = () => {
    this.raf = requestAnimationFrame(this.animate);
    const t = performance.now() * 0.001;

    this.metrics?.forEach((m, i) => {
      const value = Math.round(m.base + Math.sin(t * (1.2 + i * 0.3) + i) * m.amp);
      m.el.textContent = `${Math.max(8, Math.min(99, value))}%`;
    });

    this.bars.forEach((bar, i) => {
      const width = 40 + Math.sin(t * 1.5 + i * 0.8) * 28 + Math.sin(t * 0.7 + i) * 12;
      bar.style.width = `${Math.max(18, Math.min(96, width))}%`;
    });

    this.voiceDots.forEach((dot, i) => {
      const scale = 0.55 + Math.abs(Math.sin(t * 4 + i * 0.7)) * 0.9;
      dot.style.transform = `scaleY(${scale})`;
      dot.style.opacity = String(0.4 + scale * 0.4);
    });

    if (this.radar) {
      this.radar.style.transform = `rotate(${(t * 48) % 360}deg)`;
    }
  };

  destroy() {
    if (this.raf) cancelAnimationFrame(this.raf);
  }
}
