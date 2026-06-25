/* ============================================================
   XEROEK — JavaScript
   Text Particle, AOS, Vanilla-Tilt, Cursor, Nav, Counters
   ============================================================ */

(function () {
  'use strict';

  let particleInstance = null;

  // ---------- DOM Ready ----------
  document.addEventListener('DOMContentLoaded', init);

  function init() {
    initThemeToggle();
    initTextParticle();
    initAOS();
    initNavbar();
    initMobileMenu();
    initSmoothScroll();
    initCounters();
    initCursor();
    initTilt();
    initContactForm();
  }

  // ---------- Theme Toggle ----------
  function initThemeToggle() {
    const toggles = document.querySelectorAll('.theme-toggle');
    if (!toggles.length) return;

    toggles.forEach(toggle => {
      toggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);

        // Update text particles if active
        if (particleInstance && typeof particleInstance.updateColor === 'function') {
          const newAccent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
          particleInstance.updateColor(newAccent);
        }

        // Dispatch custom themechange event for dotted-surface.js
        window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: newTheme } }));
      });
    });
  }

  // ---------- Text Particle (Hero) ----------
  function initTextParticle() {
    if (typeof TextParticle === 'undefined') return;

    const container = document.getElementById('particle-container');
    if (!container) return;

    // Responsive font size
    const width = window.innerWidth;
    const isMobile = width < 768;

    // On mobile, solid text is shown via CSS — skip particle canvas entirely
    if (isMobile) return;

    let fontSize = 140;
    if (width < 1024) fontSize = 110;

    const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#e8dcc8';

    particleInstance = new TextParticle(container, {
      text: 'XEROEK',
      fontSize: fontSize,
      fontFamily: "'Clash Display', 'Arial Black', sans-serif",
      fontWeight: '600',
      particleSize: 2,
      particleColor: accentColor,
      particleDensity: 4,
      mouseRadius: 120,
      returnSpeed: 0.05,
      pushForce: 3,
      backgroundColor: 'transparent',
    });
  }


  // ---------- AOS (Animate On Scroll) ----------
  function initAOS() {
    if (typeof AOS === 'undefined') return;

    // Disable complex animations on mobile for performance
    const isMobile = window.innerWidth < 768;

    AOS.init({
      duration: 700,
      offset: 80,
      easing: 'ease-out-cubic',
      once: true,
      mirror: false,
      disable: false,
      anchorPlacement: 'top-bottom',
      // Reduce animation load on mobile
      ...(isMobile && { duration: 400, offset: 40 }),
    });
  }


  // ---------- Navbar Scroll Behavior ----------
  function initNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    const hero = document.getElementById('hero');
    if (!hero) return;

    // Use IntersectionObserver instead of scroll events (better perf)
    const observer = new IntersectionObserver(
      ([entry]) => {
        navbar.classList.toggle('scrolled', !entry.isIntersecting);
      },
      { threshold: 0.1, rootMargin: '-60px 0px 0px 0px' }
    );

    observer.observe(hero);
  }


  // ---------- Mobile Menu ----------
  function initMobileMenu() {
    const hamburger = document.getElementById('nav-hamburger');
    const mobileNav = document.getElementById('mobile-nav');
    if (!hamburger || !mobileNav) return;

    hamburger.addEventListener('click', () => {
      const isActive = hamburger.classList.toggle('active');
      mobileNav.classList.toggle('active', isActive);
      document.body.classList.toggle('menu-open', isActive);
    });

    // Close menu when clicking a link
    mobileNav.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        mobileNav.classList.remove('active');
        document.body.classList.remove('menu-open');
      });
    });
  }


  // ---------- Smooth Scroll ----------
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = anchor.getAttribute('href');
        if (targetId === '#') return;

        const target = document.querySelector(targetId);
        if (!target) return;

        const navHeight = parseInt(
          getComputedStyle(document.documentElement)
            .getPropertyValue('--nav-height'), 10
        ) || 72;

        const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
        window.scrollTo({ top, behavior: 'smooth' });
      });
    });
  }


  // ---------- Animated Counters ----------
  function initCounters() {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach(counter => observer.observe(counter));
  }

  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-count'), 10);
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 1800;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);

      el.textContent = current + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }


  // ---------- Custom Cursor ----------
  function initCursor() {
    // Only on non-touch devices
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;
    if (window.innerWidth < 768) return;

    const dot = document.querySelector('.cursor-dot');
    const ring = document.querySelector('.cursor-ring');
    if (!dot || !ring) return;

    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
    }, { passive: true });

    // Smooth ring follow
    function followRing() {
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;
      ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
      requestAnimationFrame(followRing);
    }
    followRing();

    // Hover effect on interactive elements
    const interactives = document.querySelectorAll(
      'a, button, input, textarea, .service-card, .stat-item'
    );

    interactives.forEach(el => {
      el.addEventListener('mouseenter', () => {
        dot.classList.add('hovering');
        ring.classList.add('hovering');
      });

      el.addEventListener('mouseleave', () => {
        dot.classList.remove('hovering');
        ring.classList.remove('hovering');
      });
    });

    // Hide cursor when leaving window
    document.addEventListener('mouseleave', () => {
      dot.style.opacity = '0';
      ring.style.opacity = '0';
    });

    document.addEventListener('mouseenter', () => {
      dot.style.opacity = '1';
      ring.style.opacity = '1';
    });
  }


  // ---------- Vanilla Tilt (Service Cards) ----------
  function initTilt() {
    if (typeof VanillaTilt === 'undefined') return;
    // Disable on touch devices
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;

    const cards = document.querySelectorAll('.service-card');
    if (!cards.length) return;

    VanillaTilt.init(cards, {
      max: 8,
      speed: 400,
      perspective: 1200,
      scale: 1.02,
      glare: true,
      'max-glare': 0.12,
      gyroscope: false,
    });
  }


  // ---------- Contact Form ----------
  function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = form.querySelector('.form-submit');
      const statusEl = form.querySelector('.form-status');
      const originalText = submitBtn.textContent;

      // Basic validation
      const name = form.querySelector('#form-name').value.trim();
      const email = form.querySelector('#form-email').value.trim();
      const message = form.querySelector('#form-message').value.trim();

      if (!name || !email || !message) {
        showFormStatus(statusEl, 'Please fill in all fields.', 'error');
        return;
      }

      if (!isValidEmail(email)) {
        showFormStatus(statusEl, 'Please enter a valid email address.', 'error');
        return;
      }

      // Submit
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';

      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { 'Accept': 'application/json' },
        });

        if (response.ok) {
          showFormStatus(statusEl, 'Message sent successfully!', 'success');
          form.reset();
        } else {
          throw new Error('Server error');
        }
      } catch (err) {
        showFormStatus(statusEl, 'Something went wrong. Please try again.', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  }

  function showFormStatus(el, message, type) {
    if (!el) return;
    el.textContent = message;
    el.className = 'form-status ' + type;

    setTimeout(() => {
      el.textContent = '';
      el.className = 'form-status';
    }, 5000);
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

})();
