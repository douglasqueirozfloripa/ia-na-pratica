// Script auxiliar (uso pontual): abre a tela, preenche a prévia e salva um PNG.
// Rode com o servidor local no ar. Não faz parte da suíte.
const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1100, height: 900 } });
  const preencherPrevia = async () => {
    await page.getByTestId('campo-produto').fill('CDB Banco Médio 110% CDI');
    await page.getByTestId('campo-categoria').selectOption('cdb-di');
    await page.getByTestId('campo-valor').fill('10000');
    await page.getByTestId('campo-pctcdi').fill('110');
    await page.getByTestId('campo-dias').fill('720');
    await page.waitForTimeout(150);
  };
  const salvar = async (produto, categoria, valor, pct, dias) => {
    await page.getByTestId('campo-produto').fill(produto);
    await page.getByTestId('campo-categoria').selectOption(categoria);
    await page.getByTestId('campo-valor').fill(valor);
    await page.getByTestId('campo-pctcdi').fill(pct);
    await page.getByTestId('campo-dias').fill(dias);
    await page.getByTestId('adicionar').click();
  };

  // Prompt 3 — tela base (carteira ainda vazia), prévia preenchida.
  await page.goto('http://localhost:8139/index.html');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await preencherPrevia();
  await page.screenshot({ path: 'screenshots/prompt3-primeira-tela.png', fullPage: true });

  // Prompt 4 — carteira persistida com dois aportes salvos.
  await salvar('Tesouro Selic 2031', 'tesouro', '8000', '100', '365');
  await salvar('LCI Habitação', 'letra', '6000', '95', '540');
  await preencherPrevia();
  await page.screenshot({ path: 'screenshots/prompt4-persistencia.png', fullPage: true });

  // Prompt 5 — carteira agrupada por risco (os três níveis).
  await salvar('CDB DI Banco Médio', 'cdb-di', '5000', '110', '720');
  await salvar('Fundo RF Simples', 'fundo', '3000', '100', '365');
  await preencherPrevia();
  await page.screenshot({ path: 'screenshots/prompt5-lista-por-risco.png', fullPage: true });

  // Prompt 6 — carteira de exemplo (estrutura real, valores fictícios) com o
  // ciclo de status por item (badges Planejado/Aplicado + botões Voltar/Avançar).
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByTestId('carregar-exemplo').click();
  await preencherPrevia();
  await page.screenshot({ path: 'screenshots/prompt6-ciclo-status.png', fullPage: true });

  // Prompt 7 — dashboard no topo (patrimônio, aderência, composição, alertas).
  await page.screenshot({ path: 'screenshots/prompt7-dashboard.png', fullPage: true });
  // recorte só do painel, para destacar o dashboard.
  await page
    .getByTestId('dashboard')
    .screenshot({ path: 'screenshots/prompt7-dashboard-painel.png' });

  // Prompt 8 — filtros + perfil-alvo. Filtra por risco médio e sobe o perfil.
  await page.getByTestId('filtro-risco').selectOption('médio');
  await page.getByTestId('filtro-perfil').selectOption('moderado');
  await page.screenshot({ path: 'screenshots/prompt8-filtros.png', fullPage: true });

  // Prompt 9 — simulador de melhoria ("como render mais"), carteira de exemplo limpa.
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByTestId('carregar-exemplo').click();
  await page.screenshot({ path: 'screenshots/prompt9-melhoria.png', fullPage: true });
  await page.getByTestId('melhoria').screenshot({ path: 'screenshots/prompt9-melhoria-card.png' });

  // Simular trocas: antes × depois (recorte do cartão "Como render mais").
  await page.getByTestId('simular-trocas').click();
  await page.getByTestId('melhoria').screenshot({ path: 'screenshots/prompt13-simular.png' });

  // Prompt 10 — ações destrutivas: botão "Remover" por aporte (recorte da carteira).
  await page.locator('section.carteira').screenshot({ path: 'screenshots/prompt10-remover.png' });

  // Prompt 11 — exportar/limpar (LGPD): header com "Exportar (JSON)" e "Reiniciar".
  await page.locator('header').screenshot({ path: 'screenshots/prompt11-exportar.png' });

  // Prompt 12 — acessibilidade: rodapé de contraste com os 5 pares auditados.
  await page.locator('footer').screenshot({ path: 'screenshots/prompt12-contraste.png' });

  // Dividendos: renda passiva das ações (recorte do card).
  await page.getByTestId('dividendos').screenshot({ path: 'screenshots/prompt20-dividendos.png' });
  await browser.close();
})();
