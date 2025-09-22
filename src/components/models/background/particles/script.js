window.Components = window.Components || {};
window.Components["background-particles"] = {
  init: function () {
    const container = document.querySelector(".background-particles");
    if (!container) return;

    const particles = [];

    function createParticle() {
      const particle = document.createElement("div");
      particle.classList.add("particle");

      const size = Math.random() * 4 + 1;
      particle.style.width = particle.style.height = `${size}px`;

      particle.style.top = `${Math.random() * container.offsetHeight}px`;
      particle.style.left = `${Math.random() * container.offsetWidth}px`;

      particle.dataset.vx = (Math.random() * 2 - 1).toString();
      particle.dataset.vy = (Math.random() * 2 - 1).toString();

      container.appendChild(particle);
      particles.push(particle);
    }

    function animateParticles() {
      particles.forEach((p) => {
        let top = parseFloat(p.style.top) + parseFloat(p.dataset.vy);
        let left = parseFloat(p.style.left) + parseFloat(p.dataset.vx);

        if (top < 0 || top > container.offsetHeight)
          p.dataset.vy = -parseFloat(p.dataset.vy);
        if (left < 0 || left > container.offsetWidth)
          p.dataset.vx = -parseFloat(p.dataset.vx);

        p.style.top = `${top}px`;
        p.style.left = `${left}px`;
      });

      requestAnimationFrame(animateParticles);
    }

    for (let i = 0; i < 100; i++) createParticle();
    animateParticles();
  },
};
