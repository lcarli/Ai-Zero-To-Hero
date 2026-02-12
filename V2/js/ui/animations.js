/* ============================================
   AIFORALL V2 — Animations
   Fade-in, slide-up, scroll reveals
   ============================================ */

const Animations = (() => {
  /** Observe elements and add .visible when in viewport */
  function initScrollReveal() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
  }

  /** Stagger children animation */
  function staggerChildren(container, delay = 80) {
    const children = container.querySelectorAll('.reveal');
    children.forEach((child, i) => {
      child.style.transitionDelay = `${i * delay}ms`;
    });
    // Trigger after a frame so delay applies
    requestAnimationFrame(() => {
      children.forEach((child) => child.classList.add('visible'));
    });
  }

  /** Number counter animation */
  function animateNumber(el, target, duration = 1000) {
    const start = parseInt(el.textContent) || 0;
    const diff = target - start;
    const startTime = performance.now();

    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out
      const ease = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(start + diff * ease);
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  /** Simple typewriter effect */
  function typewriter(el, text, speed = 40) {
    el.textContent = '';
    let i = 0;
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        el.textContent += text[i];
        i++;
        if (i >= text.length) {
          clearInterval(interval);
          resolve();
        }
      }, speed);
    });
  }

  return { initScrollReveal, staggerChildren, animateNumber, typewriter };
})();
