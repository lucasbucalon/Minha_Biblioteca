import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  root: ".", // raiz do projeto
  base: "./", // para caminhos relativos no build
  server: {
    port: 3000,
    fs: { strict: false }, // permite leitura fora do root
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, "index.html"),
    },
  },
});
