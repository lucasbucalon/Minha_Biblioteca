import { imageMap, linkMap, iconMap } from "../src/main.js";

//------------------
// MAPAS UNIVERSAIS DE ASSETS
//------------------

//------------------
// FUNÇÃO UNIVERSAL PARA APLICAR ASSETS
//------------------
export function applyAssets(root = document) {
  // IMAGENS
  root.querySelectorAll("my-image[data-image], my-image[src]").forEach((el) => {
    if (el.connectedCallback) el.connectedCallback();
  });

  // LINKS
  root.querySelectorAll("my-link[data-link], my-link[href]").forEach((el) => {
    if (el.connectedCallback) el.connectedCallback();
  });

  // ICONES
  applyIcons(root);
}

//------------------
// CUSTOM ELEMENT <my-icon>
//------------------
class MyIconElement extends HTMLElement {
  connectedCallback() {
    if (this._initialized) return;
    this._initialized = true;

    const name = this.getAttribute("data-icon");
    const src = iconMap[name];
    if (!src) return;

    // não sobrescreve se já contém <img> ou <svg>
    if (this.querySelector("img, svg")) return;

    // SVG inline
    if (src.trim().startsWith("<svg")) {
      this.innerHTML = src;
      const svg = this.querySelector("svg");
      if (!svg) return;
      svg.setAttribute("fill", "currentColor");
      if (this.hasAttribute("width"))
        svg.setAttribute("width", this.getAttribute("width"));
      if (this.hasAttribute("height"))
        svg.setAttribute("height", this.getAttribute("height"));
    } else {
      // PNG/JPG/externo
      const img = document.createElement("img");
      img.src = src;
      img.alt = name;
      if (this.hasAttribute("width")) img.width = this.getAttribute("width");
      if (this.hasAttribute("height")) img.height = this.getAttribute("height");
      this.appendChild(img);
    }
  }
}

if (!customElements.get("my-icon")) {
  customElements.define("my-icon", MyIconElement);
}

//------------------
// CUSTOM ELEMENT <my-image>
//------------------
class MyImageElement extends HTMLElement {
  connectedCallback() {
    if (this._initialized) return;
    this._initialized = true;

    // não recria se já existe <img>
    if (this.querySelector("img")) return;

    const name = this.getAttribute("data-image");
    const directSrc = this.getAttribute("src");
    const src = (name && imageMap[name]) || directSrc;
    if (!src) return;

    const img = document.createElement("img");
    img.src = src;
    img.alt = this.getAttribute("alt") || name || "";

    if (this.hasAttribute("width")) img.width = this.getAttribute("width");
    if (this.hasAttribute("height")) img.height = this.getAttribute("height");

    // copia atributos extras
    [...this.attributes].forEach((attr) => {
      if (
        !["data-image", "src", "alt", "width", "height"].includes(attr.name)
      ) {
        img.setAttribute(attr.name, attr.value);
      }
    });

    this.appendChild(img);
  }
}

if (!customElements.get("my-image")) {
  customElements.define("my-image", MyImageElement);
}

//------------------
// CUSTOM ELEMENT <my-link>
//------------------
//------------------
// CUSTOM ELEMENT <my-link>
//------------------
class MyLinkElement extends HTMLElement {
  connectedCallback() {
    if (this._initialized) return;
    this._initialized = true;

    const dataLink = this.getAttribute("data-link");
    const hrefAttr = this.getAttribute("href");
    const url = (dataLink && linkMap[dataLink]) || hrefAttr || dataLink;
    if (!url) return;

    const target = this.getAttribute("target") || "_self";

    // Cria <a> interno
    const a = document.createElement("a");
    a.href = url;
    a.target = target;
    if (target === "_blank") a.rel = "noopener noreferrer";

    // Move todos os filhos do <my-link> para dentro do <a>
    while (this.firstChild) {
      a.appendChild(this.firstChild);
    }

    this.appendChild(a);
  }
}

if (!customElements.get("my-link")) {
  customElements.define("my-link", MyLinkElement);
}

//------------------
// REAPLICAR ICONS DINAMICAMENTE
//------------------
export function applyIcons(root = document) {
  root.querySelectorAll("my-icon[data-icon]").forEach((icon) => {
    if (icon.connectedCallback) icon.connectedCallback();
  });
}

//------------------
// OBSERVADOR AUTOMÁTICO
//------------------
export function observeAssets(container = document.getElementById("route")) {
  if (!container) return;

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType !== 1) return; // só elementos

        // inicializa my-* que ainda não renderizou
        if (
          node.matches("my-image[data-image]:not(:has(img))") ||
          node.matches("my-image[src]:not(:has(img))") ||
          node.matches("my-icon[data-icon]:not(:has(img, svg))") ||
          node.matches("my-link[data-link]:not(:has(a))") ||
          node.matches("my-link[href]:not(:has(a))")
        ) {
          if (node.connectedCallback) node.connectedCallback();
        }
      });
    });
  });

  observer.observe(container, { childList: true, subtree: true });
}

//------------------
// INICIALIZAÇÃO
//------------------
export function initAssets() {
  applyAssets();
  observeAssets();
}
