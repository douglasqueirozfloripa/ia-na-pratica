/*
 * e2e/app.spec.js — Testes de ponta a ponta (Playwright) do "Instância".
 *
 * Cobrem o app rodando de verdade no navegador: o fluxo principal
 * cadastrar → classificar → avançar de fase → transitar em julgado, um caminho
 * negativo (validação) e a garantia de acessibilidade (nenhum contraste
 * "Reprovado" no rodapé).
 */
const { test, expect } = require('@playwright/test');

// Preenche o formulário de nova decisão com dados FICTÍCIOS (LGPD).
async function preencherDecisao(page, dados) {
  await page.getByTestId('in-numero').fill(dados.numero);
  await page.getByTestId('in-orgao-vara').fill(dados.orgaoVara || '3ª Vara Cível');
  await page.getByTestId('sel-tipo-lide').selectOption(dados.tipoLide || 'cobranca-indevida');
  await page.getByTestId('sel-resultado').selectOption(dados.resultado || 'procedente');
  await page.getByTestId('in-valor-causa').fill(String(dados.valorCausa ?? 38000));
  if (dados.valorCondenacao != null) {
    await page.getByTestId('in-valor-condenacao').fill(String(dados.valorCondenacao));
  }
  if (dados.prazo) await page.getByTestId('in-prazo').fill(dados.prazo);
}

test.beforeEach(async ({ page }) => {
  await page.goto('/index.html');
  await page.evaluate(() => localStorage.clear()); // cada teste começa limpo
  await page.reload();
});

test('(positivo) cadastrar → classificar → avançar de fase → transitar em julgado', async ({
  page,
}) => {
  await preencherDecisao(page, { numero: '0007421-33.2026.8.24.0023', valorCausa: 38000 });
  await page.getByTestId('btn-classificar').click();

  // Aparece na lista, com a espécie calculada, e o contador sobe.
  const card = page.getByTestId('decisao-card').filter({ hasText: '0007421-33.2026.8.24.0023' });
  await expect(card).toBeVisible();
  await expect(card).toContainText('Definitiva · condenatória · simples');
  await expect(page.getByTestId('contador-salvas')).toContainText('1');

  // O painel reflete a nova decisão.
  await expect(page.getByTestId('painel')).toContainText('Total de decisões');

  // Ciclo de fases: 1º grau → apelação → instância superior → transitado.
  await expect(card).toContainText('Fase: 1º grau');
  await card.getByTestId('btn-avancar').click();
  await expect(
    page.getByTestId('decisao-card').filter({ hasText: '0007421-33.2026.8.24.0023' })
  ).toContainText('Fase: Apelação (2º grau)');

  // Avança até transitar em julgado (carimba a data).
  await page
    .getByTestId('decisao-card')
    .filter({ hasText: '0007421-33.2026.8.24.0023' })
    .getByTestId('btn-avancar')
    .click();
  await page
    .getByTestId('decisao-card')
    .filter({ hasText: '0007421-33.2026.8.24.0023' })
    .getByTestId('btn-avancar')
    .click();

  const transitada = page
    .getByTestId('decisao-card')
    .filter({ hasText: '0007421-33.2026.8.24.0023' });
  await expect(transitada).toContainText('Transitado em julgado');
  await expect(transitada).toContainText('Transitado em');
  // No trânsito, "Avançar" trava (sem beco sem saída).
  await expect(transitada.getByTestId('btn-avancar')).toBeDisabled();
});

test('(positivo) a preferência de filtro persiste ao recarregar', async ({ page }) => {
  await preencherDecisao(page, { numero: '0001-teste' });
  await page.getByTestId('btn-classificar').click();
  await page.getByTestId('filtro-resultado').selectOption('procedente');
  await page.reload();
  await expect(page.getByTestId('filtro-resultado')).toHaveValue('procedente');
});

test('(negativo) decisão sem número de processo é bloqueada', async ({ page }) => {
  // Sem preencher o número, tenta classificar.
  await page.getByTestId('sel-tipo-lide').selectOption('dano-moral');
  await page.getByTestId('in-valor-causa').fill('1000');
  await page.getByTestId('btn-classificar').click();

  // Não salvou (contador segue 0) e o erro aparece na prévia.
  await expect(page.getByTestId('contador-salvas')).toContainText('0');
  await expect(page.getByTestId('previa-erros')).toContainText('numeroProcesso é obrigatório');
});

test('(positivo) excluir uma decisão remove da lista (com confirmação)', async ({ page }) => {
  page.on('dialog', (d) => d.accept()); // confirma a exclusão
  await preencherDecisao(page, { numero: '0002-excluir' });
  await page.getByTestId('btn-classificar').click();
  const card = page.getByTestId('decisao-card').filter({ hasText: '0002-excluir' });
  await expect(card).toBeVisible();
  await card.getByTestId('btn-excluir').click();
  await expect(page.getByTestId('decisao-card').filter({ hasText: '0002-excluir' })).toHaveCount(0);
  await expect(page.getByTestId('contador-salvas')).toContainText('0');
});

test('(positivo) acessibilidade: nenhum par de contraste "Reprovado" no rodapé', async ({
  page,
}) => {
  const reprovados = page.getByTestId('tabela-contraste').getByText('Reprovado');
  await expect(reprovados).toHaveCount(0);
});
