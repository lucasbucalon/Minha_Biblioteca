document.addEventListener("DOMContentLoaded", () => {
  const loadedStyles = new Set();
  const loadedScripts = new Set();
  const componentCache = new Map();

  // ------------------------------
  // Retorna o caminho do componente
  // ------------------------------
  function getComponentPath(name, type = "html") {
    return `${window.location.origin}/components/${name}.${type}`;
  }

  // ------------------------------
  // Configura botão de instalação PWA
  // ------------------------------
  window.setupInstallButton = () => {
    const installBtn = document.getElementById("install-btn");
    if (!installBtn) return;

    installBtn.style.display = "inline-block"; // sempre visível

    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      window.deferredPrompt = e; // guarda evento para usar depois
    });

    installBtn.addEventListener("click", async () => {
      if (!window.deferredPrompt) {
        alert(
          "Não é possível instalar o app agora. Talvez já esteja instalado ou seu navegador não suporta PWA."
        );
        return;
      }

      window.deferredPrompt.prompt(); // mostra prompt de instalação
      const choice = await window.deferredPrompt.userChoice;
      if (choice.outcome === "dismissed") {
        alert("Você cancelou a instalação do app.");
      }
      window.deferredPrompt = null;
    });
  };

  // ------------------------------
  // Carrega um componente
  // ------------------------------
  async function loadComponent(name, container, props = {}) {
    if (!container) return;

    // Busca no cache
    let html = componentCache.get(name);
    if (!html) {
      try {
        const res = await fetch(getComponentPath(name, "html"));
        if (!res.ok) throw new Error(`Componente ${name} não encontrado`);
        html = await res.text();
        componentCache.set(name, html);
      } catch (err) {
        container.innerHTML = `<p style="color:red">Erro ao carregar ${name}</p>`;
        console.error(err);
        return;
      }
    }

    // Substitui props
    let rendered = html;
    Object.keys(props).forEach((key) => {
      const safeValue = String(props[key])
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
      rendered = rendered.replace(regex, safeValue);
    });

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = rendered;

    // Carrega CSS do componente
    const cssPromises = Array.from(
      tempDiv.querySelectorAll('link[rel="stylesheet"]')
    ).map((link) => {
      if (!link.href || loadedStyles.has(link.href)) return Promise.resolve();
      return new Promise((resolve) => {
        const newLink = link.cloneNode(true);
        newLink.onload = newLink.onerror = resolve;
        document.head.appendChild(newLink);
        loadedStyles.add(link.href);
      });
    });
    await Promise.all(cssPromises);

    // Remove scripts do container temporário
    const scripts = Array.from(tempDiv.querySelectorAll("script"));
    scripts.forEach((s) => s.remove());

    // Insere HTML renderizado
    container.innerHTML = tempDiv.innerHTML;

    // Recria scripts
    scripts.forEach((script, index) => {
      const scriptId = `${name}-${script.src || "inline-" + index}`;
      if (loadedScripts.has(scriptId)) return;

      const newScript = document.createElement("script");
      if (script.src) {
        newScript.src = script.src;
        newScript.defer = true;
      } else {
        newScript.textContent = script.textContent;
      }
      document.body.appendChild(newScript);
      loadedScripts.add(scriptId);
    });

    // Configura o botão PWA
    window.setupInstallButton();
  }

  // ------------------------------
  // Carrega todos os componentes da página
  // ------------------------------
  function loadAllComponents() {
    document.querySelectorAll("[data-component]").forEach((el) => {
      if (el.dataset.initialized === "true") return;
      const componentName = el.dataset.component;
      const props = el.dataset.props ? JSON.parse(el.dataset.props) : {};
      if (componentName) loadComponent(componentName, el, props);
      el.dataset.initialized = "true";
    });
    window.setupInstallButton(); // garante botão visível após carregar todos
  }

  loadAllComponents();
  document.addEventListener("spa:pageLoaded", loadAllComponents);
});
