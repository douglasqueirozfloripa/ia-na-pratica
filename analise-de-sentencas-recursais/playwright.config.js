// Configuração do Playwright (testes de interface/E2E).
// Sobe um servidor estático simples e roda os testes da pasta e2e/.
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './e2e',
  timeout: 15000,
  use: {
    baseURL: 'http://localhost:8298',
    // Localizamos elementos por data-testid (não quebra quando o visual muda).
    testIdAttribute: 'data-testid',
  },
  webServer: {
    command: 'python3 -m http.server 8298',
    url: 'http://localhost:8298/index.html',
    reuseExistingServer: true,
    timeout: 30000,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
