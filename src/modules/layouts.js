// components.js
import { config } from "../main.js";
// Carrega componentes HTML via <div data-component="Card" data-props='{}'></div>
const loadedStyles = new Set();
const loadedScripts = new Set();
const componentCache = new Map();

function getComponentPath(name, type = "html") {
  return `${window.location.origin}/${config.dirs.layouts}/${name}.${type}`;
}

export async function loadComponent(componentName, container, props = {}) {
  if (!componentName || !container) return;
  let html = componentCache.get(componentName);
  if (!html) {
    try {
      const res = await fetch(getComponentPath(componentName, "html"));
      if (!res.ok) throw new Error("not found");
      html = await res.text();
      componentCache.set(componentName, html);
    } catch (err) {
      container.innerHTML = `<p style="color:red">Erro ao carregar ${componentName}</p>`;
      return;
    }
  }

  // Safe props replace
  let rendered = html;
  Object.keys(props).forEach((k) => {
    const safe = String(props[k]).replace(
      /[&<>"]/g,
      (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m])
    );
    rendered = rendered.replace(new RegExp(`{{\\s*${k}\\s*}}`, "g"), safe);
  });

  const temp = document.createElement("div");
  temp.innerHTML = rendered;

  // load styles
  const stylePromises = Array.from(
    temp.querySelectorAll('link[rel="stylesheet"]')
  ).map((link) => {
    if (!link.href || loadedStyles.has(link.href)) return Promise.resolve();
    return new Promise((resolve) => {
      const newLink = link.cloneNode(true);
      newLink.onload = newLink.onerror = resolve;
      document.head.appendChild(newLink);
      loadedStyles.add(link.href);
    });
  });
  await Promise.all(stylePromises);

  // collect scripts and remove from temp
  const scripts = Array.from(temp.querySelectorAll("script"));
  scripts.forEach((s) => s.remove());

  container.innerHTML = temp.innerHTML;

  // execute scripts (avoid duplicates)
  scripts.forEach((script, idx) => {
    const id = `${componentName}-${script.src || "inline-" + idx}`;
    if (loadedScripts.has(id)) return;
    const el = document.createElement("script");
    if (script.src) {
      el.src = script.src;
      el.defer = true;
    } else {
      el.textContent = script.textContent;
    }
    document.body.appendChild(el);
    loadedScripts.add(id);
  });

  // notify pwa button setup if exists
  if (window.setupInstallButton) window.setupInstallButton();
}

// helper: carregar todos com data-component
export function loadAllComponents() {
  document.querySelectorAll("[data-component]").forEach((el) => {
    if (el.dataset.initialized === "true") return;
    const name = el.dataset.component;
    const props = el.dataset.props ? JSON.parse(el.dataset.props) : {};
    loadComponent(name, el, props);
    el.dataset.initialized = "true";
  });
}

// iniciar automático e ao SPA carregar
document.addEventListener("DOMContentLoaded", loadAllComponents);
document.addEventListener("spa:pageLoaded", loadAllComponents);
