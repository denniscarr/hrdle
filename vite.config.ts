import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { compression } from "vite-plugin-compression2";

// https://vite.dev/config/
export default defineConfig(() => {
  return {
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    plugins: [
      react(),
      // Pre-compress Godot files so we can read their size for the loading
      // screen progress bar.
      // Might not be necessary if we switch off Github Pages.
      compression({
        include: /\.(pck|wasm|js)$/,
        deleteOriginalAssets: false,
      }),
    ],
    base: `/hrdle/`,
    build: {
      sourcemap: true,
    },
    server: {
      host: true,
    },
  };
});
