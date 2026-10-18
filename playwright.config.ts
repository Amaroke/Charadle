import { defineConfig, devices } from "@playwright/test";

const port = 3100;
const fakeMalPort = 3101;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://localhost:${port}`,
    trace: "on-first-retry",
  },
  projects: [
    { name: "mobile", use: { ...devices["Pixel 7"] } },
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: [
    {
      command: "node e2e/fake-mal.mjs",
      url: `http://localhost:${fakeMalPort}/characters/40.png`,
      env: { FAKE_MAL_PORT: String(fakeMalPort) },
      reuseExistingServer: !process.env.CI,
    },
    {
      command: `npm run build && npm run start -- --port ${port}`,
      url: `http://localhost:${port}`,
      env: {
        MAL_API_URL: `http://localhost:${fakeMalPort}/v2`,
        MAL_CLIENT_ID: "e2e-client-id",
        WIKIDATA_URL: `http://localhost:${fakeMalPort}/sparql`,
        GAME_SECRET: "e2e-game-secret",
        DATABASE_URL: "memory:",
        CRON_SECRET: "e2e-cron-secret",
      },
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
    },
  ],
});
