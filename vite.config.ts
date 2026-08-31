import { defineConfig } from "vite";
import { resolve } from "path";

// https://vite.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        setup: resolve(__dirname, "setup/index.html"),
        content: resolve(__dirname, "content/index.html"),
        gaming: resolve(__dirname, "gaming/index.html"),
        projects: resolve(__dirname, "projects/index.html"),
        now: resolve(__dirname, "now/index.html"),
      },
    },
  },
});
