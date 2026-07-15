// simular.js — SIMULADOR DE CENÁRIOS (ao vivo, headed) do "Render Mais".
// Abre o navegador, carrega a carteira DEFAULT de R$ 88 mil e demonstra uma
// SITUAÇÃO DE TROCA/INVESTIMENTO por vez, narrando no terminal qual função pura
// está por trás. É para APRENDER A SIMULAR — cada cenário é um npm script.
//
// Uso:  node simular.js <cenario>     (ou os atalhos "npm run cenario:*")
// Cenários: baixo · medio · alto · dividendos · plano · troca-poupanca ·
//           fgc · concentracao · yield-trap · tudo
// Dica: LENTO=2500 node simular.js baixo   → pausas maiores.

const { chromium } = require('@playwright/test');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const PAUSA = Number(process.env.LENTO || 1600);
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
};

// Sobe um servidor estático desta pasta (porta livre), blindado contra traversal.
function iniciarServidor() {
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      let rel = decodeURIComponent(req.url.split('?')[0]);
      if (rel === '/') rel = '/index.html';
      const arquivo = path.join(__dirname, rel);
      if (!arquivo.startsWith(__dirname)) {
        res.statusCode = 403;
        res.end('403');
        return;
      }
      fs.readFile(arquivo, (err, data) => {
        if (err) {
          res.statusCode = 404;
          res.end('404');
          return;
        }
        res.setHeader('Content-Type', MIME[path.extname(arquivo)] || 'application/octet-stream');
        res.end(data);
      });
    });
    srv.listen(0, () => resolve({ srv, porta: srv.address().port }));
  });
}

// Helper de narração: escreve no terminal e pausa para dar tempo de acompanhar.
async function narrar(page, titulo, texto) {
  console.log(`\n▶ ${titulo}\n  ${texto}`);
  await page.waitForTimeout(PAUSA);
}

async function carregarExemplo(page) {
  await page.getByTestId('carregar-exemplo').click();
  await page.getByTestId('dashboard').scrollIntoViewIfNeeded();
}

// Lê o texto de um indicador (ex.: rendimento líquido projetado da carteira).
async function lerTexto(page, testid) {
  return (await page.getByTestId(testid).textContent()).trim();
}

// --- Cenários ---------------------------------------------------------------

const CENARIOS = {
  // BAIXO risco: trocar produtos ruins SEM aumentar o risco.
  async baixo(page) {
    await narrar(
      page,
      'Cenário BAIXO risco',
      'Trocar aplicações fracas SEM subir o risco da carteira.'
    );
    await carregarExemplo(page);
    await narrar(
      page,
      'Carteira default (R$ 88 mil)',
      `Rendimento líquido hoje: ${await lerTexto(page, 'ind-rendimento')}.`
    );
    await page.getByTestId('melhoria').scrollIntoViewIfNeeded();
    await page.getByTestId('manter-risco').check();
    await narrar(
      page,
      'Marcamos "não aumentar o risco"',
      'sugestoesRebalanceamento({manterRisco:true}) mantém só trocas de risco igual/menor.'
    );
    await page.getByTestId('simular-trocas').click();
    await page.getByTestId('simulacao-resultado').scrollIntoViewIfNeeded();
    await narrar(
      page,
      'Simular trocas',
      'simularMelhoria() mostra o antes × depois — repare que nenhuma dica "sobe o risco".'
    );
  },

  // MÉDIO risco: liberar trocas que sobem um degrau + perfil moderado.
  async medio(page) {
    await narrar(page, 'Cenário MÉDIO risco', 'Aceitar subir UM degrau de risco para ganhar mais.');
    await carregarExemplo(page);
    await page.getByTestId('melhoria').scrollIntoViewIfNeeded();
    await page.getByTestId('manter-risco').uncheck();
    await page.getByTestId('filtro-perfil').selectOption('moderado');
    await narrar(
      page,
      'Perfil moderado + trocas livres',
      'aderenciaPerfil() usa teto de 30% de risco; agora entram trocas que sobem o risco.'
    );
    await page.getByTestId('simular-trocas').click();
    await page.getByTestId('simulacao-resultado').scrollIntoViewIfNeeded();
    await narrar(
      page,
      'Simular trocas',
      'O ganho tende a ser MAIOR que no cenário baixo — mais trocas liberadas.'
    );
  },

  // ALTO risco: acrescentar ações de maior retorno + perfil agressivo.
  async alto(page) {
    await narrar(
      page,
      'Cenário ALTO risco',
      'Buscar mais retorno acrescentando ações (renda variável).'
    );
    await carregarExemplo(page);
    await page.getByTestId('filtro-perfil').selectOption('agressivo');
    await page.getByTestId('campo-categoria').selectOption('acoes');
    await narrar(
      page,
      'Nova posição em ações',
      'Ao escolher Ações, o formulário troca "% do CDI" por "rentabilidade esperada" (ehRendaVariavel).'
    );
    await page.getByTestId('campo-produto').fill('Ações Growth');
    await page.getByTestId('campo-valor').fill('15000');
    await page.getByTestId('campo-rentab').fill('18');
    await page.getByTestId('campo-dy').fill('4');
    await page.getByTestId('campo-dias').fill('365');
    await page.getByTestId('adicionar').click();
    await page.getByTestId('grupo-alto').scrollIntoViewIfNeeded();
    await narrar(
      page,
      'Risco alto na composição',
      'A ação entra no grupo "alto" (nivelDeRisco) e a rentabilidade média sobe. Com perfil agressivo, a carteira fica aderente.'
    );
  },

  // DIVIDENDOS: montar renda passiva e olhar a meta.
  async dividendos(page) {
    await narrar(page, 'Cenário DIVIDENDOS', 'Focar em renda passiva com ações pagadoras.');
    await carregarExemplo(page);
    await page.getByTestId('dividendos').scrollIntoViewIfNeeded();
    await narrar(
      page,
      'Renda passiva atual',
      `Do exemplo: ${await lerTexto(page, 'div-anual')}/ano (rendaPassivaCarteira).`
    );
    await page.getByTestId('campo-categoria').selectOption('acoes');
    await page.getByTestId('campo-produto').fill('Itaú (ITUB4)');
    await page.getByTestId('campo-valor').fill('20000');
    await page.getByTestId('campo-rentab').fill('9');
    await page.getByTestId('campo-dy').fill('7');
    await page.getByTestId('campo-dias').fill('365');
    await page.getByTestId('adicionar').click();
    await page.getByTestId('dividendos').scrollIntoViewIfNeeded();
    await narrar(
      page,
      'Adicionamos uma boa pagadora',
      `Renda passiva subiu para ${await lerTexto(page, 'div-anual')}/ano.`
    );
    await narrar(
      page,
      'Cuidado com yield trap',
      'DY acima de 15% acende alerta — dividendo alto demais costuma esconder problema.'
    );
  },

  // PLANO: da meta ao quanto aportar por mês.
  async plano(page) {
    await narrar(page, 'Cenário PLANO mensal', 'Da meta de renda ao quanto aportar por mês.');
    await carregarExemplo(page);
    await page.getByTestId('dividendos').scrollIntoViewIfNeeded();
    await page.getByTestId('meta-mensal').fill('2000');
    await page.getByTestId('meta-dy').fill('6');
    await page.getByTestId('meta-anos').fill('15');
    await narrar(
      page,
      'Meta: R$ 2.000/mês',
      'metaRendaPassiva() diz quanto precisa investir e quanto falta.'
    );
    await narrar(
      page,
      'Meta → plano',
      `aporteMensalParaMeta() responde o aporte/mês: ${await lerTexto(page, 'meta-plano')}`
    );
  },

  // TROCA CONCRETA: remover a Poupança (70% CDI) e pôr uma LCI (97% isenta).
  async 'troca-poupanca'(page) {
    await narrar(
      page,
      'Cenário TROCA de aplicação',
      'Sair da Poupança (rende pouco) e entrar numa LCI melhor.'
    );
    await carregarExemplo(page);
    await narrar(
      page,
      'Rendimento antes',
      `Rendimento líquido da carteira: ${await lerTexto(page, 'ind-rendimento')}.`
    );
    page.once('dialog', (d) => d.accept());
    await page
      .getByTestId('lista-carteira')
      .getByRole('button', { name: 'Remover Poupança BB' })
      .click();
    await narrar(
      page,
      'Removemos a Poupança BB',
      'removerAporte() tira só esse item; o resto fica intacto.'
    );
    await page.getByTestId('campo-categoria').selectOption('letra');
    await page.getByTestId('campo-produto').fill('LCI 97% do CDI');
    await page.getByTestId('campo-valor').fill('17530');
    await page.getByTestId('campo-pctcdi').fill('97');
    await page.getByTestId('campo-dias').fill('540');
    await page.getByTestId('adicionar').click();
    await page.getByTestId('dashboard').scrollIntoViewIfNeeded();
    await narrar(
      page,
      'Rendimento depois',
      `Agora: ${await lerTexto(page, 'ind-rendimento')} — a LCI isenta rende mais líquido que a poupança.`
    );
  },

  // FGC: estourar o teto de garantia (R$ 250 mil por CPF/instituição).
  async fgc(page) {
    await narrar(page, 'Cenário FGC', 'O que acontece ao passar do teto garantido de R$ 250 mil.');
    await carregarExemplo(page);
    await page.getByTestId('campo-categoria').selectOption('cdb-di');
    await page.getByTestId('campo-produto').fill('CDB Gigante do Banco X');
    await page.getByTestId('campo-valor').fill('300000');
    await page.getByTestId('campo-pctcdi').fill('100');
    await page.getByTestId('campo-dias').fill('365');
    await page.getByTestId('adicionar').click();
    await page.getByTestId('alertas').scrollIntoViewIfNeeded();
    await narrar(
      page,
      'Alerta de FGC',
      'alertasCarteira() acende: R$ 300 mil num CDB passa dos R$ 250 mil garantidos — o excedente fica sem cobertura.'
    );
  },

  // CONCENTRAÇÃO: um único produto ocupando fatia grande demais.
  async concentracao(page) {
    await narrar(page, 'Cenário CONCENTRAÇÃO', 'O risco de pôr muito ovo numa cesta só.');
    await carregarExemplo(page);
    await page.getByTestId('campo-categoria').selectOption('cdb-di');
    await page.getByTestId('campo-produto').fill('CDB Concentrado');
    await page.getByTestId('campo-valor').fill('60000');
    await page.getByTestId('campo-pctcdi').fill('100');
    await page.getByTestId('campo-dias').fill('365');
    await page.getByTestId('adicionar').click();
    await page.getByTestId('alertas').scrollIntoViewIfNeeded();
    await narrar(
      page,
      'Alerta de concentração',
      'Um aporte acima de 30% da carteira acende o alerta — diversificar (Markowitz) reduz o baque de um problema isolado.'
    );
  },

  // YIELD TRAP: ação com dividendo alto demais (armadilha).
  async 'yield-trap'(page) {
    await narrar(page, 'Cenário YIELD TRAP', 'Dividendo alto demais costuma ser armadilha.');
    await carregarExemplo(page);
    await page.getByTestId('campo-categoria').selectOption('acoes');
    await page.getByTestId('campo-produto').fill('Ação DY 25%');
    await page.getByTestId('campo-valor').fill('5000');
    await page.getByTestId('campo-rentab').fill('8');
    await page.getByTestId('campo-dy').fill('25');
    await page.getByTestId('campo-dias').fill('365');
    await page.getByTestId('adicionar').click();
    await page.getByTestId('alertas').scrollIntoViewIfNeeded();
    await narrar(
      page,
      'Alerta de yield trap',
      'DY de 25% acende o alerta: preço caiu por problema ou o provento não é recorrente — desconfie.'
    );
  },

  // TUDO: roda os cenários em sequência.
  async tudo(page) {
    const ordem = [
      'baixo',
      'medio',
      'alto',
      'dividendos',
      'plano',
      'troca-poupanca',
      'fgc',
      'concentracao',
      'yield-trap',
    ];
    for (const nome of ordem) {
      console.log(`\n=== Cenário: ${nome} ===`);
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      await CENARIOS[nome](page);
    }
  },
};

(async () => {
  const cenario = process.argv[2] || 'tudo';
  if (!CENARIOS[cenario]) {
    console.error(`Cenário desconhecido: "${cenario}".`);
    console.error(`Disponíveis: ${Object.keys(CENARIOS).join(' · ')}`);
    process.exit(1);
  }
  const { srv, porta } = await iniciarServidor();
  console.log(`=== Render Mais — simulador de cenários (${cenario}) ===`);
  console.log(`(servidor local em http://localhost:${porta})`);
  const browser = await chromium.launch({ headless: false, slowMo: 250 });
  const page = await browser.newPage({ viewport: { width: 1200, height: 950 } });
  await page.goto(`http://localhost:${porta}/index.html`);
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await CENARIOS[cenario](page);

  console.log('\n✓ Fim do cenário. Fechando em alguns segundos...');
  await page.waitForTimeout(3000);
  await browser.close();
  srv.close();
})();
