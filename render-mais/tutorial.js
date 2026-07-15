// tutorial.js — TUTORIAL AO VIVO do "Render Mais".
// Abre o navegador (headed) e percorre o fluxo completo de simulações, narrando
// cada passo no terminal e explicando qual FUNÇÃO PURA está por trás de cada tela.
//
// Como rodar (não precisa subir servidor à parte — este script já faz isso):
//   npm run tutorial            (ou: node tutorial.js)
// Dica: exporte LENTO=2000 para pausas maiores (LENTO=2000 node tutorial.js).

const { chromium } = require('@playwright/test');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const PAUSA = Number(process.env.LENTO || 1400); // ms entre passos
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
};

// Sobe um servidor estático simples desta pasta, numa porta livre (0). Devolve o
// servidor e a URL. Blindado contra path traversal (só serve dentro de __dirname).
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

// Narra no terminal e espera um tempo, para dar para acompanhar na tela.
async function passo(page, titulo, explicacao) {
  console.log(`\n▶ ${titulo}\n  ${explicacao}`);
  await page.waitForTimeout(PAUSA);
}

(async () => {
  const { srv, porta } = await iniciarServidor();
  const URL = `http://localhost:${porta}/index.html`;
  console.log(`(servidor local em ${URL})`);
  const browser = await chromium.launch({ headless: false, slowMo: 250 });
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
  await page.goto(URL);
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  console.log('=== Tutorial ao vivo — Render Mais ===');

  await passo(
    page,
    '1. Carregar a carteira de exemplo',
    'Botão "Carregar carteira de exemplo" popula 12 aportes fictícios (estrutura real, R$ 88.344). Persistidos por serializarAportes() no localStorage.'
  );
  await page.getByTestId('carregar-exemplo').click();

  await passo(
    page,
    '2. Painel da carteira',
    'totalCarteira() soma o patrimônio; rendimentoLiquidoCarteira() o rendimento; agruparPorRisco() a composição (muito baixo→alto); aderenciaPerfil() diz se cabe no perfil.'
  );
  await page.getByTestId('dashboard').scrollIntoViewIfNeeded();

  await passo(
    page,
    '3. Como render mais (dicas)',
    'sugestoesRebalanceamento() compara cada aporte com o melhor alvo (melhorAlvoMelhoria) e ordena as trocas pelo ganho em R$/ano.'
  );
  await page.getByTestId('melhoria').scrollIntoViewIfNeeded();

  await passo(
    page,
    '4. Simular trocas (antes × depois)',
    'simularMelhoria() aplica as trocas (aplicarMelhorias) e compara a rentabilidade média (rentabilidadeMediaAnual) e a renda/ano — o veredito diz se aumenta.'
  );
  await page.getByTestId('simular-trocas').click();
  await page.getByTestId('simulacao-resultado').scrollIntoViewIfNeeded();
  await page.waitForTimeout(PAUSA);

  await passo(
    page,
    '5. Plano mensal (juros compostos)',
    'projetarPlanoMensal() projeta um aporte mensal por juros compostos: total investido × montante final × ganho.'
  );
  await page.getByTestId('plano').scrollIntoViewIfNeeded();
  await page.getByTestId('plano-aporte').fill('800');
  await page.getByTestId('plano-anos').fill('15');
  await page.waitForTimeout(PAUSA);

  await passo(
    page,
    '6. Renda variável (ações)',
    'Ao escolher Ações, o formulário troca "% do CDI" por "rentabilidade esperada" (ehRendaVariavel); nivelDeRisco() classifica como risco alto.'
  );
  await page.getByTestId('campo-produto').scrollIntoViewIfNeeded();
  await page.getByTestId('campo-categoria').selectOption('acoes');
  await page.getByTestId('campo-produto').fill('Ações Tech BR');
  await page.getByTestId('campo-valor').fill('1500');
  await page.getByTestId('campo-rentab').fill('14');
  await page.getByTestId('campo-dias').fill('365');
  await page.waitForTimeout(PAUSA);
  await page.getByTestId('adicionar').click();

  await passo(
    page,
    '7. Filtrar por risco alto',
    'filtrarAportes() peneira a lista; a preferência é salva (rfc.prefs) e reaplicada ao reabrir.'
  );
  await page.getByTestId('filtro-risco').selectOption('alto');
  await page.getByTestId('lista-carteira').scrollIntoViewIfNeeded();
  await page.waitForTimeout(PAUSA);

  await passo(
    page,
    '8. Ciclo de status',
    'avancarAporte()/voltarAporte() movem o aporte Planejado → Aplicado → Resgatável → Resgatado, carimbando datas.'
  );
  const primeiro = page.getByTestId('lista-carteira').locator('li').first();
  await primeiro.getByRole('button', { name: /Avançar/ }).click();
  await page.waitForTimeout(PAUSA);

  await passo(
    page,
    '9. Exportar (LGPD)',
    'exportarJson() empacota carteira + preferências; o dado é seu. (Aqui só demonstramos o botão.)'
  );
  await page.getByTestId('filtro-risco').selectOption('');
  await page.getByTestId('exportar').scrollIntoViewIfNeeded();
  await page.waitForTimeout(PAUSA);

  console.log('\n✓ Fim do tutorial. Fechando em alguns segundos...');
  await page.waitForTimeout(3000);
  await browser.close();
  srv.close();
})();
