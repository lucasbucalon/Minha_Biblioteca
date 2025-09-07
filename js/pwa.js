// pwa.js

// Registra o Service Worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/sw.js")
    .then(() => console.log("Service Worker registrado com sucesso!"))
    .catch((err) => console.error("Falha ao registrar SW:", err));
}

// ------------------------------
// Configura botão de instalação PWA
// ------------------------------
window.setupInstallButton = () => {
  const installBtn = document.getElementById("install-btn");
  if (!installBtn) return;

  installBtn.style.display = "inline-block"; // sempre visível

  let deferredPrompt;

  // Armazena evento de instalação se suportado
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
  });

  installBtn.addEventListener("click", async () => {
    const isDesktop = !/Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (!isDesktop) {
      alert("Esta ação é apenas para desktop.");
      return;
    }

    if (!deferredPrompt) {
      alert(
        "Não é possível instalar o app agora. Talvez já esteja instalado ou seu navegador não suporte PWA."
      );
      return;
    }

    // Mostra o prompt de instalação
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;

    if (choice.outcome === "accepted") {
      alert("Atalho do app criado no seu desktop!");
    } else {
      alert("Você cancelou a instalação do app.");
    }

    deferredPrompt = null; // limpa referência
  });
};

// Inicializa a configuração assim que o DOM estiver pronto
document.addEventListener("DOMContentLoaded", () => {
  window.setupInstallButton();
});
