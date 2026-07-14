/*
 * e2e/painel.spec.js — Testes de COMPONENTE (Playwright) do Painel do contencioso
 * e dos cartões de decisão. Semeiam cenários controlados no localStorage e
 * conferem como os componentes reagem (indicadores do painel, espécie e valores
 * no cartão). Dados sempre FICTÍCIOS (LGPD).
 */
const { test, expect } = require('@playwright/test');

// Datas robustas (independentes do "hoje" real da máquina de teste).
const FUTURO = '2099-12-31'; // prazo em aberto
const PASSADO = '2000-01-01'; // prazo vencido

function decisao(o) {
  return Object.assign(
    {
      id: 'seed-' + (o.numeroProcesso || Math.random()),
      criadoEm: '2026-07-10T12:00:00.000Z',
      orgaoVara: '3ª Vara Cível',
      tipoLide: 'cobranca-indevida',
      orgaoJulgador: 'singular',
      resolveuMerito: true,
      cargaEficacia: 'condenatoria',
      resultado: 'procedente',
      valorCausa: 10000,
      valorCondenacao: 0,
      faseRecursal: 'primeiro-grau',
      dataTransito: null,
      prazoRecursalAte: FUTURO,
    },
    o
  );
}

// Semeia decisões e recarrega para o app renderizar a partir delas.
async function semear(page, lista) {
  await page.evaluate((dados) => {
    localStorage.setItem('instancia:decisoes', JSON.stringify(dados));
    localStorage.removeItem('instancia:prefs');
  }, lista);
  await page.reload();
}

// Lê o número de um tile do painel pelo seu rótulo.
async function tile(page, rotulo) {
  const t = page.locator('#painel-tiles .tile', { hasText: rotulo });
  return (await t.locator('.numero').textContent()).trim();
}

test.beforeEach(async ({ page }) => {
  await page.goto('/index.html');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('(positivo) painel conta total, transitadas e exposição só das ativas', async ({ page }) => {
  await semear(page, [
    decisao({ numeroProcesso: 'A', faseRecursal: 'primeiro-grau', valorCausa: 10000 }),
    decisao({ numeroProcesso: 'B', faseRecursal: 'apelacao', valorCausa: 20000 }),
    decisao({ numeroProcesso: 'C', faseRecursal: 'transitado', valorCausa: 99999 }),
  ]);
  expect(await tile(page, 'Total de decisões')).toBe('3');
  expect(await tile(page, 'Transitadas em julgado')).toBe('1');
  // Exposição = 10000 + 20000 (a transitada C fica de fora).
  expect(await tile(page, 'Exposição em disputa')).toContain('30.000');
});

test('(positivo) exposição em disputa ZERA quando todas transitaram', async ({ page }) => {
  await semear(page, [
    decisao({ numeroProcesso: 'A', faseRecursal: 'transitado', valorCausa: 10000 }),
    decisao({ numeroProcesso: 'B', faseRecursal: 'transitado', valorCausa: 20000 }),
  ]);
  expect(await tile(page, 'Exposição em disputa')).toContain('0,00');
  // Sem ativa, não há "aja por esta primeiro".
  await expect(page.getByTestId('painel-destaque')).toHaveText('');
});

test('(positivo) % defendidos reflete os improcedentes', async ({ page }) => {
  await semear(page, [
    decisao({ numeroProcesso: 'A', resultado: 'improcedente' }),
    decisao({ numeroProcesso: 'B', resultado: 'improcedente' }),
    decisao({ numeroProcesso: 'C', resultado: 'procedente' }),
    decisao({ numeroProcesso: 'D', resultado: 'parcial' }),
  ]);
  expect(await tile(page, 'Defendidos')).toBe('50%'); // 2 de 4
});

test('(positivo) total condenado (a pagar) soma as condenações', async ({ page }) => {
  await semear(page, [
    decisao({ numeroProcesso: 'A', valorCondenacao: 1000 }),
    decisao({ numeroProcesso: 'B', faseRecursal: 'transitado', valorCondenacao: 2500 }),
    decisao({ numeroProcesso: 'C', resultado: 'improcedente', valorCondenacao: 0 }),
  ]);
  expect(await tile(page, 'Total condenado')).toContain('3.500');
});

test('(positivo) prazo correndo entra em "atenção" e ignora vencidos', async ({ page }) => {
  await semear(page, [
    decisao({ numeroProcesso: 'futuro', prazoRecursalAte: FUTURO }),
    decisao({ numeroProcesso: 'vencido', prazoRecursalAte: PASSADO }),
  ]);
  expect(await tile(page, 'Prazo recursal correndo')).toBe('1');
  await expect(page.locator('#painel-tiles .tile.atencao')).toHaveCount(1);
});

test('(positivo) destaque aponta a decisão de maior prioridade', async ({ page }) => {
  await semear(page, [
    decisao({
      numeroProcesso: 'baixa',
      valorCausa: 500,
      resultado: 'improcedente',
      prazoRecursalAte: null,
    }),
    decisao({
      numeroProcesso: 'alta',
      valorCausa: 500000,
      resultado: 'procedente',
      prazoRecursalAte: FUTURO,
    }),
  ]);
  await expect(page.getByTestId('painel-destaque')).toContainText('alta');
});

test('(componente) cartão mostra espécie, "Causa:" e "A pagar:" quando há condenação', async ({
  page,
}) => {
  await semear(page, [
    decisao({
      numeroProcesso: 'COND-1',
      resolveuMerito: true,
      cargaEficacia: 'condenatoria',
      orgaoJulgador: 'colegiado',
      faseRecursal: 'apelacao',
      valorCausa: 120000,
      valorCondenacao: 80000,
    }),
  ]);
  const card = page.getByTestId('decisao-card').filter({ hasText: 'COND-1' });
  await expect(card).toContainText('Definitiva · condenatória · plúrima (acórdão)');
  await expect(card).toContainText('Causa:');
  await expect(card).toContainText('A pagar:');
});

test('(componente) cartão sem mérito mostra Terminativa e não mostra "A pagar"', async ({
  page,
}) => {
  await semear(page, [
    decisao({
      numeroProcesso: 'TERM-1',
      resolveuMerito: false,
      cargaEficacia: undefined,
      resultado: 'improcedente',
      valorCondenacao: 0,
    }),
  ]);
  const card = page.getByTestId('decisao-card').filter({ hasText: 'TERM-1' });
  await expect(card).toContainText('Terminativa');
  await expect(card).not.toContainText('A pagar:');
});
