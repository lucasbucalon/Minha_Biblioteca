// swipeNavigation.js

/**
 * Habilita navegação por swipe no mobile.
 * @param {Object} options - Configurações do swipe
 * @param {boolean} options.enabled - Ativa ou desativa o swipe (default: true)
 * @param {string} options.left - URL ao arrastar para a esquerda (default: "#/")
 * @param {string} options.right - URL ao arrastar para a direita (default: "#/")
 * @param {string} options.up - URL ao arrastar para cima (default: "#/")
 * @param {string} options.down - URL ao arrastar para baixo (default: "#/")
 * @param {number} options.threshold - Distância mínima em pixels para ativar swipe (default: 50)
 */
export function enableSwipeNavigation(options = {}) {
  const config = {
    enabled: options.enabled ?? true,
    left: options.left ?? "#/",
    right: options.right ?? "#/",
    up: options.up ?? "#/",
    down: options.down ?? "#/",
    threshold: options.threshold ?? 50,
  };

  if (!config.enabled) return;

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

    // Detecta swipe horizontal
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > config.threshold) {
      if (dx > 0) location.hash = config.right; // swipe para a direita
      else location.hash = config.left; // swipe para a esquerda
    }
    // Detecta swipe vertical
    else if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > config.threshold) {
      if (dy > 0) location.hash = config.down; // swipe para baixo
      else location.hash = config.up; // swipe para cima
    }
  }

  document.addEventListener("touchstart", onTouchStart, { passive: true });
  document.addEventListener("touchend", onTouchEnd, { passive: true });
}
