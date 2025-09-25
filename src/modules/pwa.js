// pwa.js
import { mobile } from "../main.js";

let deferredPrompt = null;

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

/**
 * Configura o botão de instalação PWA
 */
export function setupInstallButton() {
  const installBtn = document.getElementById(mobile.classInstall);
  if (!installBtn) {
    // console.warn("[PWA] Botão de instalação não encontrado.");
    return;
  }

  installBtn.style.display = "inline-block";

  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isInStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true;

  // ------------------------------
  // iOS Safari → instalação manual
  // ------------------------------
  if (isIos && !isInStandalone) {
    installBtn.textContent = "Adicionar à Tela Inicial";
    installBtn.onclick = () => alert(mobile.alertIphone);
    return;
  }

  // ------------------------------
  // Evento capturado no Android/Chrome/Edge
  // ------------------------------
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log("[PWA] Evento beforeinstallprompt capturado!");
  });

  // ------------------------------
  // Caso o app já esteja instalado
  // ------------------------------
  if (isInStandalone) {
    installBtn.textContent = "Atualizar App";
    installBtn.onclick = () => location.reload(true);
    return;
  }

  // ------------------------------
  // Clique no botão de instalação
  // ------------------------------
  installBtn.addEventListener("click", async () => {
    if (!deferredPrompt) {
      alert(mobile.alertDesktop);
      return;
    }

    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;

    if (choice.outcome === "accepted") {
      console.log("[PWA] Usuário aceitou instalar o app!");
    } else {
      console.log("[PWA] Usuário recusou instalar o app.");
    }

    deferredPrompt = null;
  });

  // ------------------------------
  // Evento: app instalado
  // ------------------------------
  window.addEventListener("appinstalled", () => {
    console.log("[PWA] App instalado com sucesso!");
    if (installBtn) {
      installBtn.textContent = "Atualizar App";
      installBtn.onclick = () => location.reload(true);
    }
  });
}

// ------------------------------
// Inicialização automática
// ------------------------------
registerServiceWorker();
window.setupInstallButton = setupInstallButton; // compatibilidade global
