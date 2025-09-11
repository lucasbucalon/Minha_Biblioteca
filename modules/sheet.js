let scrollPos = 0;
let targetScroll = 0;
const speed = 0.2;

// Detecta se o dispositivo suporta toque
const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;

if (!isTouchDevice) {
  // Só aplica smooth scroll em dispositivos sem toque (desktop)
  window.addEventListener("scroll", () => {
    targetScroll = window.scrollY;
  });

  function smoothScroll() {
    scrollPos += (targetScroll - scrollPos) * speed;
    document.body.style.transform = `translateY(${-scrollPos}px)`;
    requestAnimationFrame(smoothScroll);
  }

  requestAnimationFrame(smoothScroll);

  function updateBodyHeight() {
    document.body.style.height = document.documentElement.scrollHeight + "px";
  }

  updateBodyHeight();
}

// sheet.js

// Remove delay 300ms em alguns navegadores mobile
document.addEventListener("touchstart", () => {}, { passive: true });
