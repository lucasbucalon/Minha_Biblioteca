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

// =====================
// Funções de fade
// =====================

async function updateContent(html, page, param = null) {
  const content = document.getElementById("content");
  const temp = document.createElement("div");
  temp.innerHTML = html;

  await ensureStyles(temp);

  content.style.transition = "opacity 0.2s";
  content.style.opacity = 0;

  setTimeout(() => {
    content.innerHTML = temp.innerHTML;

    executeScripts(content);
    if (typeof loadConstants === "function") loadConstants(content);

    if (param) {
      content
        .querySelectorAll("[data-param]")
        .forEach((el) => (el.textContent = param));
    }

    const pageTitle =
      temp.querySelector("title")?.textContent || page.split("/").pop();
    document.title = pageTitle;

    content.style.opacity = 1;

    document.dispatchEvent(new Event("spa:pageLoaded"));
  }, 100);
}
