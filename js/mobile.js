// swipeNavigation.js
export function enableSwipeNavigation(options = {}) {
  const config = {
    enabled: options.enabled ?? true,
    left: options.left ?? null, // null = sem ação
    right: options.right ?? null, // null = sem ação
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

    // Só considera swipe horizontal
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > config.threshold) {
      if (dx > 0 && config.right) location.hash = config.right; // swipe direita
      else if (dx < 0 && config.left) location.hash = config.left; // swipe esquerda
    }
    // Vertical (ignora totalmente)
  }

  document.addEventListener("touchstart", onTouchStart, { passive: true });
  document.addEventListener("touchend", onTouchEnd, { passive: true });
}
