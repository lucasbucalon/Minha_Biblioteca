// gateways.js
import { config } from "../src/main.js";
import { fetchPage } from "./children.js";

const content = document.getElementById("route");

// ------------------------------
// Função genérica para carregar qualquer página de gateway
// ------------------------------
async function loadGateway(type, fallbackText = "Erro") {
  const path = config.gateway?.[type];
  if (!path) {
    console.error(`config.gateway.${type} não configurado`);
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
// PageLoad full-screen
// ------------------------------
export async function showPageLoad() {
  if (!config.gateway?.pageLoad) return;

  // cria overlay se não existir
  let loader = document.getElementById("pageLoad");
  if (!loader) {
    loader = document.createElement("div");
    loader.id = "pageLoad";

    document.body.appendChild(loader);
  }

  loader.style.display = "flex";

  try {
    const html = await fetchPage(
      config.gateway.pageLoad.endsWith(".html")
        ? config.gateway.pageLoad
        : `${config.gateway.pageLoad}.html`
    );
    loader.innerHTML = html;
  } catch (err) {
    console.error("Falha ao carregar pageLoad:", err);
    loader.innerHTML = "Carregando…";
  }
}

// ------------------------------
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
  await loadGateway("error404", "404 - Página não encontrada");
}

export async function show500() {
  await loadGateway("error500", "500 - Erro interno");
}

export async function showOffline() {
  await loadGateway("errorOffline", "Sem conexão");
}
