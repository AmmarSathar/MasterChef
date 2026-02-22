import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.ts",
    include: ["src/**/*.test.{ts,tsx}", "tests/**/*.test.{ts,tsx}"],
  },
  define: {
    "import.meta.env.VITE_BASE_API_URL": JSON.stringify(
      "http://localhost:4000/api",
    ),
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@/lib": fileURLToPath(new URL("./src/lib", import.meta.url)),
      "@components": fileURLToPath(
        new URL("./src/components", import.meta.url),
      ),
      "@context": fileURLToPath(new URL("./src/context", import.meta.url)),
      "@masterchef/shared/constants": fileURLToPath(
        new URL("../shared/constants/index.ts", import.meta.url),
      ),
      "@masterchef/shared": fileURLToPath(
        new URL("../shared/index.ts", import.meta.url),
      ),
    },
  },
});
