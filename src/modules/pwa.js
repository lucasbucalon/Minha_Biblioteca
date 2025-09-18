// pwa.js
import { mobile } from "../main.js";
// Registra o Service Worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("../sw.js", { updateViaCache: "none" })
    .then(() => console.log("Service Worker registrado com sucesso!"))
    .catch((err) => console.error("Falha ao registrar SW:", err));
}

// pwa.js
let deferredPrompt = null;

export function setupInstallButton() {
  const installBtn = document.getElementById(`${mobile.classInstall}`);
  if (!installBtn) return;

  installBtn.style.display = "inline-block"; // sempre visível

  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isInStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true;

  // ------------------------------
  // iOS Safari -> instruções manuais
  // ------------------------------
  if (isIos && !isInStandalone) {
    installBtn.textContent = "Adicionar à Tela Inicial";
    installBtn.onclick = () => {
      alert(mobile.alertIphone);
    };
    return;
  }

  // ------------------------------
  // Evento capturado quando suportado (Android/Chrome/Edge)
  // ------------------------------
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log("Evento beforeinstallprompt capturado!");
  });

  // ------------------------------
  // Se já estiver instalado → botão vira 'Atualizar'
  // ------------------------------
  if (isInStandalone) {
    installBtn.textContent = "Atualizar App";
    installBtn.onclick = () => location.reload(true);
    return;
  }

  // ------------------------------
  // Clique no botão
  // ------------------------------
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
      alert("Você cancelou a instalação do app.");
    }

    deferredPrompt = null;
  });

  // ------------------------------
  // Evento app instalado
  // ------------------------------
  window.addEventListener("appinstalled", () => {
    console.log("App instalado!");
    if (installBtn) {
      installBtn.textContent = "Atualizar App";
      installBtn.onclick = () => location.reload(true);
    }
  });
}

// compatibilidade com outros módulos
window.setupInstallButton = setupInstallButton;
