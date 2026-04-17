/* ============================================================
   Text Particle Animation — Vanilla JS
   Ported from shadcn text-particle component
   Renders text as interactive particles on canvas
   ============================================================ */

(function () {
  'use strict';

  class TextParticle {
    constructor(container, options = {}) {
      this.container = typeof container === 'string'
        ? document.querySelector(container)
        : container;

      if (!this.container) return;

      this.options = {
        text: options.text || 'XEROEK',
        fontSize: options.fontSize || 90,
        fontFamily: options.fontFamily || "'Clash Display', Arial, sans-serif",
        fontWeight: options.fontWeight || '600',
        particleSize: options.particleSize || 2,
        particleColor: options.particleColor || '#e8dcc8',
        particleDensity: options.particleDensity || 5,
        mouseRadius: options.mouseRadius || 120,
        returnSpeed: options.returnSpeed || 0.05,
        pushForce: options.pushForce || 4,
        backgroundColor: options.backgroundColor || 'transparent',
      };

      this.canvas = null;
      this.ctx = null;
      this.particles = [];
      this.mouse = { x: null, y: null };
      this.animationId = null;
      this.isRunning = false;
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);

      this._init();
    }

    _init() {
      // Create canvas
      this.canvas = document.createElement('canvas');
      this.canvas.style.width = '100%';
      this.canvas.style.height = '100%';
      this.canvas.style.display = 'block';
      this.container.appendChild(this.canvas);

      this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
      if (!this.ctx) return;

      // Size canvas
      this._resize();

      // Events
      this._boundResize = this._resize.bind(this);
      this._boundMouseMove = this._onMouseMove.bind(this);
      this._boundMouseLeave = this._onMouseLeave.bind(this);
      this._boundTouchMove = this._onTouchMove.bind(this);
      this._boundTouchEnd = this._onMouseLeave.bind(this);

      window.addEventListener('resize', this._boundResize);
      this.canvas.addEventListener('mousemove', this._boundMouseMove, { passive: true });
      this.canvas.addEventListener('mouseleave', this._boundMouseLeave);
      this.canvas.addEventListener('touchmove', this._boundTouchMove, { passive: true });
      this.canvas.addEventListener('touchend', this._boundTouchEnd);

      // Start
      this._initParticles();
      this._animate();
    }

    _resize() {
      const rect = this.container.getBoundingClientRect();
      this.width = rect.width;
      this.height = rect.height;
      this.canvas.width = this.width * this.dpr;
      this.canvas.height = this.height * this.dpr;
      this.canvas.style.width = this.width + 'px';
      this.canvas.style.height = this.height + 'px';
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

      // Reinitialize particles on resize
      this._initParticles();
    }

    _initParticles() {
      if (!this.ctx) return;

      const { text, fontSize, fontFamily, fontWeight, particleDensity, particleSize, particleColor } = this.options;

      // Draw text offscreen to sample pixel data
      this.ctx.clearRect(0, 0, this.width, this.height);
      this.ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
      this.ctx.fillStyle = '#000';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(text, this.width / 2, this.height / 2);

      const imageData = this.ctx.getImageData(
        0, 0,
        this.width * this.dpr,
        this.height * this.dpr
      );

      this.particles = [];
      const data = imageData.data;
      const imgWidth = imageData.width;
      const step = Math.round(particleDensity * this.dpr);

      for (let y = 0; y < imageData.height; y += step) {
        for (let x = 0; x < imgWidth; x += step) {
          const index = (y * imgWidth + x) * 4;
          const alpha = data[index + 3];

          if (alpha > 128) {
            const px = x / this.dpr;
            const py = y / this.dpr;
            this.particles.push({
              x: px,
              y: py,
              baseX: px,
              baseY: py,
              size: particleSize,
              density: Math.random() * 30 + 1,
              color: particleColor,
            });
          }
        }
      }

      // Clear after sampling
      this.ctx.clearRect(0, 0, this.width, this.height);
    }

    _animate() {
      this.isRunning = true;

      const loop = () => {
        if (!this.isRunning) return;

        this.ctx.clearRect(0, 0, this.width, this.height);

        if (this.options.backgroundColor !== 'transparent') {
          this.ctx.fillStyle = this.options.backgroundColor;
          this.ctx.fillRect(0, 0, this.width, this.height);
        }

        const mouseX = this.mouse.x;
        const mouseY = this.mouse.y;
        const mouseRadius = this.options.mouseRadius;
        const returnSpeed = this.options.returnSpeed;
        const pushForce = this.options.pushForce;

        for (let i = 0; i < this.particles.length; i++) {
          const p = this.particles[i];

          if (mouseX !== null && mouseY !== null) {
            const dx = mouseX - p.x;
            const dy = mouseY - p.y;
            const distSq = dx * dx + dy * dy;
            const radiusSq = mouseRadius * mouseRadius;

            if (distSq < radiusSq) {
              const dist = Math.sqrt(distSq);
              const forceX = (dx / dist) * pushForce;
              const forceY = (dy / dist) * pushForce;
              p.x -= forceX;
              p.y -= forceY;
            }
          }

          // Return to base position
          p.x += (p.baseX - p.x) * returnSpeed;
          p.y += (p.baseY - p.y) * returnSpeed;

          // Draw
          this.ctx.beginPath();
          this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          this.ctx.fillStyle = p.color;
          this.ctx.fill();
        }

        this.animationId = requestAnimationFrame(loop);
      };

      loop();
    }

    _onMouseMove(e) {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
    }

    _onTouchMove(e) {
      if (e.touches.length > 0) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = e.touches[0].clientX - rect.left;
        this.mouse.y = e.touches[0].clientY - rect.top;
      }
    }

    _onMouseLeave() {
      this.mouse.x = null;
      this.mouse.y = null;
    }

    destroy() {
      this.isRunning = false;
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
      }
      window.removeEventListener('resize', this._boundResize);
      if (this.canvas) {
        this.canvas.removeEventListener('mousemove', this._boundMouseMove);
        this.canvas.removeEventListener('mouseleave', this._boundMouseLeave);
        this.canvas.removeEventListener('touchmove', this._boundTouchMove);
        this.canvas.removeEventListener('touchend', this._boundTouchEnd);
        this.canvas.remove();
      }
    }
  }

  // Expose globally
  window.TextParticle = TextParticle;

})();
