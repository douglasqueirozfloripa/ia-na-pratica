/*
 * e2e/app.spec.js — Testes de ponta a ponta (Playwright) do Prioriza.
 *
 * Cobrem o app rodando de verdade no navegador: o fluxo principal
 * criar → priorizar → concluir, um caminho negativo (validação) e a garantia
 * de acessibilidade (nenhum contraste "Reprovado" no relatório).
 */
const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  await page.goto('/index.html');
  await page.evaluate(() => localStorage.clear()); // cada teste começa limpo
  await page.reload();
});

test('(positivo) criar → priorizar → concluir', async ({ page }) => {
  await page.getByTestId('campo-titulo').fill('Corrigir build quebrada');
  await page.getByTestId('campo-urgencia').selectOption('5');
  await page.getByTestId('campo-importancia').selectOption('5');
  await page.getByTestId('btn-adicionar').click();

  // A tarefa aparece na lista, no quadrante certo e com a prioridade calculada.
  const tarefa = page.getByTestId('tarefa').filter({ hasText: 'Corrigir build quebrada' });
  await expect(tarefa).toBeVisible();
  await expect(tarefa).toContainText('15');

  // O painel "Foco do dia" reflete a nova tarefa.
  await expect(page.getByTestId('painel-total')).toHaveText('1');
  await expect(page.getByTestId('painel-fazagora')).toHaveText('1');

  // Avança pelo ciclo: a-fazer → fazendo → concluída.
  await tarefa.getByTestId('btn-avancar').click();
  await expect(tarefa.getByTestId('status')).toHaveText('Fazendo');
  await tarefa.getByTestId('btn-avancar').click();
  await expect(tarefa.getByTestId('status')).toHaveText('Concluída');

  // Concluída trava o "Avançar" (sem beco sem saída) e some das "concluídas hoje".
  await expect(tarefa.getByTestId('btn-avancar')).toBeDisabled();
  await expect(page.getByTestId('painel-hoje')).toHaveText('1');
});

test('(positivo) a preferência de filtro persiste ao recarregar', async ({ page }) => {
  await page.getByTestId('campo-titulo').fill('Tarefa em andamento');
  await page.getByTestId('btn-adicionar').click();
  await page.getByTestId('filtro-status').selectOption('fazendo');
  await page.reload();
  await expect(page.getByTestId('filtro-status')).toHaveValue('fazendo');
});

test('(negativo) tarefa sem título é bloqueada', async ({ page }) => {
  await page.getByTestId('btn-adicionar').click(); // sem preencher o título
  await expect(page.getByTestId('erros')).toBeVisible();
  await expect(page.getByTestId('erros')).toContainText('título');
  await expect(page.getByTestId('lista-vazia')).toBeVisible(); // nada foi criado
});

test('(positivo) acessibilidade: nenhum par de cores "Reprovado" no rodapé', async ({ page }) => {
  const relatorio = page.getByTestId('relatorio-contraste');
  await expect(relatorio).toBeVisible();
  await expect(relatorio).not.toContainText('Reprovado');
});
