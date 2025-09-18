// /modules/meta.js
function ensureMeta(selector, attrs) {
  let el = document.querySelector(selector);
  if (!el) {
    el = document.createElement("meta");
    for (const [k, v] of Object.entries(attrs)) {
      el.setAttribute(k, v);
    }
    document.head.appendChild(el);
  } else {
    for (const [k, v] of Object.entries(attrs)) {
      el.setAttribute(k, v);
    }
  }
  return el;
}

export async function distributeMetaFromManifest(
  manifestPath = "./manifest.json"
) {
  try {
    const res = await fetch(manifestPath);
    if (!res.ok) throw new Error("Não foi possível carregar o manifest.json");
    const manifest = await res.json();

    const title = manifest.name || document.title;
    const description = manifest.description || "";
    const author = manifest.author || "";
    const keywords = manifest.keywords || "";
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

    document.documentElement.lang = lang;

    // SEO
    ensureMeta('meta[name="description"]', {
      name: "description",
      content: description,
    });
    ensureMeta('meta[name="keywords"]', {
      name: "keywords",
      content: keywords,
    });
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
      content: lang.replace("-", "_"),
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

    // Favicon
    if (favicon) {
      let linkIcon = document.querySelector('link[rel="shortcut icon"]');
      if (!linkIcon) {
        linkIcon = document.createElement("link");
        linkIcon.rel = "shortcut icon";
        linkIcon.type = "image/svg+xml";
        document.head.appendChild(linkIcon);
      }
      linkIcon.href = favicon;
    }

    // CSS Global
    if (globalCSS) {
      let linkEl = document.querySelector('link[rel="stylesheet"]');
      if (!linkEl) {
        linkEl = document.createElement("link");
        linkEl.rel = "stylesheet";
        document.head.appendChild(linkEl);
      }
      linkEl.href = globalCSS;
    }

    // Hashtag universal
    ensureMeta('meta[name="hashtag-post"]', {
      name: "hashtag-post",
      content: hashtagPost,
    });

    // Título
    document.title = title;

    // Structured Data
    if (structuredData) {
      let jsonLdEl = document.querySelector("#structured-data");
      if (!jsonLdEl) {
        jsonLdEl = document.createElement("script");
        jsonLdEl.id = "structured-data";
        jsonLdEl.type = "application/ld+json";
        document.head.appendChild(jsonLdEl);
      }
      jsonLdEl.textContent = JSON.stringify(structuredData, null, 2);
    }
  } catch (err) {
    console.error("Erro ao distribuir meta tags a partir do manifest:", err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  distributeMetaFromManifest();
});
