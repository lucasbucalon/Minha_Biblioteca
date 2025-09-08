// pwa.js

// Registra o Service Worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/sw.js")
    .then(() => console.log("Service Worker registrado com sucesso!"))
    .catch((err) => console.error("Falha ao registrar SW:", err));
}

// pwa.js
let deferredPrompt = null;

window.setupInstallButton = () => {
  const installBtn = document.getElementById("install-btn");
  if (!installBtn) return;

  installBtn.style.display = "inline-block";

  // 1 - Detectar iOS (não suporta beforeinstallprompt)
  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isInStandalone = window.matchMedia(
    "(display-mode: standalone)"
  ).matches;

  if (isIos && !isInStandalone) {
    installBtn.textContent = "Adicionar à Tela Inicial";
    installBtn.onclick = () => {
      alert(
        "No iPhone/iPad:\n\n1. Toque em 'Compartilhar' (ícone quadrado com seta).\n2. Escolha 'Adicionar à Tela de Início'."
      );
    };
    return; // encerra aqui para iOS
  }

  // 2 - Guardar evento para Android/desktop compatível
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
  });

  // 3 - Se já está instalado → botão vira "Atualizar"
  if (isInStandalone) {
    installBtn.textContent = "Atualizar App";
    installBtn.onclick = () => {
      location.reload(true); // força buscar versão nova
    };
    return;
  }

  // 4 - Clique no botão
  installBtn.addEventListener("click", async () => {
    if (!deferredPrompt) {
      // Se for desktop sem suporte
      if (!/Android/i.test(navigator.userAgent)) {
        alert(
          "Para criar um atalho do app no desktop:\n\n" +
            "1. Abra o navegador no site.\n" +
            "2. Clique no menu (três pontos).\n" +
            "3. Procure 'Instalar' ou 'Adicionar à tela inicial'.\n" +
            "4. Siga as instruções."
        );
      } else {
        alert(
          "Não é possível instalar agora. Talvez já esteja instalado ou o navegador não suporta PWA."
        );
      }
      return;
    }

    // Dispara prompt oficial
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;

    if (choice.outcome === "accepted") {
      console.log("Usuário aceitou instalar o app!");
    } else {
      alert("Você cancelou a instalação do app.");
    }

    deferredPrompt = null;
  });

  // 5 - Quando instalação completar
  window.addEventListener("appinstalled", () => {
    console.log("App instalado!");
    installBtn.textContent = "Atualizar App";
    installBtn.onclick = () => location.reload(true);
  });
};
