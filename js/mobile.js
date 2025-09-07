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

  if (!config.enabled) return; // se desativado, nem escuta

  let startX = 0;
  let startY = 0;

  function onTouchStart(e) {
    const touch = e.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
  }

  function onTouchEnd(e) {
    if (!config.enabled) return; // se desativado, ignora qualquer movimento

    const touch = e.changedTouches[0];
    const dx = touch.clientX - startX;
    const dy = touch.clientY - startY;

    // Horizontal
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > config.threshold) {
      if (dx > 0) location.hash = config.right; // swipe para direita
      else location.hash = config.left; // swipe para esquerda
    }
    // Vertical
    else if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > config.threshold) {
      if (dy > 0) location.hash = config.down; // swipe para baixo
      else location.hash = config.up; // swipe para cima
    }
  }

  document.addEventListener("touchstart", onTouchStart, { passive: true });
  document.addEventListener("touchend", onTouchEnd, { passive: true });
}
