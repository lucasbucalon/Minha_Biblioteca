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

// Verifica se o app já está instalado
function isInstalled() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

// Configura o botão de instalação
export function setupInstallButton(btnId = "btn-install") {
  const btn = document.getElementById(btnId);
  if (!btn) return;

  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const installed = isInstalled();

  // Se já instalado → transforma em atualizar
  if (installed) {
    btn.textContent = "Atualizar App";
    btn.style.display = "inline-block";
    btn.onclick = () => location.reload();
    return;
  }

  // iOS → instruções manuais
  if (isIos) {
    btn.textContent = "Adicionar à Tela Inicial";
    btn.style.display = "inline-block";
    btn.onclick = () =>
      alert("Toque no botão Compartilhar e depois 'Adicionar à Tela Inicial'.");
    return;
  }

  // Captura evento beforeinstallprompt (Chrome/Edge/Opera)
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault(); // evita prompt automático
    deferredPrompt = e;
    btn.textContent = "Instalar App";
    btn.style.display = "inline-block";
  });

  // Clique no botão
  btn.addEventListener("click", async () => {
    if (deferredPrompt) {
      // Prompt de instalação suportado
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;

      if (choice.outcome === "accepted") {
        console.log("Usuário aceitou instalar o app!");
        btn.textContent = "Atualizar App";
        btn.onclick = () => location.reload();
      } else {
        console.log("Usuário cancelou instalação.");
      }
      deferredPrompt = null;
    } else {
      // fallback → instrução manual
      alert(
        "Seu navegador não suporta instalação automática. Crie um atalho manualmente."
      );
    }
  });

  // Evento quando app é instalado
  window.addEventListener("appinstalled", () => {
    console.log("App instalado!");
    btn.textContent = "Atualizar App";
    btn.onclick = () => location.reload();
    btn.style.display = "inline-block";
  });
}

// Compatibilidade global
window.setupInstallButton = setupInstallButton;
