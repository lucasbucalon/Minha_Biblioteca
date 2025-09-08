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

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    window.deferredPrompt = e; // guarda evento para usar depois
  });

  installBtn.addEventListener("click", async () => {
    if (!window.deferredPrompt) {
      alert(
        "Não é possível instalar o app agora. Talvez já esteja instalado ou seu navegador não suporta PWA."
      );
      return;
    }

    window.deferredPrompt.prompt(); // mostra prompt de instalação
    const choice = await window.deferredPrompt.userChoice;
    if (choice.outcome === "dismissed") {
      alert("Você cancelou a instalação do app.");
    }
    window.deferredPrompt = null;
  });
};
let deferredPrompt;

const installBtn = document.getElementById("install-btn");

// Sempre mostra o botão
installBtn.style.display = "inline-block";

// Armazena o evento de instalação se o navegador permitir
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
});

installBtn.addEventListener("click", async () => {
  // Mostra o prompt de instalação
  deferredPrompt.prompt();

  const choice = await deferredPrompt.userChoice;
  if (choice.outcome === "accepted") {
    console.log("Usuário aceitou instalar o app!");
  } else {
    alert("Você cancelou a instalação do app.");
  }

  deferredPrompt = null; // limpa o evento
});
