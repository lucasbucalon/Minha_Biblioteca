window.addEventListener("error", (event) => {
  const msg = event.message || "";
  const ignorePatterns = [
    "A listener indicated an asynchronous response",
    "chrome-extension",
  ];
  if (ignorePatterns.some((p) => msg.includes(p))) {
    console.warn("Erro ignorado:", msg);
    event.preventDefault();
  }
});

window.addEventListener("unhandledrejection", (event) => {
  const reason = event.reason || "";
  if (
    typeof reason === "string" &&
    reason.includes("A listener indicated an asynchronous response")
  ) {
    console.warn("Rejeição de promessa ignorada:", reason);
    event.preventDefault();
  }
});

const loadedAssets = { css: new Set(), js: new Set() };

async function loadCSS(href) {
  if (loadedAssets.css.has(href)) return;
  return new Promise((resolve) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.onload = resolve;
    document.head.appendChild(link);
    loadedAssets.css.add(href);
  });
}

async function loadJS(src) {
  if (loadedAssets.js.has(src)) return;
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.defer = true;
    script.onload = resolve;
    script.onerror = () => reject(`Erro ao carregar ${src}`);
    document.body.appendChild(script);
    loadedAssets.js.add(src);
  });
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(async (entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const classes = Array.from(el.classList).filter((cls) =>
        cls.includes("-")
      );
      for (const cls of classes) {
        const [category, name] = cls.split("-");
        await loadCSS(`/constant/${category}/${name}/styles.css`);
        await loadJS(`/constant/${category}/${name}/script.js`);
        if (window.Components?.[cls]?.init) window.Components[cls].init();
      }
      observer.unobserve(el);
    });
  },
  { threshold: 0.1 }
);

document.addEventListener("DOMContentLoaded", () => {
  document
    .querySelectorAll("[class*='-']")
    .forEach((el) => observer.observe(el));
});
