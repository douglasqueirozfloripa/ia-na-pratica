// playwright.config.js — configura os testes E2E do "Renda Fixa Conservadora".
// Sobe um servidor local estático e roda os specs de e2e/ no Chromium.
const { defineConfig, devices } = require('@playwright/test');

const PORTA = 8139;

module.exports = defineConfig({
  testDir: './e2e',
  use: {
    baseURL: `http://localhost:${PORTA}`,
    // Localizamos elementos por data-testid (não quebra quando o visual muda).
    testIdAttribute: 'data-testid',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // O próprio Playwright sobe/derruba o servidor da pasta durante os testes.
  webServer: {
    command: `python3 -m http.server ${PORTA}`,
    url: `http://localhost:${PORTA}/index.html`,
    reuseExistingServer: true,
    timeout: 30000,
  },
});
