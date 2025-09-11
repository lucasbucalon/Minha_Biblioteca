// sheet.js
// Smooth scroll (desktop), fade helpers e applyFade configurável
// Coloque este arquivo em /js/src/sheet.js e importe applyFade onde precisar.

import { animated } from "../src/main.js";

// ------------------------------
// Smooth Scroll (apenas desktop)
// ------------------------------

// sheet.js

// ------------------------------
// Smooth Scroll global (desktop + mobile)
// ------------------------------
// const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;

// if (!isTouchDevice) {
let current = 0;
let target = 0;
const speed = 0.05; // quanto menor, mais lento

function updateScroll() {
  current += (target - current) * speed;
  window.scrollTo(0, current);

  if (Math.abs(target - current) > 0.5) {
    requestAnimationFrame(updateScroll);
  }
}

function onWheel(e) {
  e.preventDefault();
  target += e.deltaY;
  target = Math.max(
    0,
    Math.min(target, document.body.scrollHeight - window.innerHeight)
  );
  requestAnimationFrame(updateScroll);
}

window.addEventListener("wheel", onWheel, { passive: false });
// }

// ------------------------------
// (restante do sheet.js continua igual, com fade e applyFade)
// ------------------------------

// Helpers básicos fadeIn / fadeOut
// ------------------------------
export function fadeOut(el, duration = 200, translate = "6px") {
  return new Promise((resolve) => {
    if (!el) return resolve();

    el.style.transition = `opacity ${duration}ms ease, transform ${duration}ms ease`;
    el.style.willChange = "opacity, transform";

    void el.offsetWidth; // força reflow

    el.style.opacity = "0";
    if (translate) el.style.transform = `translateY(${translate})`;

    setTimeout(() => resolve(), duration + 10);
  });
}

export function fadeIn(el, duration = 200) {
  return new Promise((resolve) => {
    if (!el) return resolve();

    el.style.transition = `opacity ${duration}ms ease, transform ${duration}ms ease`;
    el.style.willChange = "opacity, transform";

    void el.offsetWidth;

    el.style.opacity = "1";
    el.style.transform = "translateY(0)";

    setTimeout(() => resolve(), duration + 10);
  });
}

// ------------------------------
// Espera pelo fim da transição
// ------------------------------
function onceTransitionEnd(el, timeoutMs = 250) {
  return new Promise((resolve) => {
    if (!el) return resolve();

    let resolved = false;
    const timer = setTimeout(() => {
      if (resolved) return;
      resolved = true;
      cleanup();
      resolve();
    }, timeoutMs + 50);

    function handler(e) {
      if (e.target !== el) return;
      if (resolved) return;
      resolved = true;
      cleanup();
      resolve();
    }

    function cleanup() {
      clearTimeout(timer);
      el.removeEventListener("transitionend", handler);
    }

    el.addEventListener("transitionend", handler);
  });
}

// ------------------------------
// applyFade configurável (via main.js)
// ------------------------------
const fadeMap = new WeakMap();

/**
 * Aplica fade no elemento de acordo com as configs do main.js
 *
 * @param {HTMLElement} el - elemento alvo
 * @param {Function} render - função async que atualiza o conteúdo
 * @param {number} durationOverride - sobrescreve a duração
 */
export async function applyFade(el, render, durationOverride) {
  const fadeCfg = animated?.fade || {
    enabled: false,
    duration: 200,
    useTranslate: true,
    translateValue: "6px",
  };

  // se fade estiver desativado
  if (!fadeCfg.enabled) return render();

  if (!el) return render();

  const duration = durationOverride ?? fadeCfg.duration;
  const translate = fadeCfg.useTranslate ? fadeCfg.translateValue : null;

  const ongoing = fadeMap.get(el);
  if (ongoing) {
    try {
      await ongoing;
    } catch {}
  }

  const op = (async () => {
    const prevTransition = el.style.transition;

    el.style.transition = `opacity ${duration}ms ease, transform ${duration}ms ease`;
    el.style.willChange = "opacity, transform";

    if (!el.style.opacity) {
      const comp = getComputedStyle(el).opacity;
      el.style.opacity = comp || "1";
    }

    void el.offsetWidth;

    // Fade out
    el.style.opacity = "0";
    if (translate) el.style.transform = `translateY(${translate})`;

    await onceTransitionEnd(el, duration);

    await render();

    void el.offsetWidth;

    // Fade in
    el.style.opacity = "1";
    if (translate) el.style.transform = "translateY(0)";

    await onceTransitionEnd(el, duration);

    el.style.transition = prevTransition || "";
  })();

  fadeMap.set(el, op);
  try {
    await op;
  } finally {
    fadeMap.delete(el);
  }
}

// ------------------------------
// Exemplos utilitários
// ------------------------------
const content =
  typeof document !== "undefined" && document.getElementById("content");
const children =
  typeof document !== "undefined" &&
  document.getElementById("children-wrapper");

export async function changeContent(newHtml, duration) {
  if (!content) return;
  await applyFade(
    content,
    async () => {
      content.innerHTML = newHtml;
    },
    duration
  );
}

export async function changeChild(newHtml, duration) {
  if (!children) return;
  await applyFade(
    children,
    async () => {
      children.innerHTML = newHtml;
    },
    duration
  );
}
