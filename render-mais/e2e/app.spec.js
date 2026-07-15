// e2e/app.spec.js — teste E2E da primeira tela (Playwright).
// Cobre a tela: index.html. Convenção: (positivo) o que deve funcionar,
// (negativo) o que deve ser bloqueado/dar erro.
const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  // Cada teste começa com o localStorage limpo, para um não vazar estado no outro.
  await page.goto('/index.html');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('(positivo) a primeira tela carrega com o formulário de novo aporte', async ({ page }) => {
  await expect(page).toHaveTitle(/Render Mais/);
  await expect(page.getByRole('heading', { name: 'Novo aporte' })).toBeVisible();
  await expect(page.getByTestId('campo-produto')).toBeVisible();
  await expect(page.getByTestId('reiniciar')).toBeVisible();
});

test('(positivo) a prévia calcula rendimento líquido e risco ao vivo', async ({ page }) => {
  await page.getByTestId('campo-produto').fill('CDB Banco Médio');
  await page.getByTestId('campo-categoria').selectOption('cdb-di');
  await page.getByTestId('campo-valor').fill('1000');
  await page.getByTestId('campo-pctcdi').fill('110');
  await page.getByTestId('campo-dias').fill('365');
  // CDB DI é risco "baixo" e tributado -> mostra bruto, IR e líquido em reais.
  await expect(page.getByTestId('previa-risco')).toHaveText('baixo');
  await expect(page.getByTestId('previa-bruto')).toContainText('R$');
  await expect(page.getByTestId('previa-ir')).toContainText('−');
  await expect(page.getByTestId('previa-liquido')).toContainText('R$');
});

test('(positivo) produto isento (Letra) mostra IR "Isento"', async ({ page }) => {
  await page.getByTestId('campo-produto').fill('LCI Habitação');
  await page.getByTestId('campo-categoria').selectOption('letra');
  await page.getByTestId('campo-valor').fill('1000');
  await page.getByTestId('campo-pctcdi').fill('95');
  await page.getByTestId('campo-dias').fill('365');
  await expect(page.getByTestId('previa-risco')).toHaveText('baixo');
  await expect(page.getByTestId('previa-ir')).toHaveText('Isento');
});

test('(negativo) valor zero é bloqueado com lista de erros', async ({ page }) => {
  await page.getByTestId('campo-produto').fill('Aporte X');
  await page.getByTestId('campo-valor').fill('0');
  await page.getByTestId('campo-pctcdi').fill('100');
  await page.getByTestId('campo-dias').fill('365');
  await page.getByTestId('adicionar').click();
  const erros = page.getByTestId('erros');
  await expect(erros).toBeVisible();
  await expect(erros).toContainText('valor deve ser um número maior que zero');
  // nada entrou na carteira
  await expect(page.getByTestId('contador')).toHaveText('(0 aportes)');
});

test('(positivo) o aporte persiste após recarregar a página', async ({ page }) => {
  await page.getByTestId('campo-produto').fill('Tesouro Selic 2031');
  await page.getByTestId('campo-categoria').selectOption('tesouro');
  await page.getByTestId('campo-valor').fill('5000');
  await page.getByTestId('campo-pctcdi').fill('100');
  await page.getByTestId('campo-dias').fill('365');
  await page.getByTestId('adicionar').click();
  await expect(page.getByTestId('contador')).toHaveText('(1 aporte)');
  await expect(page.getByTestId('lista-carteira')).toContainText('Tesouro Selic 2031');
  // recarrega: o aporte tem de continuar lá (veio do localStorage)
  await page.reload();
  await expect(page.getByTestId('contador')).toHaveText('(1 aporte)');
  await expect(page.getByTestId('lista-carteira')).toContainText('Tesouro Selic 2031');
});

test('(positivo) a carteira agrupa os aportes por nível de risco', async ({ page }) => {
  const salvar = async (produto, categoria, valor) => {
    await page.getByTestId('campo-produto').fill(produto);
    await page.getByTestId('campo-categoria').selectOption(categoria);
    await page.getByTestId('campo-valor').fill(valor);
    await page.getByTestId('campo-pctcdi').fill('100');
    await page.getByTestId('campo-dias').fill('365');
    await page.getByTestId('adicionar').click();
  };
  await salvar('Tesouro Selic 2031', 'tesouro', '7500'); // muito baixo
  await salvar('CDB DI Banco X', 'cdb-di', '2500'); // baixo
  // dois grupos aparecem, na ordem, com peso 75% e 25% (7.500 e 2.500 de 10.000)
  const mb = page.getByTestId('grupo-muito-baixo');
  const b = page.getByTestId('grupo-baixo');
  await expect(mb).toContainText('muito baixo');
  await expect(mb).toContainText('75% da carteira');
  await expect(mb).toContainText('Tesouro Selic 2031');
  await expect(b).toContainText('25% da carteira');
  await expect(b).toContainText('CDB DI Banco X');
});

test('(positivo) o aporte avança e volta no ciclo de status', async ({ page }) => {
  await page.getByTestId('campo-produto').fill('CDB Teste');
  await page.getByTestId('campo-categoria').selectOption('cdb-di');
  await page.getByTestId('campo-valor').fill('1000');
  await page.getByTestId('campo-pctcdi').fill('100');
  await page.getByTestId('campo-dias').fill('365');
  await page.getByTestId('adicionar').click();
  const item = page.getByTestId('grupo-baixo').locator('li').first();
  // começa Planejado; "Voltar" desabilitado no início
  await expect(item).toContainText('Planejado');
  await expect(item.getByRole('button', { name: /Voltar/ })).toBeDisabled();
  // avança um passo -> Aplicado
  await item.getByRole('button', { name: /Avançar/ }).click();
  await expect(page.getByTestId('grupo-baixo').locator('li').first()).toContainText('Aplicado');
  // volta um passo -> Planejado de novo
  await page
    .getByTestId('grupo-baixo')
    .locator('li')
    .first()
    .getByRole('button', { name: /Voltar/ })
    .click();
  await expect(page.getByTestId('grupo-baixo').locator('li').first()).toContainText('Planejado');
});

test('(positivo) o dashboard mostra patrimônio, aderência e alertas', async ({ page }) => {
  const dash = page.getByTestId('dashboard');
  // carteira conservadora (só Tesouro) -> aderente, sem alertas
  await page.getByTestId('campo-produto').fill('Tesouro Selic 2031');
  await page.getByTestId('campo-categoria').selectOption('tesouro');
  await page.getByTestId('campo-valor').fill('10000');
  await page.getByTestId('campo-pctcdi').fill('100');
  await page.getByTestId('campo-dias').fill('365');
  await page.getByTestId('adicionar').click();
  await expect(page.getByTestId('ind-total')).toContainText('10.000');
  await expect(page.getByTestId('ind-aderencia')).toHaveText('Aderente');
  // conservadora não gera alerta de risco (pode alertar concentração, pois é 1 só aporte)
  await expect(page.getByTestId('alertas')).not.toContainText('Risco médio');
  // carteira de exemplo tem 18% em risco médio -> fora do perfil + alerta
  // (carteira não vazia => aparece o confirm de substituição; aceitamos)
  page.once('dialog', (d) => d.accept());
  await page.getByTestId('carregar-exemplo').click();
  await expect(dash.getByTestId('ind-aderencia')).toHaveText('Fora do perfil');
  await expect(page.getByTestId('alertas')).toContainText('Risco médio');
});

test('(positivo) carregar carteira de exemplo popula e persiste', async ({ page }) => {
  await page.getByTestId('carregar-exemplo').click();
  // os 3 níveis de risco aparecem (a carteira de exemplo cobre todos)
  await expect(page.getByTestId('grupo-muito-baixo')).toBeVisible();
  await expect(page.getByTestId('grupo-baixo')).toBeVisible();
  await expect(page.getByTestId('grupo-medio')).toBeVisible();
  await expect(page.getByTestId('lista-carteira')).toContainText('Tesouro Selic 2031');
  // persiste após recarregar
  await page.reload();
  await expect(page.getByTestId('lista-carteira')).toContainText('Tesouro Selic 2031');
});

test('(positivo) filtro por risco e perfil-alvo persistem após recarregar', async ({ page }) => {
  await page.getByTestId('carregar-exemplo').click();
  // filtra por risco médio -> só o grupo médio aparece
  await page.getByTestId('filtro-risco').selectOption('médio');
  await expect(page.getByTestId('grupo-medio')).toBeVisible();
  await expect(page.getByTestId('grupo-muito-baixo')).toHaveCount(0);
  await expect(page.getByTestId('contador')).toContainText('de 12 aportes');
  // muda o perfil-alvo para agressivo -> a mesma carteira passa a ser aderente
  await page.getByTestId('filtro-perfil').selectOption('agressivo');
  await expect(page.getByTestId('ind-aderencia')).toHaveText('Aderente');
  // recarrega: filtro e perfil continuam aplicados
  await page.reload();
  await expect(page.getByTestId('filtro-risco')).toHaveValue('médio');
  await expect(page.getByTestId('filtro-perfil')).toHaveValue('agressivo');
  await expect(page.getByTestId('grupo-muito-baixo')).toHaveCount(0);
  await expect(page.getByTestId('ind-aderencia')).toHaveText('Aderente');
});

test('(positivo) o simulador sugere trocar produtos de baixo rendimento', async ({ page }) => {
  await page.getByTestId('carregar-exemplo').click();
  const melhoria = page.getByTestId('melhoria');
  // o exemplo tem Poupança (70% CDI) -> deve virar dica com ganho anual
  await expect(melhoria).toContainText('sua renda subiria');
  await expect(page.getByTestId('dicas')).toContainText('Poupança BB');
  await expect(page.getByTestId('dicas')).toContainText('/ano');
  // cada dica mostra a mudança de risco e o IR descontado
  await expect(page.getByTestId('dicas')).toContainText('risco');
  await expect(page.getByTestId('dicas')).toContainText('IR descontado');
  // Tesouro (muito baixo) → LCI (baixo) deve sinalizar que o risco sobe
  await expect(page.getByTestId('dicas')).toContainText('risco sobe');
});

test('(positivo) dividendos: ações com DY viram renda passiva', async ({ page }) => {
  await page.getByTestId('carregar-exemplo').click();
  const div = page.getByTestId('dividendos');
  // o exemplo tem ações com DY -> renda passiva por ano e por mês, e a lista por ativo
  await expect(div.getByTestId('div-anual')).not.toHaveText('—');
  await expect(div.getByTestId('div-mensal')).not.toHaveText('—');
  await expect(page.getByTestId('div-lista')).toContainText('Ações Bolsa Brasil');
  await expect(page.getByTestId('div-lista')).toContainText('a.a.');
});

test('(negativo) DY alto demais dispara alerta de yield trap', async ({ page }) => {
  await page.getByTestId('campo-produto').fill('Ação Furada');
  await page.getByTestId('campo-categoria').selectOption('acoes');
  await page.getByTestId('campo-valor').fill('1000');
  await page.getByTestId('campo-rentab').fill('8');
  await page.getByTestId('campo-dy').fill('25'); // 25% -> suspeito
  await page.getByTestId('campo-dias').fill('365');
  await page.getByTestId('adicionar').click();
  await expect(page.getByTestId('alertas')).toContainText('yield trap');
});

test('(positivo) renda variável: campo de rentabilidade aparece e cai no risco alto', async ({
  page,
}) => {
  // ao escolher Ações, some o "% do CDI" e aparece a "rentabilidade esperada"
  await page.getByTestId('campo-categoria').selectOption('acoes');
  await expect(page.getByTestId('campo-rentab')).toBeVisible();
  await expect(page.getByTestId('campo-pctcdi')).toBeHidden();
  await expect(page.getByTestId('previa-risco')).toHaveText('alto');
  // cadastra uma ação -> aparece o grupo de risco alto
  await page.getByTestId('campo-produto').fill('Ações XPTO');
  await page.getByTestId('campo-valor').fill('1000');
  await page.getByTestId('campo-rentab').fill('12');
  await page.getByTestId('campo-dias').fill('365');
  await page.getByTestId('adicionar').click();
  await expect(page.getByTestId('grupo-alto')).toContainText('Ações XPTO');
});

test('(positivo) plano mensal projeta montante maior que o total investido', async ({ page }) => {
  await page.getByTestId('plano-aporte').fill('500');
  await page.getByTestId('plano-anos').fill('10');
  await page.getByTestId('plano-taxa').fill('10.65');
  await expect(page.getByTestId('plano-investido')).toContainText('60.000'); // 500×120
  // com juros, o montante final é bem maior que 60 mil
  await expect(page.getByTestId('plano-ganho')).toContainText('+');
  await expect(page.getByTestId('plano-dica')).toContainText('só de juros');
});

test('(positivo) "só trocas sem subir o risco" remove as trocas que sobem o risco', async ({
  page,
}) => {
  await page.getByTestId('carregar-exemplo').click();
  // sem restrição: aparece pelo menos uma troca que sobe o risco (Tesouro/Poupança)
  await expect(page.getByTestId('dicas')).toContainText('risco sobe');
  // marca a opção -> some "risco sobe" e a preferência persiste
  await page.getByTestId('manter-risco').check();
  await expect(page.getByTestId('dicas')).not.toContainText('risco sobe');
  await page.reload();
  await expect(page.getByTestId('manter-risco')).toBeChecked();
  await expect(page.getByTestId('dicas')).not.toContainText('risco sobe');
});

test('(positivo) simular trocas mostra o antes × depois e o ganho', async ({ page }) => {
  await page.getByTestId('carregar-exemplo').click();
  await page.getByTestId('simular-trocas').click();
  const resultado = page.getByTestId('simulacao-resultado');
  await expect(resultado).toBeVisible();
  await expect(resultado).toContainText('Rentabilidade média');
  await expect(resultado).toContainText('→'); // antes → depois
  await expect(resultado).toContainText('Sua rentabilidade aumenta');
  await expect(resultado).toContainText('/ano');
});

test('(positivo) CDB ótimo não tem troca melhor mantendo o risco', async ({ page }) => {
  // Com "não aumentar o risco" ligado, um CDB a 130% do CDI não tem alvo melhor
  // no mesmo nível (a debênture isenta o superaria, mas subiria o risco).
  await page.getByTestId('manter-risco').check();
  await page.getByTestId('campo-produto').fill('CDB Excelente');
  await page.getByTestId('campo-categoria').selectOption('cdb-di');
  await page.getByTestId('campo-valor').fill('10000');
  await page.getByTestId('campo-pctcdi').fill('130');
  await page.getByTestId('campo-dias').fill('365');
  await page.getByTestId('adicionar').click();
  await expect(page.getByTestId('melhoria-resumo')).toContainText('mantendo o risco atual');
});

test('(positivo/negativo) remover um aporte pede confirmação', async ({ page }) => {
  // cria dois aportes
  const salvar = async (produto, valor) => {
    await page.getByTestId('campo-produto').fill(produto);
    await page.getByTestId('campo-categoria').selectOption('cdb-di');
    await page.getByTestId('campo-valor').fill(valor);
    await page.getByTestId('campo-pctcdi').fill('100');
    await page.getByTestId('campo-dias').fill('365');
    await page.getByTestId('adicionar').click();
  };
  await salvar('CDB Alfa', '5000');
  await salvar('CDB Beta', '3000');
  await expect(page.getByTestId('contador')).toHaveText('(2 aportes)');

  // (negativo) cancela a confirmação -> nada muda
  page.once('dialog', (d) => d.dismiss());
  await page
    .getByTestId('lista-carteira')
    .getByRole('button', { name: 'Remover CDB Alfa' })
    .click();
  await expect(page.getByTestId('contador')).toHaveText('(2 aportes)');

  // (positivo) confirma -> remove e persiste
  page.once('dialog', (d) => d.accept());
  await page
    .getByTestId('lista-carteira')
    .getByRole('button', { name: 'Remover CDB Alfa' })
    .click();
  await expect(page.getByTestId('contador')).toHaveText('(1 aporte)');
  await expect(page.getByTestId('lista-carteira')).not.toContainText('CDB Alfa');
  await page.reload();
  await expect(page.getByTestId('contador')).toHaveText('(1 aporte)');
});

test('(positivo) exportar baixa a carteira em JSON', async ({ page }) => {
  await page.getByTestId('carregar-exemplo').click();
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByTestId('exportar').click(),
  ]);
  expect(download.suggestedFilename()).toBe('carteira-renda-fixa.json');
});

test('(positivo) reiniciar limpa todos os dados (LGPD)', async ({ page }) => {
  await page.getByTestId('carregar-exemplo').click();
  await expect(page.getByTestId('contador')).toContainText('12 aportes');
  page.once('dialog', (d) => d.accept());
  await page.getByTestId('reiniciar').click();
  await expect(page.getByTestId('contador')).toHaveText('(0 aportes)');
  await expect(page.getByTestId('carteira-vazia')).toBeVisible();
});

test('(negativo) dado corrompido no localStorage não quebra o app', async ({ page }) => {
  await page.evaluate(() => localStorage.setItem('rfc.aportes', '{isto não é json'));
  await page.reload();
  // app carrega normalmente, carteira vazia, sem erro
  await expect(page.getByTestId('contador')).toHaveText('(0 aportes)');
  await expect(page.getByRole('heading', { name: 'Novo aporte' })).toBeVisible();
});

test('(positivo) o rodapé audita o contraste WCAG ao vivo', async ({ page }) => {
  const contraste = page.getByTestId('contraste');
  await expect(contraste).toContainText('Texto / fundo');
  // O par texto/fundo da paleta XP não pode estar reprovado.
  await expect(contraste.locator('li').first()).not.toContainText('reprovado');
});

test('(positivo) painel de siglas abre, mostra as legendas e fecha', async ({ page }) => {
  const painel = page.getByTestId('painel-siglas');
  await expect(painel).toBeHidden();
  await page.getByTestId('abrir-siglas').click();
  await expect(painel).toBeVisible();
  await expect(page.getByTestId('abrir-siglas')).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByTestId('siglas-lista')).toContainText('CDB');
  await expect(page.getByTestId('siglas-lista')).toContainText('Fundo Garantidor de Créditos');
  await page.getByTestId('fechar-siglas').click();
  await expect(painel).toBeHidden();
});

test('(positivo) acessibilidade: skip-link, rótulos e contraste sem reprovação', async ({
  page,
}) => {
  // skip-link aponta para o conteúdo principal
  await expect(page.getByTestId('pular-link')).toHaveAttribute('href', '#conteudo');
  // campos do formulário têm rótulo acessível (getByLabel encontra pelo <label for>)
  await expect(page.getByLabel('Produto')).toBeVisible();
  await expect(page.getByLabel('Valor aplicado (R$)')).toBeVisible();
  await expect(page.getByLabel('% do CDI')).toBeVisible();
  await expect(page.getByLabel('Prazo (dias corridos)')).toBeVisible();
  // nenhum par de cor do rodapé pode estar reprovado
  await expect(page.getByTestId('contraste')).not.toContainText('reprovado');
});

test('(positivo) navegação por teclado alcança o botão de adicionar', async ({ page }) => {
  await page.getByTestId('campo-produto').focus();
  await expect(page.getByTestId('campo-produto')).toBeFocused();
  // o botão "Adicionar à carteira" é acionável por teclado
  await page.getByTestId('campo-produto').fill('CDB Teclado');
  await page.getByTestId('campo-valor').fill('1000');
  await page.getByTestId('campo-pctcdi').fill('100');
  await page.getByTestId('campo-dias').fill('365');
  await page.getByTestId('adicionar').press('Enter');
  await expect(page.getByTestId('contador')).toHaveText('(1 aporte)');
});

test('(positivo) fluxo crítico: cadastrar → painel → filtrar → exportar', async ({ page }) => {
  await page.getByTestId('campo-produto').fill('Tesouro Reserva');
  await page.getByTestId('campo-categoria').selectOption('tesouro');
  await page.getByTestId('campo-valor').fill('10000');
  await page.getByTestId('campo-pctcdi').fill('100');
  await page.getByTestId('campo-dias').fill('365');
  await page.getByTestId('adicionar').click();
  // painel reflete
  await expect(page.getByTestId('ind-total')).toContainText('10.000');
  // filtra por muito baixo (o tesouro aparece)
  await page.getByTestId('filtro-risco').selectOption('muito baixo');
  await expect(page.getByTestId('grupo-muito-baixo')).toContainText('Tesouro Reserva');
  // exporta
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByTestId('exportar').click(),
  ]);
  expect(download.suggestedFilename()).toBe('carteira-renda-fixa.json');
});

test('(negativo→positivo) nenhum controle fica colado/sobreposto (folga > 0,5px)', async ({
  page,
}) => {
  // Roda a MESMA função pura (window.Logica.validarEspacamento) sobre as caixas
  // REAIS dos controles da tela. Pega botão/campo "grudado" na margem ou no vizinho.
  const relatorio = await page.evaluate((minPx) => {
    const els = Array.from(document.querySelectorAll('input, select, button'));
    const caixas = els.map((el, i) => {
      const r = el.getBoundingClientRect();
      const nome = el.getAttribute('data-testid') || el.tagName.toLowerCase() + '#' + i;
      return { nome, caixa: { left: r.left, right: r.right, top: r.top, bottom: r.bottom } };
    });
    return window.Logica.validarEspacamento(caixas, minPx);
  }, 0.5);
  expect(relatorio.violacoes, JSON.stringify(relatorio.violacoes, null, 2)).toEqual([]);
});
