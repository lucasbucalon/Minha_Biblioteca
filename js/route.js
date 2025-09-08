// // route.js
// import { routes } from "./routes.js";

// const content = document.getElementById("content");
// const pageCache = {}; // cache em memória
// const loadedStyles = new Set();
// const loadedScripts = new Set();

// // Fetch simples com cache
// export async function fetchPage(url) {
//   if (pageCache[url]) return pageCache[url];
//   const res = await fetch(url);
//   if (!res.ok) throw new Error(`Erro ao carregar: ${url}`);
//   const html = await res.text();
//   pageCache[url] = html;
//   return html;
// }

// async function ensureStyles(root) {
//   const promises = [];
//   root.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
//     const href = link.href;
//     if (!href || loadedStyles.has(href)) return;
//     loadedStyles.add(href);
//     const newLink = link.cloneNode(true);
//     document.head.appendChild(newLink);
//     promises.push(
//       new Promise((resolve) => {
//         newLink.onload = newLink.onerror = resolve;
//       })
//     );
//   });
//   return Promise.all(promises);
// }

// function executeScripts(root) {
//   root.querySelectorAll("script").forEach((old) => {
//     // evita re-executar scripts externos já carregados
//     if (old.src && loadedScripts.has(old.src)) {
//       old.remove();
//       return;
//     }
//     if (old.src) loadedScripts.add(old.src);

//     const script = document.createElement("script");
//     if (old.src) {
//       // manter mesmo src como inserção dinâmica
//       script.src = old.src;
//       script.defer = true;
//     } else {
//       // inline scripts re-criados (CSP-friendly, sem eval)
//       script.textContent = old.textContent;
//     }
//     document.body.appendChild(script);
//     old.remove();
//   });
// }

// // Atualiza #content. useFade = true|false
// export async function updateContent(html, page, useFade = true) {
//   const temp = document.createElement("div");
//   temp.innerHTML = html;

//   await ensureStyles(temp);

//   const render = () => {
//     content.innerHTML = temp.innerHTML;
//     executeScripts(content);
//     if (window.loadConstants) {
//       try {
//         window.loadConstants(content);
//       } catch (e) {
//         console.warn(e);
//       }
//     }
//     const pageTitle =
//       temp.querySelector("title")?.textContent || page.split("/").pop();
//     document.title = pageTitle;
//     document.dispatchEvent(new Event("spa:pageLoaded"));
//   };

//   if (useFade) {
//     content.classList.add("fade-out");
//     setTimeout(() => {
//       render();
//       content.classList.remove("fade-out");
//       content.classList.add("fade-in");
//       setTimeout(() => content.classList.remove("fade-in"), 200);
//     }, 100);
//   } else {
//     render();
//   }
// }

// export async function loadPage(page) {
//   try {
//     const html = await fetchPage(`${page}.html`);
//     await updateContent(html, page, true);
//   } catch (err) {
//     console.error(err);
//     try {
//       const html404 = await fetchPage("pages/404.html");
//       await updateContent(html404, "Erro 404", false);
//     } catch {
//       content.innerHTML = "<p>Página não encontrada.</p>";
//       document.title = "Erro";
//     }
//   }
// }

// // Navegação: intercepta links com data-link
// function navigate(event) {
//   const link = event.target.closest("a[data-link]");
//   if (!link) return;
//   event.preventDefault();
//   let href = link.getAttribute("href") || "/";
//   // aceita "#/Rota" ou "/Rota" ou "Rota"
//   if (!href.startsWith("#")) href = `#${href}`;
//   location.hash = href;
// }

// // Match de rota e load
// export function handleRoute(path) {
//   // path vindo sem '#', ex: "/Botoes" ou "Botoes"
//   if (!path.startsWith("/")) path = `/${path}`;
//   for (const route of routes) {
//     if (route.path.test(path)) {
//       loadPage(route.page);
//       return;
//     }
//   }
//   loadPage("404/404");
// }

// // Prefetch on hover / touch
// export function enablePrefetch() {
//   document.querySelectorAll("a[data-link]").forEach((link) => {
//     let url = link.getAttribute("href") || "/";
//     if (url.startsWith("#")) url = url.slice(1);
//     // encontra rota correspondente (para pegar page)
//     const route = routes.find((r) => r.path.test(url));
//     if (!route) return;
//     const target = () => fetchPage(`${route.page}.html`).catch(() => {});
//     link.addEventListener("mouseenter", target, { passive: true });
//     link.addEventListener("touchstart", target, { passive: true });
//   });
// }

// // inicialização: escuta hashchange e cliques
// document.addEventListener("DOMContentLoaded", () => {
//   window.addEventListener("hashchange", () =>
//     handleRoute(location.hash.slice(1) || "/")
//   );
//   document.body.addEventListener("click", navigate);
//   // rota inicial
//   handleRoute(location.hash.slice(1) || "/");
//   // ativa prefetch
//   enablePrefetch();
// });
