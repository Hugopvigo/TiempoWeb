import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@shared": path.resolve(__dirname, "../shared"),
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      __VITE_OWM_API_KEY__: JSON.stringify(env.VITE_OWM_API_KEY ?? ""),
      __VITE_AEMET_API_KEY__: JSON.stringify(env.VITE_AEMET_API_KEY ?? ""),
    },
    server: {
      port: 3000,
      host: true,
    },
    build: {
      outDir: "dist",
      sourcemap: true,
    },
  };
});
