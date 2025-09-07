// main.js
import { lazyLoadRoute } from "./optimize.js";
import { enableSwipeNavigation } from "./mobile.js";
import { handleRoute } from "./route.js";

// ------------------------------
// Rotas do SPA
// ------------------------------
export const routes = [
  { path: /^\/$/, page: "pages/Home/home" },
  { path: /^\/Botoes$/, page: "pages/Buttons/buttons" },
  { path: /^\/Fundos$/, page: "pages/Background/background" },
  { path: /^\/Anotacoes$/, page: "pages/Note/note" },
  { path: /^\/Sobre$/, page: "pages/About/about" },
  { path: /^\/Contato$/, page: "pages/Contact/contact" },
];

// ------------------------------
// Inicialização do SPA
// ------------------------------
document.addEventListener("DOMContentLoaded", () => {
  // Carrega a rota inicial
  handleRoute(location.hash.slice(1) || "/");

  // Ativa navegação por swipe
  enableSwipeNavigation({
    enabled: true,
    left: "#/Botoes",
    right: "#/Fundos",
    up: "#/",
    down: "#/",
    threshold: 100,
  });

  // Lazy load sempre que a página SPA terminar de carregar
  document.addEventListener("spa:pageLoaded", () => {
    lazyLoadRoute(location.hash);
  });
});
