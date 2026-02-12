/* ============================================
   AIFORALL V2 — Particles
   Subtle background particle system
   ============================================ */

const Particles = (() => {
  let canvas, ctx, particles, animId;
  const COUNT = 50;
  const MAX_SPEED = 0.3;

  function init(containerId = 'particle-canvas') {
    canvas = document.getElementById(containerId);
    if (!canvas) return;

    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);

    particles = Array.from({ length: COUNT }, () => createParticle());
    loop();
  }

  function resize() {
    canvas.width = canvas.offsetWidth * devicePixelRatio;
    canvas.height = canvas.offsetHeight * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);
  }

  function createParticle() {
    return {
      x: Math.random() * (canvas?.offsetWidth || 800),
      y: Math.random() * (canvas?.offsetHeight || 600),
      vx: (Math.random() - 0.5) * MAX_SPEED,
      vy: (Math.random() - 0.5) * MAX_SPEED,
      r: Math.random() * 2 + 0.5,
      alpha: Math.random() * 0.3 + 0.1,
    };
  }

  function loop() {
    if (!ctx) return;
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;

    ctx.clearRect(0, 0, w, h);

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;

      // Wrap around
      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(99, 102, 241, ${p.alpha})`;
      ctx.fill();
    });

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(99, 102, 241, ${0.08 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    animId = requestAnimationFrame(loop);
  }

  function destroy() {
    cancelAnimationFrame(animId);
    window.removeEventListener('resize', resize);
    particles = [];
  }

  return { init, destroy };
})();
