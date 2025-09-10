import { handleRoute } from "./route.js";
import { enableSwipeNavigation } from "./mobile.js";
import { lazyLoadRoute } from "./optimize.js";

export const config = {
  dirs: {
    layouts: "./components/layouts",
    models: "./components/models",
  },
  pages: {
    error404: "./pages/gateway/404",
    fallback: "./pages/gateway/offline",
    loading: "./pages/gateway/loading",
    login: "./pages/gateway/login",
    signup: "./pages/gateway/signup",
    terms: "./pages/gateway/terms",
    policy: "./pages/gateway/policy",
  },
  useChildren: true,
  defaultChild: "/Init",
  persistentChild: null,
};

export const routes = [
  { path: /^\/$/, page: "./site/site" },
  { path: /^\/Home$/, page: "./app/Home/home" },
];

export const childrenRoutes = [
  { path: /^\/Init$/, page: "./app/routes/Init/init" },
  { path: /^\/Botoes$/, page: "./app/routes/Buttons/buttons" },
  { path: /^\/Fundos$/, page: "./app/routes/Background/background" },
  { path: /^\/Anotacoes$/, page: "./app/routes/Note/note" },
  { path: /^\/Sobre$/, page: "./app/routes/About/about" },
  { path: /^\/Contato$/, page: "./app/routes/Contact/contact" },
];

document.addEventListener("DOMContentLoaded", () => {
  handleRoute(location.hash.slice(1) || "/");

  enableSwipeNavigation({
    enabled: false,
    left: "#/Botoes",
    right: "#/Fundos",
    up: "#/Sobre",
    down: "#/Contato",
    threshold: 40,
  });

  document.addEventListener("spa:pageLoaded", () => {
    lazyLoadRoute(location.hash);
  });
});
