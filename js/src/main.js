// main.js
import { lazyLoadRoute } from "./optimize.js";
import { enableSwipeNavigation } from "./mobile.js";
import { handleRoute } from "./route.js";

// ------------------------------
// Configuração global do App
// ------------------------------
export const config = {
  componentsDir: "components/layouts", // pasta onde ficam os components
  frameworkDir: "components/models", // pasta onde ficam utilitários/framework
  pages: {
    error404: "pages/off/404", // rota de erro
    fallback: "pages/off/offline", // rota de fallback offline
    loading: "pages/off/load", // tela de carregamento
  },
};

// ------------------------------
// Definição das Rotas
// ------------------------------
export const routes = [
  { path: /^\/$/, page: "routes/Home/home" },
  { path: /^\/Botoes$/, page: "routes/Buttons/buttons" },
  { path: /^\/Fundos$/, page: "routes/Background/background" },
  { path: /^\/Anotacoes$/, page: "routes/Note/note" },
  { path: /^\/Sobre$/, page: "routes/About/about" },
  { path: /^\/Contato$/, page: "routes/Contact/contact" },

  // especiais
  { path: /^\/404$/, page: config.pages.error404 },
  { path: /^\/fallback$/, page: config.pages.fallback },
  { path: /^\/load$/, page: config.pages.loading },
];

// ------------------------------
// Inicialização SPA
// ------------------------------
document.addEventListener("DOMContentLoaded", () => {
  // Rota inicial
  handleRoute(location.hash.slice(1) || "/");

  // Ativar navegação por swipe
  enableSwipeNavigation({
    enabled: false,
    left: "#/Botoes",
    right: "#/Fundos",
    up: "#/Sobre",
    down: "#/Contato",
    threshold: 40,
  });

  // Lazy load universal
  document.addEventListener("spa:pageLoaded", () => {
    lazyLoadRoute(location.hash);
  });
});
