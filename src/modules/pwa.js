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

// ------------------------------
// Detecta suporte à instalação
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

  // Se já estiver instalado, transforma botão em atualizar
  if (installed) {
    btn.textContent = "Atualizar App";
    btn.onclick = () => location.reload();
    btn.style.display = "inline-block";
    return;
  }

  btn.style.display = "none"; // inicialmente oculto

  // ------------------------------
  // iOS -> instruções manuais
  // ------------------------------
  if (isIos) {
    btn.style.display = "inline-block";
    btn.textContent = "Adicionar à Tela Inicial";
    btn.onclick = () =>
      alert(
        mobile?.alertIphone ||
          "Toque no botão Compartilhar e depois em 'Adicionar à Tela Inicial'."
      );
    return;
  }

  // ------------------------------
  // Captura evento beforeinstallprompt
  // ------------------------------
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault(); // evita prompt automático
    deferredPrompt = e;
    btn.style.display = "inline-block";
    btn.textContent = "Instalar App";
  });

  // ------------------------------
  // Clique no botão de instalação
  // ------------------------------
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
      // fallback: não há suporte nativo
      alert(
        mobile?.alertDesktop ||
          "Seu navegador não suporta instalação automática. Crie um atalho manualmente."
      );
    }
  });

  // ------------------------------
  // Evento app instalado
  // ------------------------------
  window.addEventListener("appinstalled", () => {
    console.log("App instalado!");
    btn.textContent = "Atualizar App";
    btn.onclick = () => location.reload();
    btn.style.display = "inline-block";
  });
}

// // ------------------------------
// // Função de setup do botão de instalação
// // ------------------------------
// export function setupInstallButton() {
//   const installBtn = document.getElementById(`${mobile.classInstall}`);
//   if (!installBtn) return;

//   installBtn.style.display = "inline-block";

//   const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
//   const isInStandalone =
//     window.matchMedia("(display-mode: standalone)").matches ||
//     window.navigator.standalone === true;

//   // ------------------------------
//   // iOS Safari → instruções manuais
//   // ------------------------------
//   if (isIos && !isInStandalone) {
//     installBtn.textContent = "Adicionar à Tela Inicial";
//     installBtn.onclick = () => {
//       alert(mobile.alertIphone); // instrução manual
//     };
//     return;
//   }

//   // ------------------------------
//   // Captura evento beforeinstallprompt (Android/Chrome/Edge)
//   // ------------------------------
//   window.addEventListener("beforeinstallprompt", (e) => {
//     e.preventDefault();
//     deferredPrompt = e;
//     console.log("Evento beforeinstallprompt capturado!");
//   });

//   // ------------------------------
//   // Se já estiver instalado → botão vira 'Atualizar'
//   // ------------------------------
//   if (isInStandalone) {
//     installBtn.textContent = "Atualizar App";
//     installBtn.onclick = () => location.reload(true);
//     return;
//   }

//   // ------------------------------
//   // Clique no botão de instalação
//   // ------------------------------
//   installBtn.addEventListener("click", async () => {
//     // 1. Tenta instalação nativa (Android/Chrome)
//     if (deferredPrompt) {
//       deferredPrompt.prompt();
//       const choice = await deferredPrompt.userChoice;

//       if (choice.outcome === "accepted") {
//         console.log("Usuário aceitou instalar o app!");
//         installBtn.textContent = "Atualizar App";
//       } else {
//         alert("Você cancelou a instalação do app.");
//       }

//       deferredPrompt = null;
//       return;
//     }

//     // 2. Fallback → instrução para criar atalho manual
//     alert(mobile.alertDesktop); // alert temporário, depois trocar por UI customizada
//   });

//   // ------------------------------
//   // Evento app instalado
//   // ------------------------------
//   window.addEventListener("appinstalled", () => {
//     console.log("App instalado!");
//     if (installBtn) {
//       installBtn.textContent = "Atualizar App";
//       installBtn.onclick = () => location.reload(true);
//     }
//   });
// }

// // ------------------------------
// // Compatibilidade global
// // ------------------------------
window.setupInstallButton = setupInstallButton;
