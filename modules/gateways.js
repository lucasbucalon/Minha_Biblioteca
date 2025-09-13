(function () {
  const containerId = "app"; // onde a página será injetada
  const loaderId = "pageLoad";

  // Cria container principal se não existir
  let container = document.getElementById(containerId);
  if (!container) {
    container = document.createElement("div");
    container.id = containerId;
    document.body.appendChild(container);
  }

  // Cria loader full-screen
  let loader = document.getElementById(loaderId);
  if (!loader) {
    loader = document.createElement("div");
    loader.id = loaderId;
    loader.style.cssText = `
        position: fixed;
        top:0;
        left:0;
        width:100%;
        height:100%;
        display:flex;
        align-items:center;
        justify-content:center;
        background:#1e1e1e;
        color:#fff;
        font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
        font-size:18px;
        z-index:9999;
      `;
    loader.innerHTML = "Carregando…";
    document.body.appendChild(loader);
  }

  // Função para carregar página com loader
  window.loadWithPageLoad = async function (pagePath) {
    loader.style.display = "flex";

    try {
      const res = await fetch(
        pagePath.endsWith(".html") ? pagePath : `${pagePath}.html`
      );
      if (!res.ok) throw new Error(`Falha ao buscar ${pagePath}`);
      const html = await res.text();
      container.innerHTML = html;
    } catch (err) {
      console.error("Erro ao carregar a página:", err);
      container.innerHTML = `<h1 style="color:#fff;text-align:center;margin-top:2rem">Erro ao carregar a página</h1>`;
    } finally {
      loader.style.display = "none";
    }
  };

  // Exemplo de uso automático: carrega home.html
  document.addEventListener("DOMContentLoaded", () => {
    loadWithPageLoad(".app/Home/home.html");
  });
})();
