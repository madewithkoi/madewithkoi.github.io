import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  testMatch: 'homepage.spec.mjs',
  fullyParallel: true,
  reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:4187', trace: 'retain-on-failure' },
  webServer: {
    command: 'python3 -m http.server 4187 --bind 127.0.0.1',
    url: 'http://127.0.0.1:4187',
    reuseExistingServer: false
  }
});
