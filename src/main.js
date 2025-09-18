// src/main.js

// ---------- Imports de módulos ----------
import { handleRoute } from "./modules/route.js";
import { enableSwipeNavigation } from "./modules/mobile.js";
import { lazyLoadRoute } from "./modules/optimize.js";
import { configureSheet } from "./modules/sheet.js"; // atualizado
import { initAssets } from "./modules/utils.js";
initAssets();

// opcional: importe utilitários extras que antes estavam no index.html
import "./modules/localstorage.js";
import "./modules/gateways.js";
import "./modules/children.js";
import "./modules/layouts.js";
import "./modules/models.js";
import "./modules/pwa.js";
import "./modules/meta.js";

// ---------- Mapas de recursos ----------
export const imageMap = {
  logo: {
    src: "/constant/image/Frame.png",
    alt: "imagem da logo",
    title: "Lucas Bucalon",
    fetchpriority: "high",
    dark: "/constant/image/Frame.png",
    set: {
      src: "/constant/image/Frame.png",
      Dark: "/constant/image/Frame.png",
      maxWidth: 768,
    },
  },
};

export const linkMap = {
  curriculo: {
    href: "/constant/pdf/Curriculo.pdf",
    download: false,
    type: "application/pdf",
    title: "Currículo",
    "aria-label": "Currículo em PDF",
  },
};

export const iconMap = {
  icon: {
    src: "/constant/svg/icon.svg",
    alt: "icon",
    title: "icon",
  },
};

// ---------- Configurações de animação ----------
export const animated = {
  scroll: {
    enabled: true,
    mode: "smooth",
    custom: { ease: 0.4, stepMin: 1, stepMax: 60 },
  },
  fade: {
    enabled: true,
    duration: 250,
    useTranslate: false,
    translateValue: "1px",
  },
};

// ---------- Configurações gerais ----------
export const config = {
  dirs: {
    layouts: "/components/layouts",
    models: "/components/models",
  },
  useChildren: true,
  persistentChild: null,
  defaultChild: "/Init",
  dirsChild: "/app/Home/home",
};

// ---------- Configurações de gateway ----------
export const gateway = {
  error: {
    error404: "/app/pages/error/404",
    error500: "/app/pages/error/500",
    errorOffline: "/app/pages/error/offline",
  },
  load: {
    pageLoad: "/app/pages/loads/pageLoad",
    loading: "/app/pages/loads/loading",
    loadTime: 1000,
  },
  flows: [
    { path: /^\/Politicas$/, page: "/app/pages/flows/politicas" },
    { path: /^\/Informacoes$/, page: "/app/pages/flows/informacoes" },
  ],
};

// ---------- Rotas ----------
export const routes = [
  { path: /^\/$/, page: "/app/site/site" },
  { path: /^\/Home$/, page: config.dirsChild },
];

export const childrenRoutes = [
  { path: /^\/Init$/, page: "/app/routes/Init/init" },
  { path: /^\/Botoes$/, page: "/app/routes/Buttons/buttons" },
  { path: /^\/Fundos$/, page: "/app/routes/Background/background" },
  { path: /^\/Anotacoes$/, page: "/app/routes/Note/note" },
  { path: /^\/Sobre$/, page: "/app/routes/About/about" },
  { path: /^\/Contato$/, page: "/app/routes/Contact/contact" },
];

// ---------- Configurações mobile ----------
export const mobile = {
  classInstall: "install-btn",
  alertIphone:
    "No iPhone/iPad:\n\n" +
    "1. Toque em 'Compartilhar' (ícone quadrado com seta).\n" +
    "2. Escolha 'Adicionar à Tela de Início'.",
  alertDesktop:
    "Seu dispositivo desktop não suporta instalação deste App.\n" +
    "Para instalar, siga as instruções:\n\n" +
    "1. Abra o navegador no site.\n" +
    "2. Abra o menu do navegador (três pontos).\n" +
    "3. Procure 'Instalar' ou 'Adicionar à Tela de Início'.\n" +
    "4. Siga as instruções.",
};

// ---------- Inicialização ----------
document.addEventListener("DOMContentLoaded", () => {
  // Inicializa sheet.js com configs (scroll + fade)
  configureSheet(animated);

  // Inicializa rotas SPA
  handleRoute(location.pathname || "/");

  // Swipe navigation mobile
  enableSwipeNavigation({
    enabled: false,
    left: "/Botoes",
    right: "/Fundos",
    up: "/Sobre",
    down: "/Contato",
    threshold: 40,
  });

  // Lazy load das rotas
  document.addEventListener("spa:pageLoaded", () => {
    lazyLoadRoute(location.pathname);
  });

  console.log("Main.js initialized: animated config", animated);
});
