// pwa.js
let deferredPrompt = null;

export function setupInstallButton() {
  const installBtn = document.getElementById("install-btn");
  if (!installBtn) return;

  installBtn.style.display = "inline-block";

  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isInStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true;

  // iOS: instruções (não tem beforeinstallprompt)
  if (isIos && !isInStandalone) {
    installBtn.textContent = "Adicionar à Tela Inicial";
    installBtn.onclick = () => {
      alert(
        "No iPhone/iPad:\n\n1. Toque em 'Compartilhar' (ícone quadrado com seta).\n2. Escolha 'Adicionar à Tela de Início'."
      );
    };
    return;
  }

  // PWA prompt suportado
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    // manter botão visível
  });

  // Se já estiver rodando standalone -> atualizar
  if (isInStandalone) {
    installBtn.textContent = "Atualizar App";
    installBtn.onclick = () => location.reload(true);
    return;
  }

  // Clique botão
  installBtn.addEventListener("click", async () => {
    // se não há prompt guardado: fallback desktop manual
    if (!deferredPrompt) {
      alert(
        "Para criar um atalho do app no desktop:\n\n" +
          "1. Abra o navegador no site.\n" +
          "2. Abra o menu do navegador (três pontos).\n" +
          "3. Procure 'Instalar' ou 'Adicionar à Tela de Início'.\n" +
          "4. Siga as instruções."
      );
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

  window.addEventListener("appinstalled", () => {
    console.log("App instalado!");
    if (installBtn) {
      installBtn.textContent = "Atualizar App";
      installBtn.onclick = () => location.reload(true);
    }
  });
}

// Expor global (compatibilidade com framework/components)
window.setupInstallButton = setupInstallButton;
