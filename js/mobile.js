// swipeNavigation.js
export function enableSwipeNavigation(options = {}) {
  const config = {
    enabled: options.enabled ?? true, // true = ativa, false = desativa
    up: options.up ?? "#/",
    down: options.down ?? "#/",
    left: options.left ?? "#/",
    right: options.right ?? "#/",
    threshold: options.threshold ?? 50, // distância mínima em px para considerar swipe
  };

  let startX = 0;
  let startY = 0;

  function onTouchStart(e) {
    const touch = e.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
  }

  function onTouchEnd(e) {
    const touch = e.changedTouches[0];
    const dx = touch.clientX - startX;
    const dy = touch.clientY - startY;

    // Se swipe é menor que threshold, ignora
    if (Math.abs(dx) < config.threshold && Math.abs(dy) < config.threshold)
      return;

    // Se swipe está desativado, apenas cancela qualquer ação
    if (!config.enabled) return;

    // Horizontal
    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0) location.hash = config.right; // swipe para direita
      else location.hash = config.left; // swipe para esquerda
    }
    // Vertical
    else {
      if (dy > 0) location.hash = config.down; // swipe para baixo
      else location.hash = config.up; // swipe para cima
    }
  }

  document.addEventListener("touchstart", onTouchStart, { passive: true });
  document.addEventListener("touchend", onTouchEnd, { passive: true });
}
