import { lazyLoadRoute } from "./optimize.js";
import { enableSwipeNavigation } from "./swipeNavigation.js";

// Ativa navegação por swipe
enableSwipeNavigation({
  enabled: true, // true = ativa, false = desativa
  left: "#/Botoes",
  right: "#/Fundos",
  up: "#/Sobre",
  down: "#/Contato",
  threshold: 40, // opcional, distância mínima em pixels
});

// Evento SPA
document.addEventListener("spa:pageLoaded", () => {
  lazyLoadRoute(location.hash);
});

// Rotas
export const routes = [
  { path: /^\/$/, page: "pages/Home/home" },
  { path: /^\/Botoes$/, page: "pages/Buttons/buttons" },
  { path: /^\/Fundos$/, page: "pages/Background/background" },
  { path: /^\/Anotacoes$/, page: "pages/Note/note" },
  { path: /^\/Sobre$/, page: "pages/About/about" },
  { path: /^\/Contato$/, page: "pages/Contact/contact" },
];
