// /modules/meta.js
export async function distributeMetaFromManifest(
  manifestPath = "./manifest.json"
) {
  try {
    const res = await fetch(manifestPath);
    if (!res.ok) throw new Error("Não foi possível carregar o manifest.json");
    const manifest = await res.json();

    // ----------------------------
    // Valores principais do manifest
    // ----------------------------
    const title = manifest.name || document.title;
    const description = manifest.description || "";
    const author = manifest.author || "";
    const keywords = manifest.keywords || "";
    const authenticator = manifest.authenticator || "";
    const url = manifest.url || window.location.href;
    const type = manifest.type || "website";
    const image = manifest.image || manifest.icons?.[0]?.src || "";
    const themeColor = manifest.theme_color || "#000000";
    const favicon = manifest.favicon || "";
    const globalCSS = manifest.global_css || "";
    const lang = manifest.lang || "pt-br";
    const structuredData = manifest.structured_data || null;
    const tagName = manifest.social?.tag_name || "";
    const hashtagPost = manifest.social?.hashtag_post || "";

    // ----------------------------
    // Define idioma do html
    // ----------------------------
    document.documentElement.lang = lang;

    // ----------------------------
    // SEO global
    // ----------------------------
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", description);
    document
      .querySelector('meta[name="keywords"]')
      ?.setAttribute("content", keywords);
    document
      .querySelector('meta[name="author"]')
      ?.setAttribute("content", author);

    // ----------------------------
    // Open Graph
    // ----------------------------
    document
      .querySelector('meta[property="og:title"]')
      ?.setAttribute("content", title);
    document
      .querySelector('meta[property="og:description"]')
      ?.setAttribute("content", description);
    document
      .querySelector('meta[property="og:type"]')
      ?.setAttribute("content", type);
    document
      .querySelector('meta[property="og:url"]')
      ?.setAttribute("content", url);
    document
      .querySelector('meta[property="og:image"]')
      ?.setAttribute("content", image);
    document
      .querySelector('meta[property="og:locale"]')
      ?.setAttribute("content", lang.replace("-", "_"));
    document
      .querySelector('meta[property="og:site_name"]')
      ?.setAttribute("content", title);

    // ----------------------------
    // Twitter Cards
    // ----------------------------
    document
      .querySelector('meta[name="twitter:title"]')
      ?.setAttribute("content", title);
    document
      .querySelector('meta[name="twitter:description"]')
      ?.setAttribute("content", description);
    document
      .querySelector('meta[name="twitter:image"]')
      ?.setAttribute("content", image);
    document
      .querySelector('meta[name="twitter:creator"]')
      ?.setAttribute("content", tagName);

    // ----------------------------
    // Canonical
    // ----------------------------
    document.querySelector('link[rel="canonical"]')?.setAttribute("href", url);

    // ----------------------------
    // PWA & Favicon
    // ----------------------------
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", themeColor);
    if (favicon) {
      const linkIcon = document.querySelector('link[rel="shortcut icon"]');
      if (linkIcon) linkIcon.setAttribute("href", favicon);
    }

    // ----------------------------
    // CSS Global
    // ----------------------------
    if (globalCSS) {
      let linkEl = document.querySelector('link[rel="stylesheet"]');
      if (linkEl) {
        linkEl.setAttribute("href", globalCSS);
      } else {
        linkEl = document.createElement("link");
        linkEl.rel = "stylesheet";
        linkEl.href = globalCSS;
        document.head.appendChild(linkEl);
      }
    }

    // ----------------------------
    // Hashtag universal
    // ----------------------------
    document
      .querySelector('meta[name="hashtag-post"]')
      ?.setAttribute("content", hashtagPost);

    // ----------------------------
    // Título da página
    // ----------------------------
    document.title = title;

    // ----------------------------
    // Structured Data JSON-LD
    // ----------------------------
    if (structuredData) {
      const jsonLdEl =
        document.querySelector("#structured-data") ||
        document.createElement("script");
      jsonLdEl.id = "structured-data";
      jsonLdEl.type = "application/ld+json";
      jsonLdEl.textContent = JSON.stringify(structuredData, null, 2);
      if (!document.head.contains(jsonLdEl))
        document.head.appendChild(jsonLdEl);
    }

    return {
      title,
      description,
      author,
      keywords,
      authenticator,
      url,
      type,
      image,
      themeColor,
      favicon,
      globalCSS,
      lang,
      tagName,
      hashtagPost,
      structuredData,
    };
  } catch (err) {
    console.error("Erro ao distribuir meta tags a partir do manifest:", err);
  }
}

// Executa automaticamente
document.addEventListener("DOMContentLoaded", () => {
  distributeMetaFromManifest();
});
