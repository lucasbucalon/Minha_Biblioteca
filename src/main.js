import { handleRoute } from "../modules/route.js"; // carregar rotas
import { enableSwipeNavigation } from "../modules/mobile.js";
import { lazyLoadRoute } from "../modules/optimize.js";

export const animated = {
  scroll: {
    enable: true, // true = ativa smooth scroll, false = scroll normal
    speed: 0.1, // menor = mais suave, maior = mais rápido (0.05 ~ 0.2)
  },
  fade: {
    enabled: true, // true = ativa, false = desativa
    duration: 250, // duração em ms
    useTranslate: true, // true = aplica translateY, false = só opacity
    translateValue: "1px", // valor do translate (quando ativo)
  },
};

export const config = {
  dirs: {
    layouts: "../components/layouts",
    models: "../components/models",
  },
  pages: {
    error404: "../pages/gateway/404",
    fallback: "../pages/gateway/offline",
    loading: "../pages/gateway/loading",
    login: "../pages/gateway/login",
    signup: "../pages/gateway/signup",
    terms: "../pages/gateway/terms",
    policy: "../pages/gateway/policy",
  },
  useChildren: true,
  persistentChild: null,
  defaultChild: "/Init",
  dirsChild: "../app/Home/home",
};

export const routes = [
  { path: /^\/$/, page: "../site/site" },
  { path: /^\/Home$/, page: config.dirsChild },
];

export const childrenRoutes = [
  { path: /^\/Init$/, page: "../app/routes/Init/init" },
  { path: /^\/Botoes$/, page: "../app/routes/Buttons/buttons" },
  { path: /^\/Fundos$/, page: "../app/routes/Background/background" },
  { path: /^\/Anotacoes$/, page: "../app/routes/Note/note" },
  { path: /^\/Sobre$/, page: "../app/routes/About/about" },
  { path: /^\/Contato$/, page: "../app/routes/Contact/contact" },
];

export const mobile = {
  classInstall: "install-btn",
  alertIphone:
    "No iPhone/iPad:\n\n" +
    "1. Toque em 'Compartilhar' (ícone quadrado com seta).\n" +
    "2. Escolha 'Adicionar à Tela de Início'.",
  alertDesktop:
    "Seu Dispositivo desktop não suporta instalação deste App.\n" +
    "Para instalar, siga as instruções:\n\n" +
    "1. Abra o navegador no site.\n" +
    "2. Abra o menu do navegador (três pontos).\n" +
    "3. Procure 'Instalar' ou 'Adicionar à Tela de Início'.\n" +
    "4. Siga as instruções.",
};

document.addEventListener("DOMContentLoaded", () => {
  handleRoute(location.hash.slice(1) || "/");

  enableSwipeNavigation({
    enabled: false,
    left: "/Botoes",
    right: "/Fundos",
    up: "/Sobre",
    down: "/Contato",
    threshold: 40,
  });

  document.addEventListener("spa:pageLoaded", () => {
    lazyLoadRoute(location.hash);
  });
});
