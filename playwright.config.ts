import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL: "http://localhost:3000",
    headless: true,
  },
  webServer: [
    {
      command: "npm run test:server -w backend",
      port: 4000,
      reuseExistingServer: true,
      timeout: 120_000,
    },
    {
      command: "npm run dev -w frontend -- --host 127.0.0.1 --port 3000",
      port: 3000,
      reuseExistingServer: true,
      timeout: 120_000,
      env: {
        VITE_BASE_API_URL: "http://localhost:4000/api",
      },
    },
  ],
});
