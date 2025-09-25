// pwa.js
import { mobile } from "../main.js";

/**
 * Registra o Service Worker (PWA base)
 */
export function registerServiceWorker(swPath = "/sw.js") {
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register(swPath, { type: "module" })
      .then((reg) => console.log("[PWA] Service Worker registrado:", reg))
      .catch((err) => console.error("[PWA] Falha ao registrar SW:", err));
  });
}

let deferredPrompt = null;

// ------------------------------
// Detecta se PWA já está instalado
// ------------------------------
function isInstalled() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

// ------------------------------
// Setup botão de instalação
// ------------------------------
export function setupInstallButton() {
  const btn = document.getElementById("btn-install");
  if (!btn) return;

  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const installed = isInstalled();

  btn.style.display = "inline-block";

  // Já instalado → botão vira atualizar
  if (installed) {
    btn.textContent = "Atualizar App";
    btn.onclick = () => location.reload();
    return;
  }

  // iOS → instruções manuais
  if (isIos) {
    btn.textContent = "Adicionar à Tela Inicial";
    btn.onclick = () =>
      alert(
        mobile?.alertIphone ||
          "Toque no botão Compartilhar e depois em 'Adicionar à Tela Inicial'."
      );
    return;
  }

  // Captura evento beforeinstallprompt (Chrome, Edge, Opera)
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault(); // evita prompt automático
    deferredPrompt = e;
    btn.textContent = "Instalar App";
  });

  // Clique no botão de instalação
  btn.addEventListener("click", async () => {
    if (deferredPrompt) {
      // Instalação nativa suportada
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        console.log("App instalado via prompt!");
        btn.textContent = "Atualizar App";
        btn.onclick = () => location.reload();
      } else {
        console.log("Usuário cancelou instalação.");
      }
      deferredPrompt = null;
    } else {
      // Tenta criar atalho automático no desktop (Chrome, Edge)
      if ("launchQueue" in window || navigator.canShare) {
        try {
          // fallback de atalho via link temporário
          const a = document.createElement("a");
          a.href = window.location.href;
          a.rel = "shortcut icon";
          a.click();
          btn.textContent = "App Adicionado!";
          return;
        } catch (err) {
          console.warn("Falha ao criar atalho automático:", err);
        }
      }

      // fallback geral → instrução manual
      alert(
        mobile?.alertDesktop ||
          "Seu navegador não suporta instalação automática. Crie um atalho manualmente."
      );
    }
  });

  // Evento app instalado
  window.addEventListener("appinstalled", () => {
    console.log("App instalado!");
    btn.textContent = "Atualizar App";
    btn.onclick = () => location.reload();
  });
}

// compatibilidade global
window.setupInstallButton = setupInstallButton;
