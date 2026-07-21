/**
 * Cena 3D J.A.R.V.I.S. — Neural Core + partículas orbitais
 * Three.js vanilla (sem React) para manter sync GitHub/Vercel intacto
 */

import * as THREE from 'three';

const CYAN = 0x00eaff;
const CYAN_SOFT = 0x22d3ee;

export default class JarvisScene {
  constructor(canvas) {
    this.canvas = canvas;
    this.mouse = { x: 0, y: 0 };
    this.targetRotation = { x: 0, y: 0 };
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.isMobile = window.innerWidth < 768;
    this.particleCount = this.isMobile ? 2500 : 12000;
    this.raf = null;
    this.running = false;

    this.init();
  }

  init() {
    const { clientWidth: w, clientHeight: h } = this.canvas.parentElement;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: !this.isMobile,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.isMobile ? 1.5 : 2));
    this.renderer.setSize(w, h);
    this.renderer.setClearColor(0x000000, 0);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
    this.camera.position.set(0, 0, 6.5);

    this.scene.add(new THREE.AmbientLight(0x0a2a3a, 0.6));
    const point = new THREE.PointLight(CYAN, 2.5, 20);
    point.position.set(0, 0, 3);
    this.scene.add(point);
    this.pointLight = point;

    this.createCore();
    this.createRings();
    this.createParticles();

    window.addEventListener('resize', () => this.onResize());
    window.addEventListener('pointermove', (e) => this.onPointer(e), { passive: true });

    this.start();
  }

  createCore() {
    const geo = new THREE.IcosahedronGeometry(1, 3);
    const mat = new THREE.MeshStandardMaterial({
      color: CYAN,
      emissive: CYAN_SOFT,
      emissiveIntensity: 1.8,
      metalness: 0.85,
      roughness: 0.2,
      wireframe: false
    });
    this.core = new THREE.Mesh(geo, mat);
    this.scene.add(this.core);

    const wireGeo = new THREE.IcosahedronGeometry(1.08, 1);
    const wireMat = new THREE.MeshBasicMaterial({
      color: CYAN,
      wireframe: true,
      transparent: true,
      opacity: 0.35
    });
    this.coreWire = new THREE.Mesh(wireGeo, wireMat);
    this.scene.add(this.coreWire);
  }

  createRings() {
    this.rings = [];
    const configs = [
      { radius: 1.6, tube: 0.015, speed: 0.004, tilt: 0.4 },
      { radius: 2.0, tube: 0.012, speed: -0.003, tilt: -0.6 },
      { radius: 2.45, tube: 0.01, speed: 0.0025, tilt: 0.9 }
    ];

    configs.forEach((cfg) => {
      const geo = new THREE.TorusGeometry(cfg.radius, cfg.tube, 8, 128);
      const mat = new THREE.MeshBasicMaterial({
        color: CYAN,
        transparent: true,
        opacity: 0.45
      });
      const ring = new THREE.Mesh(geo, mat);
      ring.rotation.x = Math.PI / 2 + cfg.tilt;
      ring.userData.speed = cfg.speed;
      this.scene.add(ring);
      this.rings.push(ring);
    });
  }

  createParticles() {
    const positions = new Float32Array(this.particleCount * 3);
    const colors = new Float32Array(this.particleCount * 3);
    this.particleBase = new Float32Array(this.particleCount * 3);
    this.particlePhase = new Float32Array(this.particleCount);

    for (let i = 0; i < this.particleCount; i++) {
      const radius = 2.8 + Math.random() * 4.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      this.particleBase[i * 3] = x;
      this.particleBase[i * 3 + 1] = y;
      this.particleBase[i * 3 + 2] = z;
      this.particlePhase[i] = Math.random() * Math.PI * 2;

      const brightness = 0.4 + Math.random() * 0.6;
      colors[i * 3] = 0.0 * brightness;
      colors[i * 3 + 1] = 0.85 * brightness;
      colors[i * 3 + 2] = 1.0 * brightness;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: this.isMobile ? 0.025 : 0.035,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });

    this.particles = new THREE.Points(geo, mat);
    this.scene.add(this.particles);
  }

  onPointer(e) {
    this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    this.targetRotation.y = this.mouse.x * 0.35;
    this.targetRotation.x = this.mouse.y * 0.2;

    if (this.pointLight) {
      this.pointLight.position.x = this.mouse.x * 3;
      this.pointLight.position.y = this.mouse.y * 2;
    }
  }

  onResize() {
    const parent = this.canvas.parentElement;
    if (!parent) return;
    const w = parent.clientWidth;
    const h = parent.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  animate = () => {
    if (!this.running) return;
    this.raf = requestAnimationFrame(this.animate);

    const t = performance.now() * 0.001;

    if (!this.reducedMotion) {
      const pulse = 1 + Math.sin(t * 2.8) * 0.06;
      this.core.scale.setScalar(pulse);
      this.coreWire.scale.setScalar(pulse * 1.02);
      this.core.rotation.y += 0.004;
      this.core.rotation.x += 0.0015;
      this.coreWire.rotation.y -= 0.003;

      this.rings.forEach((ring) => {
        ring.rotation.z += ring.userData.speed;
      });

      this.particles.rotation.y += 0.0008;
      this.particles.rotation.x = Math.sin(t * 0.15) * 0.08;

      const pos = this.particles.geometry.attributes.position.array;
      const mx = this.mouse.x * 0.8;
      const my = this.mouse.y * 0.8;

      for (let i = 0; i < this.particleCount; i++) {
        const ix = i * 3;
        const bx = this.particleBase[ix];
        const by = this.particleBase[ix + 1];
        const bz = this.particleBase[ix + 2];

        const dx = bx - mx * 2;
        const dy = by - my * 2;
        const dist = Math.sqrt(dx * dx + dy * dy) + 0.01;
        const push = Math.min(0.45, 0.35 / dist);

        const orbit = Math.sin(t * 0.6 + this.particlePhase[i]) * 0.08;

        pos[ix] = bx + dx * push * 0.15 + orbit;
        pos[ix + 1] = by + dy * push * 0.15;
        pos[ix + 2] = bz + Math.cos(t * 0.4 + this.particlePhase[i]) * 0.05;
      }
      this.particles.geometry.attributes.position.needsUpdate = true;
    }

    this.camera.rotation.y += (this.targetRotation.y * 0.15 - this.camera.rotation.y) * 0.04;
    this.camera.rotation.x += (this.targetRotation.x * 0.1 - this.camera.rotation.x) * 0.04;

    this.renderer.render(this.scene, this.camera);
  };

  start() {
    if (this.running) return;
    this.running = true;
    this.animate();
  }

  stop() {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
  }

  destroy() {
    this.stop();
    this.renderer?.dispose();
  }
}
