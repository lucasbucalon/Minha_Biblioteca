import { imageMap, linkMap, iconMap } from "../src/main.js";

//------------------
// FUNÇÃO UNIVERSAL PARA APLICAR ASSETS
//------------------
export function applyAssets(root = document) {
  const images = root.querySelectorAll("[data-image]");
  images.forEach((img) => {
    const name = img.getAttribute("data-image");
    const cfg = imageMap[name];
    if (!cfg)
      return console.warn(`⚠️ data-image="${name}" não encontrado no imageMap`);

    img.alt = cfg.alt || name;
    img.decoding = "async";
    img.loading = "lazy";
    img.fetchPriority = cfg.fetchpriority || "low";

    let finalSrc = cfg.src;
    const isDark = cfg.dark
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
      : false;

    if (cfg.set) {
      const w = window.innerWidth;
      if (
        (!cfg.set.minWidth || w >= cfg.set.minWidth) &&
        (!cfg.set.maxWidth || w <= cfg.set.maxWidth)
      ) {
        finalSrc = isDark && cfg.set.dark ? cfg.set.dark : cfg.set.src;
      } else if (isDark && cfg.dark) {
        finalSrc = cfg.dark;
      }
    } else if (isDark && cfg.dark) {
      finalSrc = cfg.dark;
    }

    img.src = finalSrc;
  });

  //------------------
  // LINKS
  //------------------
  const links = root.querySelectorAll("[data-link]");
  links.forEach((link) => {
    const name = link.getAttribute("data-link");
    const href = linkMap[name];
    if (!href)
      return console.warn(`⚠️ data-link="${name}" não encontrado no linkMap`);
    link.href = href;
    link.rel = "noopener noreferrer";
  });

  //------------------
  // ICONS
  //------------------
  applyIcons(root);
}

//------------------
// CUSTOM ELEMENT <my-icon>
//------------------
class IconElement extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  render() {
    const name = this.getAttribute("data-icon");
    const src = iconMap[name];
    if (!src) return;

    if (!this.querySelector("img")) {
      const img = document.createElement("img");
      img.src = src;
      img.alt = name;
      img.loading = "lazy";
      img.decoding = "async";
      if (this.hasAttribute("width")) img.width = this.getAttribute("width");
      if (this.hasAttribute("height")) img.height = this.getAttribute("height");
      this.appendChild(img);
    }
  }
}

if (!customElements.get("my-icon")) {
  customElements.define("my-icon", IconElement);
}

//------------------
// REAPLICAR ICONS DINAMICAMENTE
//------------------
export function applyIcons(root = document) {
  const icons = root.querySelectorAll("my-icon[data-icon]");
  icons.forEach((icon) => {
    if (typeof icon.render === "function") icon.render();
  });
}

//------------------
// OBSERVADOR AUTOMÁTICO
//------------------
export function observeAssets(container = document.getElementById("route")) {
  if (!container) return;
  const observer = new MutationObserver(() => applyAssets(container));
  observer.observe(container, { childList: true, subtree: true });
}

//------------------
// INICIALIZAÇÃO
//------------------
export function initAssets() {
  applyAssets();
  observeAssets();
}
