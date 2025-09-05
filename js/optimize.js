// =====================
// Captura erros globais e promessas rejeitadas
// =====================
// global.js

// Captura erros gerais
window.addEventListener("error", (event) => {
  const msg = event.message || "";
  const ignorePatterns = [
    "A listener indicated an asynchronous response",
    "chrome-extension",
  ];

  if (ignorePatterns.some((pattern) => msg.includes(pattern))) {
    console.warn("Erro ignorado:", msg);
    event.preventDefault();
  }
});

// Captura promessas rejeitadas não tratadas
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

// =====================
// Cache de CSS e JS para evitar recarregamento
// =====================
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
    script.onload = () => resolve();
    script.onerror = () => reject(`Erro ao carregar ${src}`);
    document.body.appendChild(script);
    loadedAssets.js.add(src);
  });
}

// =====================
// Lazy-load de componentes via IntersectionObserver
// =====================
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(async (entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;

      // Suporta múltiplas classes no formato categoria-nome
      const classes = Array.from(el.classList).filter((cls) =>
        cls.includes("-")
      );
      for (const cls of classes) {
        const [category, name] = cls.split("-");
        const cssPath = `/constant/${category}/${name}/styles.css`;
        const jsPath = `/constant/${category}/${name}/script.js`;

        try {
          await loadCSS(cssPath);
          await loadJS(jsPath);

          // Inicializa o componente se houver init
          const initName = `init${name[0].toUpperCase()}${name.slice(1)}`;
          if (window.Components?.[cls]?.init) {
            window.Components[cls].init();
          } else if (typeof window[initName] === "function") {
            window[initName]();
          }
        } catch (err) {
          console.error(err);
        }
      }

      observer.unobserve(el); // Não observa mais após carregar
    });
  },
  { threshold: 0.1 }
);

// =====================
// Observa todos os elementos com classes no padrão categoria-nome
// =====================
document.addEventListener("DOMContentLoaded", () => {
  document
    .querySelectorAll("[class*='-']")
    .forEach((el) => observer.observe(el));
});
