// swipeNavigation.js
export function enableSwipeNavigation(options = {}) {
  const config = {
    enabled: options.enabled ?? true,
    up: options.up ?? null,
    down: options.down ?? null,
    left: options.left ?? null,
    right: options.right ?? null,
    threshold: options.threshold ?? 50,
  };

  if (!config.enabled) return;

  let startX = 0,
    startY = 0;
  function onTouchStart(e) {
    const t = e.touches[0];
    startX = t.clientX;
    startY = t.clientY;
  }
  function onTouchEnd(e) {
    const t = e.changedTouches[0];
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;
    // horizontal swipe
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > config.threshold) {
      if (dx > 0 && config.right) location.hash = config.right;
      else if (dx < 0 && config.left) location.hash = config.left;
    } else if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > config.threshold) {
      if (dy > 0 && config.down) location.hash = config.down;
      else if (dy < 0 && config.up) location.hash = config.up;
    }
  }
  document.addEventListener("touchstart", onTouchStart, { passive: true });
  document.addEventListener("touchend", onTouchEnd, { passive: true });
}
