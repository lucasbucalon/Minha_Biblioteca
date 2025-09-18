import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  // resolve: {
  //   alias: {
  //     "/modules": path.resolve(__dirname, "modules"),
  //   },
  // },
  server: {
    port: 3000, // opcional, muda a porta
  },
  build: {
    outDir: "dist",
  },
});
