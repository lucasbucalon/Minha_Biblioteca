// mobile.js
export function enableSwipeNavigation(options = {}) {
  const config = {
    enabled: options.enabled ?? true,
    up: options.up ?? null,
    down: options.down ?? null,
    left: options.left ?? null,
    right: options.right ?? null,
    threshold: options.threshold ?? 50,
    onSwipe: options.onSwipe ?? null,
  };

  if (!config.enabled) return;

  let startX = 0;
  let startY = 0;

  function onTouchStart(e) {
    const t = e.touches[0];
    startX = t.clientX;
    startY = t.clientY;
  }

  function onTouchEnd(e) {
    const t = e.changedTouches[0];
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;

    let direction = null;

    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > config.threshold) {
      direction = dx > 0 ? "right" : "left";
    } else if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > config.threshold) {
      direction = dy > 0 ? "down" : "up";
    }

    if (!direction) return;

    if (typeof config.onSwipe === "function") {
      config.onSwipe(direction);
      return;
    }

    switch (direction) {
      case "up":
        if (config.up) location.hash = config.up;
        break;
      case "down":
        if (config.down) location.hash = config.down;
        break;
      case "left":
        if (config.left) location.hash = config.left;
        break;
      case "right":
        if (config.right) location.hash = config.right;
        break;
    }
  }

  document.addEventListener("touchstart", onTouchStart, { passive: true });
  document.addEventListener("touchend", onTouchEnd, { passive: true });

  return () => {
    document.removeEventListener("touchstart", onTouchStart);
    document.removeEventListener("touchend", onTouchEnd);
  };
}
