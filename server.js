import http from "http";
import fs from "fs/promises";
import path from "path";
import url from "url";

const publicDir = path.join(process.cwd(), "dist"); // agora aponta pro dist do Vite

const mimeTypes = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

const server = http.createServer(async (req, res) => {
  try {
    const parsedUrl = url.parse(req.url || "");
    let pathname = decodeURIComponent(parsedUrl.pathname || "/");

    // Normaliza o caminho (evita ../ etc)
    pathname = path.normalize(pathname).replace(/^(\.\.[/\\])+/, "");

    let filePath = path.join(publicDir, pathname);

    try {
      const stat = await fs.stat(filePath);
      if (stat.isFile()) {
        const ext = path.extname(filePath);
        const data = await fs.readFile(filePath);
        res.writeHead(200, { "Content-Type": mimeTypes[ext] || "text/plain" });
        res.end(data);
        return;
      }
    } catch {
      // se o arquivo não existir, cai no fallback
    }

    // fallback SPA: redireciona tudo pro index.html
    const indexPath = path.join(publicDir, "index.html");
    const indexData = await fs.readFile(indexPath);
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(indexData);
  } catch (err) {
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("Erro interno do servidor");
    console.error(err);
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server rodando em http://localhost:${PORT}`);
});
