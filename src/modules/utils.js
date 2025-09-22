// utils.js
import { imageMap, linkMap, iconMap } from "../main.js";

//------------------
// IFRAME ROUTES
//------------------

//------------------
// IMAGENS
//------------------
function applyImages(root) {
  const images = root.querySelectorAll("[data-image]");
  images.forEach((img) => {
    const name = img.getAttribute("data-image");
    const cfg = imageMap[name];
    if (!cfg) {
      console.warn(`⚠️ data-image="${name}" não encontrado no imageMap`);
      return;
    }

    img.alt = cfg.alt || name;
    img.title = cfg.title || name;
    img.decoding = "async";
    img.loading = "lazy";
    img.fetchPriority = cfg.fetchpriority || "low";

    let finalSrc = cfg.src;
    const isDark =
      cfg.dark && window.matchMedia("(prefers-color-scheme: dark)").matches;

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
}

//------------------
// LINKS
//------------------
function applyLinks(root) {
  const links = root.querySelectorAll("[data-link]");
  links.forEach((link) => {
    const name = link.getAttribute("data-link");
    const cfg = linkMap[name];
    if (!cfg) {
      console.warn(`⚠️ data-link="${name}" não encontrado no linkMap`);
      return;
    }

    link.href = cfg.href;
    link.title = cfg.title || name;
    link.rel = "noopener noreferrer";

    if (cfg.type) link.type = cfg.type;
    if (cfg["aria-label"]) link.setAttribute("aria-label", cfg["aria-label"]);

    if (cfg.download) {
      if (cfg.download === true) {
        link.setAttribute("download", "");
      } else {
        link.setAttribute("download", cfg.download);
      }
    }

    if (cfg.target) link.target = cfg.target;
  });
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
    const cfg = iconMap[name];
    if (!cfg) return;

    if (!this.querySelector("img")) {
      const img = document.createElement("img");
      img.src = cfg.src || cfg; // suporta string simples ou objeto
      img.alt = this.getAttribute("alt") || name;
      img.title = this.getAttribute("title") || name;
      img.loading = "lazy";
      img.decoding = "async";

      if (this.hasAttribute("width")) img.width = this.getAttribute("width");
      if (this.hasAttribute("height")) img.height = this.getAttribute("height");

      img.setAttribute("role", "img");
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
// UNIVERSAL APPLY
//------------------
export function applyAssets(root = document) {
  applyImages(root);
  applyLinks(root);
  applyIcons(root);
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
// INICIALIZAÇÃO GLOBAL
//------------------
export function initAssets() {
  applyAssets();
  observeAssets();
  // initIframeRoutes();
}
