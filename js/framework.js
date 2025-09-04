window.loadConstants = async function (root = document) {
  const loadedCss = window._loadedCss || new Set();
  const loadedJs = window._loadedJs || new Set();
  window._loadedCss = loadedCss;
  window._loadedJs = loadedJs;

  const elements = root.querySelectorAll("[class*='-']");

  const classSet = new Set();
  elements.forEach((el) => {
    el.classList.forEach((cls) => {
      if (cls.includes("-")) classSet.add(cls);
    });
  });
  const components = [...classSet];

  components.forEach((comp) => {
    const [category, name] = comp.split("-");
    const cssPath = `/constant/${category}/${name}/styles.css`;
    if (!loadedCss.has(cssPath)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = cssPath;
      document.head.appendChild(link);
      loadedCss.add(cssPath);
    }
  });

  const scriptPromises = components.map((comp) => {
    const [category, name] = comp.split("-");
    const jsPath = `/constant/${category}/${name}/script.js`;

    if (loadedJs.has(jsPath)) {
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
      document.body.appendChild(script);
      loadedJs.add(jsPath);
    });
  });

  await Promise.all(scriptPromises);
};
