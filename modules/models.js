// framework.js

import { config } from "../src/main.js";
// Carrega assets de /constant/<category>/<name> quando elementos com classe "category-name" aparecem
window.loadConstants = async function (root = document) {
  // usa sets globais em window para persistir entre chamadas
  const loadedCss = window._loadedCss || new Set();
  const loadedJs = window._loadedJs || new Set();
  window._loadedCss = loadedCss;
  window._loadedJs = loadedJs;

  const elements = (root || document).querySelectorAll("[class*='-']");
  const classSet = new Set();
  elements.forEach((el) =>
    el.classList.forEach((c) => {
      if (c.includes("-")) classSet.add(c);
    })
  );
  const components = [...classSet];

  // carregar CSS primeiro (não await para todos os scripts)
  components.forEach((comp) => {
    const [category, name] = comp.split("-");
    const cssPath = `${config.dirs.models}/${category}/${name}/styles.css`;
    if (!loadedCss.has(cssPath)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = cssPath;
      document.head.appendChild(link);
      loadedCss.add(cssPath);
    }
  });

  // carregar scripts (aguardar para poder chamar init após carregamento)
  const promises = components.map((comp) => {
    const [category, name] = comp.split("-");
    const jsPath = `${config.dirs.models}/${category}/${name}/script.js`;
    if (loadedJs.has(jsPath)) {
      // se já carregado, tenta executar init
      if (window.Components?.[comp]?.init) window.Components[comp].init();
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = jsPath;
      script.defer = true;
      script.onload = () => {
        if (window.Components?.[comp]?.init) window.Components[comp].init();
        resolve();
      };
      script.onerror = () => resolve(); // não falhar tudo
      document.body.appendChild(script);
      loadedJs.add(jsPath);
    });
  });

  await Promise.all(promises);
};
