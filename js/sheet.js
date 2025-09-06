let scrollPos = 0;
let targetScroll = 0;
const speed = 0.2;

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

// sheet.js

// Remove delay 300ms em alguns navegadores mobile
document.addEventListener("touchstart", () => {}, { passive: true });

// Swipe gestures para navegação
let touchStartX = 0;

document.addEventListener(
  "touchstart",
  (e) => {
    touchStartX = e.changedTouches[0].screenX;
  },
  { passive: true }
);

document.addEventListener(
  "touchend",
  (e) => {
    let dx = e.changedTouches[0].screenX - touchStartX;
    if (dx > 80) location.hash = "home"; // swipe direita → home
    if (dx < -80) location.hash = "about"; // swipe esquerda → about
  },
  { passive: true }
);

// Loader visual para fetch de páginas
function showLoader() {
  const content = document.getElementById("content");
  content.innerHTML = "<div class='loader'></div>";
}
