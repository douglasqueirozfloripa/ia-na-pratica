// simulacao-riscos.spec.js — E2E COMPLETO: simula três visões de investimento
// (baixo, médio e alto risco) para AUMENTAR a rentabilidade da carteira de ~R$ 88
// mil, e confirma que cada visão melhora o retorno de um jeito diferente.
const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  await page.goto('/index.html');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByTestId('carregar-exemplo').click();
  await expect(page.getByTestId('ind-total')).toContainText('88.344');
});

test('(positivo) compara numericamente as três visões de risco (funções puras)', async ({
  page,
}) => {
  // Roda as MESMAS funções puras (window.Logica) sobre a carteira do localStorage.
  const c = await page.evaluate(() => {
    const L = window.Logica;
    const aportes = L.desserializarAportes(localStorage.getItem('rfc.aportes'));

    // BAIXO risco: só trocas que NÃO aumentam o risco.
    const baixo = L.simularMelhoria(aportes, { manterRisco: true });
    // MÉDIO risco: aceita trocas que sobem um degrau de risco.
    const medio = L.simularMelhoria(aportes, { manterRisco: false });
    // ALTO risco: acrescenta uma posição de ações de maior retorno esperado.
    const comAcoes = [
      ...aportes,
      {
        id: 'growth',
        produto: 'Ações Growth',
        categoria: 'acoes',
        valor: 15000,
        rentabilidadeAnual: 0.18,
        dias: 365,
      },
    ];
    return {
      rentAtual: L.rentabilidadeMediaAnual(aportes),
      baixo: { rentDepois: baixo.rentDepois, ganho: baixo.ganhoAnual, trocas: baixo.quantidade },
      medio: { rentDepois: medio.rentDepois, ganho: medio.ganhoAnual, trocas: medio.quantidade },
      altoRentMedia: L.rentabilidadeMediaAnual(comAcoes),
    };
  });

  // Baixo risco JÁ aumenta a rentabilidade (sem subir o risco).
  expect(c.baixo.rentDepois).toBeGreaterThan(c.rentAtual);
  // Médio risco libera MAIS trocas => ganho e nº de trocas ≥ visão conservadora.
  expect(c.medio.ganho).toBeGreaterThanOrEqual(c.baixo.ganho);
  expect(c.medio.trocas).toBeGreaterThanOrEqual(c.baixo.trocas);
  expect(c.medio.rentDepois).toBeGreaterThanOrEqual(c.baixo.rentDepois);
  // Alto risco (incluir ações de 18%) eleva a rentabilidade média da carteira.
  expect(c.altoRentMedia).toBeGreaterThan(c.rentAtual);
});

test('(positivo) VISÃO BAIXO RISCO: trocas que não sobem o risco', async ({ page }) => {
  await page.getByTestId('filtro-perfil').selectOption('conservador');
  await page.getByTestId('manter-risco').check();
  await page.getByTestId('simular-trocas').click();
  const res = page.getByTestId('simulacao-resultado');
  await expect(res).toContainText('Sua rentabilidade aumenta');
  // nenhuma dica sobe o risco nesta visão
  await expect(page.getByTestId('dicas')).not.toContainText('risco sobe');
});

test('(positivo) VISÃO MÉDIO RISCO: libera trocas que sobem um degrau', async ({ page }) => {
  await page.getByTestId('manter-risco').uncheck();
  await page.getByTestId('filtro-perfil').selectOption('moderado');
  await page.getByTestId('simular-trocas').click();
  await expect(page.getByTestId('dicas')).toContainText('risco sobe');
  await expect(page.getByTestId('simulacao-resultado')).toContainText('Sua rentabilidade aumenta');
  // com perfil moderado (teto 30%), a carteira do exemplo (18% médio) fica aderente
  await expect(page.getByTestId('ind-aderencia')).toHaveText('Aderente');
});

test('(positivo) VISÃO ALTO RISCO: ações de maior retorno + perfil agressivo', async ({ page }) => {
  await page.getByTestId('filtro-perfil').selectOption('agressivo');
  await page.getByTestId('campo-categoria').selectOption('acoes');
  await page.getByTestId('campo-produto').fill('Ações Growth');
  await page.getByTestId('campo-valor').fill('15000');
  await page.getByTestId('campo-rentab').fill('18'); // retorno esperado maior
  await page.getByTestId('campo-dy').fill('4');
  await page.getByTestId('campo-dias').fill('365');
  await page.getByTestId('adicionar').click();
  // a ação entra no grupo de risco ALTO e aparece na renda passiva
  await expect(page.getByTestId('grupo-alto')).toContainText('Ações Growth');
  await expect(page.getByTestId('div-lista')).toContainText('Ações Growth');
  // com perfil agressivo a carteira cabe no perfil
  await expect(page.getByTestId('ind-aderencia')).toHaveText('Aderente');
});

test('(positivo) META de renda passiva: quanto falta investir para R$ 1.000/mês', async ({
  page,
}) => {
  await page.getByTestId('meta-mensal').fill('1000');
  await page.getByTestId('meta-dy').fill('6');
  // 1.000/mês a 6% a.a. => precisa de ~R$ 200 mil investido
  await expect(page.getByTestId('meta-resultado')).toContainText('200.000');
  await expect(page.getByTestId('meta-resultado')).toContainText('faltam investir');
  // meta ligada ao plano: mostra quanto aportar por mês para chegar lá
  await page.getByTestId('meta-anos').fill('10');
  await page.getByTestId('plano-taxa').fill('10.65');
  await expect(page.getByTestId('meta-plano')).toContainText('aporte cerca de');
  await expect(page.getByTestId('meta-plano')).toContainText('/mês');
});
