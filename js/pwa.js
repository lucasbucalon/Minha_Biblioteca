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

  // Detecta evento de instalação PWA (mobile)
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e; // guarda para uso posterior
  });

  installBtn.addEventListener("click", async () => {
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isMobile) {
      // Mobile: dispara prompt de instalação PWA
      if (!deferredPrompt) {
        alert(
          "Para criar um atalho do app:\n\n" +
            "1. Abra o navegador no site.\n" +
            "2. Clique no menu do navegador (três pontos ou hambúrguer).\n" +
            "3. Procure 'Instalar' ou 'Adicionar à tela inicial'.\n" +
            "4. Siga as instruções para criar o atalho."
        );
        return;
      }

      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;

      if (choice.outcome === "accepted") {
        alert("Você instalou o app no seu dispositivo!");
      } else {
        alert("Você cancelou a instalação do app.");
      }

      deferredPrompt = null; // limpa referência
    } else {
      // Desktop: apenas instruções, pois navegadores não disparam prompt
      alert(
        "Para criar um atalho do app no desktop:\n\n" +
          "1. Abra o navegador no site.\n" +
          "2. Clique no menu do navegador (três pontos ou hambúrguer).\n" +
          "3. Procure 'Instalar' ou 'Adicionar à tela inicial'.\n" +
          "4. Siga as instruções para criar o atalho."
      );
    }
  });
};

// Inicializa a configuração quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", () => {
  window.setupInstallButton();
});
