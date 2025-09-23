// src/modules/pwa.js
import { mobile } from "../main.js";

let deferredPrompt = null;

// ------------------------------
// Registra o Service Worker
// ------------------------------
export function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js", {
          type: "module",
        });
        console.log("SW registrado!", reg);
      } catch (err) {
        console.error("Falha ao registrar SW:", err);
      }
    });
  }
}

// ------------------------------
// Configura botão de instalação PWA
// ------------------------------
export function setupInstallButton() {
  const installBtn = document.getElementById(mobile.classInstall);
  if (!installBtn) return;

  installBtn.style.display = "inline-block"; // sempre visível

  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isInStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true;

  // iOS Safari → instruções manuais
  if (isIos && !isInStandalone) {
    installBtn.textContent = "Adicionar à Tela Inicial";
    installBtn.onclick = () => alert(mobile.alertIphone);
    return;
  }

  // Captura evento beforeinstallprompt (Android/Chrome/Edge)
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log("Evento beforeinstallprompt capturado!");
  });

  // Se já instalado → botão vira 'Atualizar'
  if (isInStandalone) {
    installBtn.textContent = "Atualizar App";
    installBtn.onclick = () => location.reload();
    return;
  }

  // Clique no botão
  installBtn.addEventListener("click", async () => {
    if (!deferredPrompt) {
      alert(mobile.alertDesktop);
      return;
    }

    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;

    if (choice.outcome === "accepted") {
      console.log("Usuário aceitou instalar o app!");
    } else {
      console.log("Usuário cancelou a instalação do app.");
    }

    deferredPrompt = null;
  });

  // Evento app instalado
  window.addEventListener("appinstalled", () => {
    console.log("App instalado!");
    if (installBtn) {
      installBtn.textContent = "Atualizar App";
      installBtn.onclick = () => location.reload();
    }
  });
}

// ------------------------------
// Inicializa automaticamente
// ------------------------------
registerServiceWorker();
setupInstallButton();

// Compatibilidade com outros módulos
window.setupInstallButton = setupInstallButton;
