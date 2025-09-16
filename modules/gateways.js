// gateways.js
import { gateway } from "../src/main.js";
import { fetchPage } from "./children.js";

const content = document.getElementById("route");

// ------------------------------
// Função genérica para carregar qualquer página de gateway (erros)
// ------------------------------
async function loadGateway(type, fallbackText = "Erro") {
  const path = gateway.error?.[type];
  if (!path) {
    console.error(`gateway.error.${type} não configurado`);
    content.innerHTML = `<h1>${fallbackText}</h1>`;
    document.title = fallbackText;
    return;
  }

  try {
    const html = await fetchPage(
      path.endsWith(".html") ? path : `${path}.html`
    );
    content.innerHTML = html;
    document.title = fallbackText;
  } catch (err) {
    console.error(`Falha ao carregar gateway ${type}:`, err);
    content.innerHTML = `<h1>${fallbackText}</h1>`;
    document.title = fallbackText;
  }
}

// ------------------------------
// PageLoad full-screen com overlay
// ------------------------------
export async function showPageLoad() {
  if (!gateway.load?.pageLoad) return;

  let loader = document.getElementById("pageLoad");
  if (!loader) {
    loader = document.createElement("div");
    loader.id = "pageLoad";
    Object.assign(loader.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "rgba(0,0,0,0.85)",
      zIndex: "9999",
      color: "#fff",
    });
    document.body.appendChild(loader);
  }

  loader.style.display = "flex";

  try {
    const html = await fetchPage(
      gateway.load.pageLoad.endsWith(".html")
        ? gateway.load.pageLoad
        : `${gateway.load.pageLoad}.html`
    );
    loader.innerHTML = html;
  } catch (err) {
    console.error("Falha ao carregar pageLoad:", err);
    loader.innerHTML = "Carregando…";
  }
}

export function hidePageLoad() {
  const loader = document.getElementById("pageLoad");
  if (!loader) return;
  loader.style.display = "none";
  loader.innerHTML = "";
}

// ------------------------------
// Atalhos para páginas de erro
// ------------------------------
export async function show404() {
  if (location.hash !== "#/404") history.pushState({}, "", "#/404");
  await loadGateway("error404", "404 - Página não encontrada");
}

export async function show500() {
  if (location.hash !== "#/500") history.pushState(null, "", "#/500");
  await loadGateway("error500", "500 - Erro interno");
}

export async function showOffline() {
  if (location.hash !== "#/offline") history.pushState(null, "", "#/offline");
  await loadGateway("errorOffline", "Sem conexão");
}

// ------------------------------
// Carrega uma página flow independente
// ------------------------------
export async function loadFlow(path) {
  const flowRoute = gateway.flows.find((f) => f.path.test(path));
  if (!flowRoute) return;

  await showPageLoad();

  try {
    // Atualiza o hash amigável
    if (location.hash !== `#${path}`) {
      location.hash = `#${path}`;
    }

    // Carrega o conteúdo do arquivo HTML
    const html = await fetchPage(
      flowRoute.page.endsWith(".html")
        ? flowRoute.page
        : `${flowRoute.page}.html`
    );
    content.innerHTML = html;
    document.title = title;
  } catch (err) {
    console.error("Falha ao carregar flow:", err);
  } finally {
    hidePageLoad();
  }
}

// ------------------------------
// Tratamento do botão de voltar/avançar
// ------------------------------
window.addEventListener("hashchange", () => {
  const path = location.hash.slice(1);
  const flowRoute = gateway.flows.find((f) => f.path.test(path));

  if (flowRoute) {
    loadFlow(path);
  } else {
    // fallback para SPA normal
    handleRoute(path);
  }
});
