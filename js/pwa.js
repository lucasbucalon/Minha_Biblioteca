// pwa.js

// Registra o Service Worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/sw.js")
    .then(() => console.log("Service Worker registrado com sucesso!"))
    .catch((err) => console.error("Falha ao registrar SW:", err));
}

// pwa.js
window.setupInstallButton = () => {
  const installBtn = document.getElementById("install-btn");
  if (!installBtn) return;

  installBtn.style.display = "inline-block";

  let deferredPrompt;
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true;
  const isDesktop = !/Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  // Atualiza texto do botão se já instalado
  installBtn.textContent = isStandalone ? "Atualizar App" : "Baixar App";

  // Android / outros mobile que suportam beforeinstallprompt
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
  });

  installBtn.addEventListener("click", async () => {
    // Desktop
    if (isDesktop) {
      alert(
        "Para criar um atalho do app no desktop:\n\n" +
          "1. Abra o navegador no site.\n" +
          "2. Clique no menu do navegador (três pontos ou hambúrguer).\n" +
          "3. Procure 'Instalar' ou 'Adicionar à tela inicial'.\n" +
          "4. Siga as instruções para criar o atalho."
      );
      return;
    }

    // iOS
    if (isIOS) {
      alert(
        "Para instalar o app no iPhone/iPad:\n" +
          "1. Toque no botão de compartilhar.\n" +
          "2. Selecione 'Adicionar à Tela de Início'."
      );
      return;
    }

    // Mobile Android / PWA
    if (deferredPrompt) {
      // Se já estiver instalado, forçar atualização via SW
      if (isStandalone && "serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          registration.update();
          alert("App atualizado! Recarregando...");
          window.location.reload();
        }
        return;
      }

      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        alert("App instalado com sucesso!");
        installBtn.textContent = "Atualizar App";
      } else {
        alert("Você cancelou a instalação do app.");
      }
      deferredPrompt = null;
    } else {
      alert("Não é possível instalar o app agora. Talvez já esteja instalado.");
    }
  });
};

document.addEventListener("DOMContentLoaded", () => {
  window.setupInstallButton();
});
