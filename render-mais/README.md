# Render Mais — simulador para aumentar a rentabilidade

**Render Mais** ajuda você a **ganhar mais** com a carteira de renda fixa por dois
caminhos: **(1) trocando aplicações de baixo rendimento** (poupança, CDB PRÉ fraco)
por opções melhores, e **(2) começando um plano mensal de aportes** para os lucros
crescerem no tempo (juros compostos). Roda 100% no navegador, sem servidor.

> Projeto didático do experimento **IA na Prática**: construído em passos pequenos,
> cada um com testes dos dois lados (positivo e negativo), clean code comentado,
> acessibilidade WCAG AA e registro do caminho em `GLOSSARIO.md`, `RESUMAO.md` e
> `PROMPTS.md`. Nasceu como "Renda Fixa Conservadora" e virou "Render Mais" quando
> o foco passou a ser **aumentar a renda** (ver `PROMPTS.md`, Prompt 13).

## O conceito (por que o app existe)

O objetivo é **maximizar o retorno líquido**. Cada aporte tem uma **rentabilidade
líquida anualizada** (o "juro real no bolso", já descontado o IR); o app compara a
sua com **alvos de referência** e mostra **o que trocar** e **quanto você ganha**.
O risco (muito baixo → baixo → médio → alto) é **bússola**, não amarra: você
escolhe o **perfil-alvo** e vê se a carteira cabe nele.

### As duas alavancas

1. **Trocar o que rende pouco** — o cartão "Como render mais" lista as trocas
   ordenadas pelo **ganho em R$/ano**, e o botão **"Simular trocas"** mostra o
   **antes × depois** (rentabilidade média e renda anual) e o veredito: *aumenta
   ou não?*.
2. **Plano mensal** — projeta, por **juros compostos**, quanto um aporte mensal
   vira em N anos (total investido × montante final × ganho em juros).

### Fundamentação (com fontes)

- **Teoria Moderna do Portfólio** — Harry Markowitz (1952, *Journal of Finance*;
  Nobel 1990): diversificação e **fronteira eficiente** (mais retorno para dado
  risco). [Wikipédia](https://pt.wikipedia.org/wiki/Teoria_moderna_do_portf%C3%B3lio)
- **Suitability / perfil do investidor** — Resolução CVM 30/2021.
  [CVM — Guia de Suitability](https://www.gov.br/investidor/pt-br/educacional/publicacoes-educacionais/guias/guia-de-suitability-lancamento)
- **CDI e Selic** — a régua da renda fixa. [Investidor10 — CDI](https://investidor10.com.br/indices/cdi/)
- **IR regressivo** — 22,5% → 15% conforme o prazo; **LCI/LCA e poupança isentas**.
- **FGC** — garante R$ 250 mil por CPF e por instituição. [FGC](https://www.fgc.org.br/)

## Como rodar

Não precisa de build. Basta um servidor estático (por causa do `fetch` do
`logica.js` em alguns navegadores, sirva por HTTP em vez de abrir o arquivo):

```bash
cd render-mais
python3 -m http.server 8139
# abra http://localhost:8139/index.html
```

Carregue a **carteira de exemplo** (botão no fim da carteira) para ver o app cheio.

## Como testar

```bash
npm install          # instala Jest, Playwright, ESLint, Prettier, Husky
npm test             # unitários (Jest) das funções puras de logica.js
npm run test:e2e     # E2E (Playwright) dos fluxos de tela — sobe o servidor sozinho
npm run lint         # ESLint
npm run format       # Prettier --write
```

**Tutorial ao vivo:** `npm run tutorial` abre o navegador (headed) e percorre o
fluxo completo de simulações, narrando cada passo no terminal. Ele **sobe o próprio
servidor** numa porta livre — não precisa iniciar nada à parte.

**Simulador de cenários (aprender a simular):** cada script abre o navegador,
carrega a carteira default de R$ 88 mil e demonstra **uma situação de troca** por
vez, narrando qual função pura está por trás. Rode o cenário que quer aprender:

```bash
npm run cenario:baixo            # trocar sem aumentar o risco
npm run cenario:medio            # subir um degrau de risco (perfil moderado)
npm run cenario:alto             # buscar mais retorno com ações (perfil agressivo)
npm run cenario:dividendos       # montar renda passiva com boas pagadoras
npm run cenario:plano            # da meta de renda ao aporte mensal necessário
npm run cenario:troca-poupanca   # sair da poupança e entrar numa LCI melhor
npm run cenario:tudo             # todos, em sequência
npm run test:e2e:riscos          # o E2E que compara baixo/médio/alto risco
```

Dica: `LENTO=2500 npm run cenario:baixo` deixa as pausas maiores.

## Arquitetura

- **`index.html`** — telas e estilos (design tokens da inspiração **XP**: preto +
  amarelo). Só chama as funções puras via `window.Logica`; **nenhuma regra de
  negócio no HTML**.
- **`logica.js`** — todas as regras em **funções puras** (mesma entrada → mesma
  saída, sem tela/armazenamento). Export dual: Node/Jest e navegador.
- **`localStorage`** — carteira (`rfc.aportes`) e preferências (`rfc.prefs`).
- **Testes** — `logica.test.js` (unitários) e `e2e/app.spec.js` (Playwright),
  localizando elementos por `data-testid`.

### Principais funções puras (ver TUTORIAL ao vivo em `tutorial.js`)

| Função | O que faz |
|---|---|
| `rendimentoLiquido` / `rendimentoLiquidoDeAporte` | rendimento líquido (RF por % do CDI + IR; RV pela rentabilidade esperada) |
| `taxaLiquidaAnualizada` | rentabilidade líquida em % ao ano (régua justa entre prazos) |
| `nivelDeRisco` / `agruparPorRisco` | classifica e agrupa por risco (muito baixo → alto) com peso |
| `aderenciaPerfil` | a carteira cabe no teto de risco do perfil-alvo? |
| `sugestoesRebalanceamento` / `simularMelhoria` | dicas de troca e o antes × depois do ganho |
| `projetarPlanoMensal` | valor futuro de aportes mensais por juros compostos |
| `serializarAportes` / `exportarJson` | persistência e exportação (LGPD) |
| `luminancia` / `razaoContraste` / `nivelWcag` | auditoria de contraste WCAG ao vivo |
| `validarEspacamento` | garante por teste que nada fica "colado" (folga > 0,5px) |

## Subir o repositório (para quem está começando)

```bash
git init
git add .
git commit -m "Render Mais — simulador de rentabilidade"
npm install                     # o script "prepare" ativa o hook de pre-commit (Husky)
gh repo create render-mais --public --source=. && git push -u origin main
```

A partir daí, **todo commit passa pelo lint + format do Husky** antes de entrar.
O `.gitignore` garante que só sobe fonte (fora `node_modules/`, artefatos de teste,
`.DS_Store` e a pasta `docs/` com prints da carteira real).

## Aviso

Simulação **didática** com dados fictícios. As dicas comparam **rentabilidade**;
antes de trocar, considere **liquidez**, **objetivo** (ex.: o Tesouro Selic costuma
ser a reserva de emergência) e o **teto do FGC**. Para **renda variável**
(ações/multimercado) não há garantia — você informa a rentabilidade **esperada**.
