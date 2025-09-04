document.addEventListener("DOMContentLoaded", () => {
  const loadedStyles = new Set();
  const loadedScripts = new Map();
  const componentCache = new Map();

  function getComponentPath(componentName, type = "html") {
    return `${window.location.origin}/components/${componentName}.${type}`;
  }

  async function loadComponent(componentName, container, props = {}) {
    const htmlPath = getComponentPath(componentName, "html");

    let html;
    if (componentCache.has(componentName)) {
      html = componentCache.get(componentName);
    } else {
      try {
        const res = await fetch(htmlPath);
        if (!res.ok)
          throw new Error(`Componente ${componentName} não encontrado`);
        html = await res.text();
        componentCache.set(componentName, html);
      } catch (err) {
        console.warn(err.message);
        container.innerHTML = `<p style="color:red">Erro ao carregar componente ${componentName}</p>`;
        return;
      }
    }

    Object.keys(props).forEach((key) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
      html = html.replace(regex, props[key]);
    });

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;

    await Promise.all(
      Array.from(tempDiv.querySelectorAll('link[rel="stylesheet"]')).map(
        (link) => {
          if (!link.href || loadedStyles.has(link.href))
            return Promise.resolve();
          loadedStyles.add(link.href);
          const newLink = link.cloneNode(true);
          document.head.appendChild(newLink);
          return new Promise((resolve) => {
            newLink.onload = newLink.onerror = resolve;
          });
        }
      )
    );

    const scripts = Array.from(tempDiv.querySelectorAll("script"));
    scripts.forEach((s) => s.remove());

    container.innerHTML = tempDiv.innerHTML;

    for (const script of scripts) {
      const scriptId = `${componentName}-${script.src || "inline"}`;
      if (loadedScripts.has(scriptId)) continue;

      const newScript = document.createElement("script");
      if (script.src) {
        newScript.src = getComponentPath(componentName, "js");
        newScript.defer = true;
      } else {
        newScript.textContent = script.textContent;
      }
      loadedScripts.set(scriptId, true);
      document.body.appendChild(newScript);
    }
  }

  function loadAllComponents() {
    document.querySelectorAll("[data-component]").forEach((el) => {
      const componentName = el.dataset.component;
      const props = el.dataset.props ? JSON.parse(el.dataset.props) : {};
      if (componentName) loadComponent(componentName, el, props);
    });
  }

  loadAllComponents();

  document.addEventListener("spa:pageLoaded", loadAllComponents);
});
