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
