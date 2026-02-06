import { defineConfig } from "vitest/config";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "tests/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@masterchef/shared": fileURLToPath(
        new URL("../shared/index.ts", import.meta.url)
      ),
      "@masterchef/shared/*": fileURLToPath(
        new URL("../shared/*", import.meta.url)
      ),
    },
  },
});
