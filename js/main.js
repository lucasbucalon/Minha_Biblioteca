// main.js
import { lazyLoadRoute } from "./optimize.js";
import { enableSwipeNavigation } from "./mobile.js";
import { handleRoute } from "./route.js"; // função exportada de route.js

export const routes = [
  { path: /^\/$/, page: "pages/Home/home" },
  { path: /^\/Botoes$/, page: "pages/Buttons/buttons" },
  { path: /^\/Fundos$/, page: "pages/Background/background" },
  { path: /^\/Anotacoes$/, page: "pages/Note/note" },
  { path: /^\/Sobre$/, page: "pages/About/about" },
  { path: /^\/Contato$/, page: "pages/Contact/contact" },
];

// Rotas exportadas em arquivo próprio (routes.js) para evitar ciclo import
// main fica responsável por inicializações complementares

document.addEventListener("DOMContentLoaded", () => {
  // configura swipe (padrões — troque as hashes abaixo se quiser)
  enableSwipeNavigation({
    enabled: true,
    left: "#/Botoes",
    right: "#/Fundos",
    up: null, // desativa vertical
    down: null, // desativa vertical
    threshold: 40,
  });

  // Após cada carregamento spa, roda lazyLoadRoute
  document.addEventListener("spa:pageLoaded", () => {
    lazyLoadRoute(location.hash);
  });

  // garantir que a rota inicial seja processada (route.js já faz isso, mas manter redundância segura)
  handleRoute(location.hash.slice(1) || "/");
});
