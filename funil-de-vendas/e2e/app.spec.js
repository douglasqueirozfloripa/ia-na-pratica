// e2e/app.spec.js — teste E2E básico do formulário (Playwright).
// Cobre a tela: index.html. Convenção: (positivo) o que deve funcionar,
// (negativo) o que deve ser bloqueado.
const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  // Cada teste começa com o localStorage limpo, para um não vazar estado no outro.
  await page.goto('/index.html');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('(positivo) a primeira tela carrega com o formulário de novo negócio', async ({ page }) => {
  await expect(page).toHaveTitle(/Funil/);
  await expect(page.getByRole('heading', { name: 'Novo negócio' })).toBeVisible();
  await expect(page.getByTestId('campo-nome')).toBeVisible();
});

test('(positivo) a prévia calcula probabilidade e valor ponderado ao vivo', async ({ page }) => {
  await page.getByTestId('campo-nome').fill('Clínica Sorriso');
  await page.getByTestId('campo-valor').fill('10000');
  await page.getByTestId('campo-etapa').selectOption('proposta');
  // proposta = 50%, sem BANT -> 10.000 × 0,50 = R$ 5.000
  await expect(page.getByTestId('previa-probabilidade')).toHaveText('50%');
  await expect(page.getByTestId('previa-ponderado')).toContainText('5.000');
  // marca 2 critérios BANT -> 50% + 10% = 60%
  await page.getByTestId('campo-bant-orcamento').check();
  await page.getByTestId('campo-bant-prazo').check();
  await expect(page.getByTestId('previa-probabilidade')).toHaveText('60%');
});

test('(positivo) negócio válido mostra mensagem de sucesso', async ({ page }) => {
  await page.getByTestId('campo-nome').fill('Clínica Sorriso');
  await page.getByTestId('campo-valor').fill('4500');
  await page.getByTestId('campo-etapa').selectOption('qualificacao');
  await page.getByTestId('btn-salvar').click();
  await expect(page.getByTestId('mensagem')).toContainText('salvo no funil');
});

test('(negativo) formulário vazio é bloqueado com lista de erros', async ({ page }) => {
  await page.getByTestId('btn-salvar').click();
  const msg = page.getByTestId('mensagem');
  await expect(msg).toContainText('Corrija antes de continuar');
  await expect(msg).toContainText('Informe o nome do negócio ou contato.');
  await expect(msg).toContainText('Informe um valor maior que zero.');
});

test('(negativo) valor zero é rejeitado', async ({ page }) => {
  await page.getByTestId('campo-nome').fill('Contato X');
  await page.getByTestId('campo-valor').fill('0');
  await page.getByTestId('btn-salvar').click();
  await expect(page.getByTestId('mensagem')).toContainText('Informe um valor maior que zero.');
});

test('(positivo) o negócio persiste após recarregar a página', async ({ page }) => {
  await page.getByTestId('campo-nome').fill('Clínica Sorriso');
  await page.getByTestId('campo-valor').fill('4500');
  await page.getByTestId('campo-etapa').selectOption('proposta');
  await page.getByTestId('btn-salvar').click();
  await expect(page.getByTestId('contador-negocios')).toContainText('1 negócio');
  // recarrega: o dado tem que continuar lá (veio do localStorage)
  await page.reload();
  await expect(page.getByTestId('contador-negocios')).toContainText('1 negócio');
});

test('(negativo) dado corrompido no localStorage não quebra o app', async ({ page }) => {
  await page.evaluate(() => localStorage.setItem('funil.negocios', '{isto não é json'));
  await page.reload();
  // App carrega normalmente e trata como lista vazia — sem erro, sem travar.
  await expect(page.getByTestId('contador-negocios')).toContainText('Nenhum negócio salvo');
  await expect(page.getByRole('heading', { name: 'Novo negócio' })).toBeVisible();
});

test('(positivo) a lista agrupa por etapa, com o negócio no grupo certo', async ({ page }) => {
  // dois negócios em etapas diferentes, direto no localStorage
  await page.evaluate(() => {
    const dados = [
      { id: 'x1', nome: 'Clínica Sorriso', valor: 4000, etapa: 'proposta', bant: {} },
      { id: 'x2', nome: 'Studio Bem-Estar', valor: 9000, etapa: 'lead', bant: {} },
    ];
    localStorage.setItem('funil.negocios', JSON.stringify(dados));
  });
  await page.reload();
  // aparecem os 5 grupos (uma etapa cada)
  await expect(page.getByTestId('lista-funil').locator('.grupo')).toHaveCount(5);
  // cada negócio no grupo da sua etapa
  await expect(page.getByTestId('grupo-proposta')).toContainText('Clínica Sorriso');
  await expect(page.getByTestId('grupo-lead')).toContainText('Studio Bem-Estar');
  // grupo Proposta mostra a soma de valor (R$ 4.000,00) e a etapa Negociação fica vazia
  await expect(page.getByTestId('grupo-proposta')).toContainText('4.000,00');
  await expect(page.getByTestId('grupo-negociacao')).toContainText('Nenhum negócio nesta etapa.');
});

// Semeia negócios direto no localStorage e recarrega.
async function semear(page, dados) {
  await page.evaluate((d) => localStorage.setItem('funil.negocios', JSON.stringify(d)), dados);
  await page.reload();
}

test('(positivo) avançar move o negócio para a próxima etapa', async ({ page }) => {
  await semear(page, [{ id: 'p1', nome: 'Studio Bem-Estar', valor: 5000, etapa: 'lead', bant: {} }]);
  await expect(page.getByTestId('grupo-lead')).toContainText('Studio Bem-Estar');
  await page.getByTestId('avancar-p1').click();
  await expect(page.getByTestId('grupo-qualificacao')).toContainText('Studio Bem-Estar');
  await expect(page.getByTestId('grupo-lead')).toContainText('Nenhum negócio nesta etapa.');
});

test('(positivo) fechar como Ganho carimba o desfecho; reabrir limpa', async ({ page }) => {
  await semear(page, [{ id: 'p2', nome: 'Pet Amigo', valor: 8000, etapa: 'negociacao', bant: {} }]);
  await page.getByTestId('ganhar-p2').click();
  const fechado = page.getByTestId('grupo-fechado');
  await expect(fechado).toContainText('Pet Amigo');
  await expect(fechado).toContainText('Ganho');
  await expect(fechado).toContainText('100%'); // ganho => 100%
  // reabrir volta para Negociação e some o "Ganho"
  await page.getByTestId('voltar-p2').click();
  await expect(page.getByTestId('grupo-negociacao')).toContainText('Pet Amigo');
  await expect(page.getByTestId('grupo-fechado')).not.toContainText('Ganho');
});

test('(negativo) sem beco sem saída: Lead não tem "Voltar"; Fechado não tem "Avançar"', async ({ page }) => {
  await semear(page, [
    { id: 'l1', nome: 'No topo', valor: 1000, etapa: 'lead', bant: {} },
    { id: 'f1', nome: 'Fechado', valor: 1000, etapa: 'fechado', desfecho: 'ganho', fechadoEm: '2026-07-13T10:00:00.000Z', bant: {} },
  ]);
  await expect(page.getByTestId('voltar-l1')).toHaveCount(0); // Lead não volta
  await expect(page.getByTestId('avancar-f1')).toHaveCount(0); // Fechado não avança
  await expect(page.getByTestId('voltar-f1')).toBeVisible(); // mas dá para Reabrir
});

test('(positivo) exportar baixa um arquivo JSON com os negócios', async ({ page }) => {
  const fs = require('fs');
  await semear(page, [{ id: 'x1', nome: 'Clínica Sorriso', valor: 4500, etapa: 'proposta', bant: {} }]);
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByTestId('btn-exportar').click(),
  ]);
  expect(download.suggestedFilename()).toContain('.json');
  const conteudo = JSON.parse(fs.readFileSync(await download.path(), 'utf8'));
  expect(conteudo.app).toBe('Funil');
  expect(conteudo.negocios).toHaveLength(1);
  expect(conteudo.negocios[0].nome).toBe('Clínica Sorriso');
});

test('(positivo) limpar tudo (confirmando) apaga os negócios', async ({ page }) => {
  await semear(page, [{ id: 'c1', nome: 'Some daqui', valor: 1000, etapa: 'lead', bant: {} }]);
  page.once('dialog', (d) => d.accept());
  await page.getByTestId('btn-limpar').click();
  await expect(page.getByTestId('contador-negocios')).toContainText('Nenhum negócio salvo');
  const guardado = await page.evaluate(() => localStorage.getItem('funil.negocios'));
  expect(guardado).toBeNull();
});

test('(negativo) limpar tudo (cancelando) mantém os negócios', async ({ page }) => {
  await semear(page, [{ id: 'c2', nome: 'Fico aqui', valor: 1000, etapa: 'lead', bant: {} }]);
  page.once('dialog', (d) => d.dismiss());
  await page.getByTestId('btn-limpar').click();
  await expect(page.getByTestId('contador-negocios')).toContainText('1 negócio');
  await expect(page.getByTestId('grupo-lead')).toContainText('Fico aqui');
});

test('(negativo→positivo) nenhum controle fica colado/sobreposto (folga > 0,5px)', async ({ page }) => {
  // Roda a MESMA função pura (window.Logica.validarEspacamento) sobre as caixas
  // REAIS dos controles da tela. Pega botão/campo "grudado" na margem ou no vizinho.
  const relatorio = await page.evaluate((minPx) => {
    const els = Array.from(document.querySelectorAll('input, select, button, label.check'));
    const caixas = els.map((el, i) => {
      const r = el.getBoundingClientRect();
      const nome = el.getAttribute('data-testid') || (el.tagName.toLowerCase() + '#' + i);
      return { nome, caixa: { left: r.left, right: r.right, top: r.top, bottom: r.bottom } };
    });
    return window.Logica.validarEspacamento(caixas, minPx);
  }, 0.5);
  // Mostra as violações na mensagem de erro do teste, se houver.
  expect(relatorio.violacoes, JSON.stringify(relatorio.violacoes, null, 2)).toEqual([]);
});

test('(positivo) fluxo completo: criar → avançar até Negociação → fechar como Ganho', async ({ page }) => {
  // cria pelo formulário
  await page.getByTestId('campo-nome').fill('Clínica Sorriso');
  await page.getByTestId('campo-valor').fill('10000');
  await page.getByTestId('campo-etapa').selectOption('lead');
  await page.getByTestId('btn-salvar').click();
  // avança degrau a degrau (o item muda de grupo a cada passo)
  await page.getByTestId('grupo-lead').getByRole('button', { name: /Avançar/ }).click();
  await page.getByTestId('grupo-qualificacao').getByRole('button', { name: /Avançar/ }).click();
  await page.getByTestId('grupo-proposta').getByRole('button', { name: /Avançar/ }).click();
  // fecha como Ganho
  await page.getByTestId('grupo-negociacao').getByRole('button', { name: /Fechar: Ganho/ }).click();
  const fechado = page.getByTestId('grupo-fechado');
  await expect(fechado).toContainText('Clínica Sorriso');
  await expect(fechado).toContainText('Ganho');
  await expect(fechado).toContainText('100%');
});

test('(positivo) dá para criar um negócio usando só o teclado', async ({ page }) => {
  await page.getByTestId('campo-nome').focus();
  await page.keyboard.type('Contato Teclado');
  await page.keyboard.press('Tab'); // Tab leva ao campo de valor
  await expect(page.getByTestId('campo-valor')).toBeFocused();
  await page.keyboard.type('3000');
  await page.keyboard.press('Enter'); // Enter no formulário envia
  await expect(page.getByTestId('mensagem')).toContainText('salvo no funil');
});

test('(positivo) acessibilidade: campos têm nome, botão tem texto, lista é uma região nomeada', async ({ page }) => {
  await expect(page.getByTestId('campo-nome')).toHaveAccessibleName(/nome do negócio/i);
  await expect(page.getByTestId('campo-valor')).toHaveAccessibleName(/valor/i);
  await expect(page.getByTestId('campo-etapa')).toHaveAccessibleName(/etapa do funil/i);
  await expect(page.getByTestId('btn-salvar')).toHaveAccessibleName(/adicionar ao funil/i);
  await expect(page.getByRole('region', { name: /Negócios por etapa do funil/i })).toBeVisible();
});

test('(positivo) o rodapé mostra a auditoria de contraste WCAG ao vivo', async ({ page }) => {
  const rodape = page.getByTestId('rodape-contraste');
  await expect(rodape).toContainText(':1');
  // Todas as combinações da paleta passam em AA (ou melhor); nenhuma reprovada.
  await expect(rodape.locator('.selo.reprovado')).toHaveCount(0);
  await expect(rodape.locator('.selo.AA, .selo.AAA')).toHaveCount(4);
});
