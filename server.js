import express from "express";
import path from "path";

const app = express();
const port = process.env.PORT || 3000;
const distDir = path.join(process.cwd(), "dist");

// Serve arquivos estáticos
app.use(express.static(distDir));

// Fallback SPA
app.get("*", (req, res) => {
  res.sendFile(path.join(distDir, "index.html"));
});

app.listen(port, () => {
  console.log(`🚀 Server rodando em http://localhost:${port}`);
});
