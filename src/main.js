import { handleRoute } from "../modules/route.js";
import { enableSwipeNavigation } from "../modules/mobile.js";
import { lazyLoadRoute } from "../modules/optimize.js";
import { configureSheet } from "../modules/sheet.js"; // sheet.js atualizado

export const imageMap = {
  logo: {
    src: "../constant/image/Frame.png",
    alt: "imagem da logo",
    // -> opcionais
    fetchpriority: "high", // "high" | "low" padrão "low"
    dark: "../constant/image/Frame.png",
    set: {
      src: "../constant/image/Framee.png",
      Dark: "../constant/image/Framee.png",
      maxWidth: 768, // número
      // minWidth: 768, // número
    },
  },
};

export const linkMap = {
  curriculo: "../constant/pdf/Curriculo.pdf",
};

export const iconMap = {
  icon: "../constant/svg/icon.svg",
};

// ---------- Configurações de animação ----------
export const animated = {
  scroll: {
    enabled: true, // ativa smooth scroll
    mode: "smooth", // "original" | "smooth" | "heavy" | "custom"
    custom: {
      ease: 0.4, // 0.05 = pesado, 0.4 = leve
      stepMin: 1, // velocidade mínima px/frame
      stepMax: 60, // velocidade máxima px/frame
    },
  },
  fade: {
    enabled: true, // ativa fade
    duration: 250, // duração em ms
    useTranslate: false, // aplica translateY junto
    translateValue: "1px", // valor do translate
  },
};

// ---------- Configurações gerais ----------
export const config = {
  dirs: {
    layouts: "../components/layouts",
    models: "../components/models",
  },
  useChildren: true,
  persistentChild: null,
  defaultChild: "/Init",
  dirsChild: "../app/Home/home",
};

export const gateway = {
  error: {
    error404: "./app/pages/error/404",
    error500: "./app/pages/error/500",
    errorOffline: "./app/pages/error/offline",
  },
  load: {
    pageLoad: "./app/pages/loads/pageLoad",
    loading: "./app/pages/loads/loading",
    loadTime: 1000,
  },
  flows: [
    { path: /^\/Politicas$/, page: "./app/pages/flows/politicas" },
    { path: /^\/Informacoes$/, page: "./app/pages/flows/informacoes" },
  ],
};

// ---------- Rotas ----------
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

// ---------- Configurações mobile ----------
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
// ---------- Inicialização ----------
document.addEventListener("DOMContentLoaded", () => {
  // Inicializa sheet.js com configs (scroll + fade)
  configureSheet(animated);

  // Inicializa rotas SPA
  handleRoute(location.hash.slice(1) || "/");

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
    lazyLoadRoute(location.hash);
  });

  console.log("Main.js initialized: animated config", animated);
});
