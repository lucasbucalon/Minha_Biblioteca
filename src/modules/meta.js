// /modules/meta.js

// Função utilitária para criar/atualizar meta tags
function ensureMeta(selector, attrs) {
  let el = document.querySelector(selector);
  if (!el) {
    el = document.createElement("meta");
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    document.head.appendChild(el);
  } else {
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  }
  return el;
}

// Atualiza todas as metas SEO / OG / Twitter / canonical
export function updateMeta({
  title = document.title,
  description = "",
  url = window.location.href,
  image = "/constant/image/Frame.png",
  type = "website",
  author = "Lucas",
  keywords = "programação, SPA, SEO, marketing, web design",
  tagName = "@bibliotecaspa",
  themeColor = "#1e1e1e",
}) {
  document.title = title;

  // SEO
  ensureMeta('meta[name="description"]', {
    name: "description",
    content: description,
  });
  ensureMeta('meta[name="keywords"]', { name: "keywords", content: keywords });
  ensureMeta('meta[name="author"]', { name: "author", content: author });

  // Open Graph
  ensureMeta('meta[property="og:title"]', {
    property: "og:title",
    content: title,
  });
  ensureMeta('meta[property="og:description"]', {
    property: "og:description",
    content: description,
  });
  ensureMeta('meta[property="og:type"]', {
    property: "og:type",
    content: type,
  });
  ensureMeta('meta[property="og:url"]', { property: "og:url", content: url });
  ensureMeta('meta[property="og:image"]', {
    property: "og:image",
    content: image,
  });
  ensureMeta('meta[property="og:locale"]', {
    property: "og:locale",
    content: "pt_BR",
  });
  ensureMeta('meta[property="og:site_name"]', {
    property: "og:site_name",
    content: title,
  });

  // Twitter
  ensureMeta('meta[name="twitter:card"]', {
    name: "twitter:card",
    content: "summary_large_image",
  });
  ensureMeta('meta[name="twitter:title"]', {
    name: "twitter:title",
    content: title,
  });
  ensureMeta('meta[name="twitter:description"]', {
    name: "twitter:description",
    content: description,
  });
  ensureMeta('meta[name="twitter:image"]', {
    name: "twitter:image",
    content: image,
  });
  ensureMeta('meta[name="twitter:creator"]', {
    name: "twitter:creator",
    content: tagName,
  });

  // Canonical
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.appendChild(canonical);
  }
  canonical.href = url;

  // Theme color
  ensureMeta('meta[name="theme-color"]', {
    name: "theme-color",
    content: themeColor,
  });
}
