export function applyGlobalMeta() {
  // Seleciona todas as meta tags e links do index.html
  const headTags = document.querySelectorAll("head meta, head link");

  // Cria um container para clonar as tags (se ainda não tiver)
  if (!document.getElementById("global-meta")) {
    const container = document.createElement("div");
    container.id = "global-meta";
    container.style.display = "none";
    document.body.appendChild(container);

    headTags.forEach((tag) => {
      container.appendChild(tag.cloneNode(true)); // clona todas as metas e links
    });
  }
}

export function injectGlobalMeta(targetDocument = document) {
  const container = document.getElementById("global-meta");
  if (!container) return;

  // Remove tags antigas no target para evitar duplicação
  const existing = targetDocument.head.querySelectorAll(
    "meta[data-global], link[data-global]"
  );
  existing.forEach((tag) => tag.remove());

  // Injeta as tags clonadas no target
  container.querySelectorAll("meta, link").forEach((tag) => {
    const clone = tag.cloneNode(true);
    clone.setAttribute("data-global", "true"); // marca como global
    targetDocument.head.appendChild(clone);
  });
}
