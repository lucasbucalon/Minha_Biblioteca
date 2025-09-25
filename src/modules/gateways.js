// /modules/gateways.js
import { gateway } from "../main.js";
import { fetchPage } from "./children.js";
import { handleRoute } from "./route.js";

const content = document.getElementById("route");

// ------------------------------
// Função genérica para carregar gateway (erros ou pages)
// ------------------------------
async function loadGateway(type, fallbackTitle = "Erro") {
  const path = gateway.error?.[type];
  if (!path) {
    console.error(`gateway.error.${type} não configurado`);
    content.innerHTML = `<h1>${fallbackTitle}</h1>`;
    document.title = fallbackTitle;
    return;
  }

  try {
    const html = await fetchPage(
      path.endsWith(".html") ? path : `${path}.html`
    );
    content.innerHTML = html;
    document.title = fallbackTitle;
  } catch (err) {
    console.error(`Falha ao carregar gateway ${type}:`, err);
    content.innerHTML = `<h1>${fallbackTitle}</h1>`;
    document.title = fallbackTitle;
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
      background: "rgba(0,0,0,1)",
      zIndex: "9999",
      color: "#fff",
      fontFamily: "sans-serif",
      fontSize: "1.2rem",
      textAlign: "center",
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
// Páginas de erro pré-definidas
// ------------------------------
export async function show404() {
  history.pushState({}, "", "/404");
  await loadGateway("error404", "404 - Página não encontrada");
}

export async function show500() {
  history.pushState({}, "", "/500");
  await loadGateway("error500", "500 - Erro interno");
}

export async function showOffline() {
  history.pushState({}, "", "/offline");
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
    // Atualiza URL sem #
    if (location.pathname !== path) history.pushState({}, "", path);

    const html = await fetchPage(
      flowRoute.page.endsWith(".html")
        ? flowRoute.page
        : `${flowRoute.page}.html`
    );
    content.innerHTML = html;
    document.title = flowRoute.title || "Flow Page";
  } catch (err) {
    console.error("Falha ao carregar flow:", err);
    content.innerHTML = `<h1>Erro ao carregar flow</h1>`;
    document.title = "Erro Flow";
  } finally {
    hidePageLoad();
  }
}

// ------------------------------
// Tratamento do botão voltar/avançar
// ------------------------------
window.addEventListener("popstate", () => {
  const path = location.pathname;

  const flowRoute = gateway.flows.find((f) => f.path.test(path));
  if (flowRoute) {
    loadFlow(path);
  } else {
    handleRoute(path);
  }
});
