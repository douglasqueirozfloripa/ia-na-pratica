# Instruções do projeto para a IA — Render Mais

> **Arquivo de instruções ativo.** Foi gerado no Setup 0 a partir do modelo
> "estado zero" ([`../template-project/`](../template-project/)) para o tema
> **simulador de rentabilidade em renda fixa: aumentar os lucros trocando
> aplicações e/ou começando um plano mensal de aportes** (baseado no CDI). A IA lê
> este arquivo e segue TODAS as regras abaixo em CADA resposta, sem precisar que
> o usuário as repita.
>
> Onde este arquivo vive: **Claude → `CLAUDE.md`** (equivalentes: GitHub Copilot
> → `.github/copilot-instructions.md` · Cursor → `.cursor/rules`).

## O que é o projeto

- **Nome/pitch:** **Render Mais** — um simulador que ajuda a **aumentar a
  rentabilidade** da carteira de renda fixa de dois jeitos: **(1) trocando
  aplicações** de baixo rendimento (ex.: poupança, CDB PRÉ fraco) por opções
  melhores, e **(2) começando um plano mensal de aportes** para os lucros crescerem
  no tempo (juros compostos). A partir dos aportes cadastrados, calcula o
  **rendimento líquido** de cada posição (% do CDI + IR regressivo) e responde:
  **"como eu rendo mais?"**.
- **Conceito central:** **maximizar o retorno líquido** ao longo da **fronteira
  eficiente** (Teoria Moderna do Portfólio de **Markowitz**, 1952), usando o
  **nível de risco** apenas como bússola (não como amarra): o app compara a
  **rentabilidade anualizada** de cada aporte com **alvos de referência** e estima
  o **ganho** de cada troca; o **plano mensal** projeta o crescimento por **juros
  compostos**. Rendimento, rentabilidade, ganho das trocas e projeção do plano são
  **calculados por função pura** — nunca digitados à mão.
- **Resultado esperado:** a pessoa cadastra seus aportes (ou carrega o exemplo) e o
  app responde, num painel: **quanto a carteira rende líquido hoje**, **o que trocar
  para render mais** (dicas priorizadas pelo ganho em R$/ano), o **antes × depois**
  de aplicar as trocas, e **quanto um plano mensal** somaria aos lucros —
  transformando "estou parado" em **próximas ações concretas para lucrar mais**.

## Fundamentação e referências (de onde vem a ideia)

> O conceito central **não é achismo**. Referências reais, pesquisadas na
> internet no Prompt 1, com a fonte linkada. É a **base conceitual** (o "porquê"
> do app) — diferente da **inspiração visual** (paleta/estilo), que vive em
> "Qualidade visual → Design tokens" e é definida junto da primeira tela.

- **Teoria Moderna do Portfólio (Harry Markowitz, 1952 — *Journal of Finance*;
  Nobel de Economia, 1990)** — a **diversificação** reduz o risco da carteira
  abaixo da média dos ativos quando eles não são perfeitamente correlacionados, e
  a **fronteira eficiente** é o conjunto de carteiras com maior retorno para dado
  risco. Embasa a ideia de sugerir **proporções** por classe em vez de um único
  produto. Fontes:
  [Wikipédia — Teoria moderna do portfólio](https://pt.wikipedia.org/wiki/Teoria_moderna_do_portf%C3%B3lio)
  · [Suno — Harry Markowitz](https://www.suno.com.br/tudo-sobre/harry-markowitz/).
- **Suitability — Resolução CVM 30/2021** (em vigor desde 01/06/2021, substitui a
  Instrução CVM 539/2013) — obriga a **análise de perfil do investidor**
  (conservador / moderado / agressivo). O app adota o eixo **conservador** como
  carteira-alvo. Fontes:
  [CVM — Guia de Suitability](https://www.gov.br/investidor/pt-br/educacional/publicacoes-educacionais/guias/guia-de-suitability-lancamento)
  · [CVM — estudo sobre a Resolução CVM 30](https://www.gov.br/cvm/pt-br/assuntos/noticias/2025/cvm-publica-estudo-sobre-o-processo-de-analise-do-perfil-do-investidor-suitability-e-a-eficacia-da-resolucao-cvm-30).
- **FGC — Fundo Garantidor de Créditos** — garante **R$ 250 mil por CPF e por
  instituição** (teto de **R$ 1 milhão** renovável a cada 4 anos) em poupança,
  CDB, LCI e LCA. É o que torna um CDB de banco médio "baixo risco". Fonte:
  [FGC — sobre a garantia](https://www.fgc.org.br/).
- **CDI e Selic** — o CDI é o **benchmark** da renda fixa (anda colado na Selic,
  a taxa básica do Copom). Produtos são cotados em **"% do CDI"**. Fontes:
  [Investidor10 — CDI](https://investidor10.com.br/indices/cdi/)
  · [Meelion — Selic](https://www.meelion.com/indicadores-financeiros/selic/).
- **Tesouro Selic (LFT) e Tesouro Direto** — título público **pós-fixado**
  (Selic + spread; ex.: **LFT 010331** = Tesouro Selic 2031), base da reserva.
  Fonte:
  [Investidor10 — Tesouro Selic 2031](https://investidor10.com.br/tesouro-direto/tesouro-selic-2031/).
- **IR regressivo (renda fixa)** — alíquota cai com o prazo: 22,5% (até 180d) →
  20% → 17,5% → **15%** (acima de 720d), sobre o **ganho**; **LCI/LCA e poupança
  são isentas**. Convenção do projeto: usar essa tabela nas funções puras.

> **Convenções internas** (não são fonte externa): os rótulos das classes de
> risco ("muito baixo / baixo / médio"), o formato dos aportes de exemplo e a
> carteira-alvo sugerida são **escolhas deste projeto**, calibradas a partir das
> referências acima.

## Stack (tecnologia)

- **HTML + CSS + JavaScript puros**: `index.html` (telas/estilos) e `logica.js`
  (regras de negócio em **funções puras**) — abre em qualquer navegador, sem build.
- Dados no **localStorage** (sem servidor, sem banco).
- **Testes de mercado**: **Jest** para as regras (`logica.test.js`, `npm test`) e
  **Playwright** para interface/E2E (`e2e/app.spec.js`, `npm run test:e2e`),
  localizando elementos por **`data-testid`**.
- **Pirâmide de testes** (Mike Cohn, *Succeeding with Agile*, 2009): maioria da
  cobertura em **unitários** sobre as funções puras; só o essencial no **E2E**.
- **`data-testid` em todos os botões/campos de ação**, para o E2E não quebrar
  quando o visual mudar. Cada tela referencia, em comentário, seu arquivo de teste.
- **Qualidade de código automatizada** — três scripts no `package.json`
  (instalados cedo, no passo 2.5):
  - `npm run lint` — **ESLint** aponta erros e maus hábitos.
  - `npm run format` — **Prettier** (`--write`) formata num padrão único.
  - `npm run prepare` — ativa o **Husky** (hook de pre-commit).
  O **pre-commit roda lint + format antes de CADA commit, em QUALQUER branch**.
- **Arquivos de exclusão desde o início** — `.gitignore` / `.eslintignore` /
  `.prettierignore`: `node_modules/`, `test-results/`, `playwright-report/`,
  `.DS_Store` ficam fora do repositório; sobe só o que é fonte.

## Regras de negócio (não quebrar)

- **Entidade principal: o aporte** (posição da carteira) com **campos
  obrigatórios validados**: produto, **categoria** (Tesouro / CDB PRÉ / CDB DI /
  Letra LCI-LCA-LF / Fundo / Poupança), **valor**, **indexador** (% do CDI, taxa
  prefixada ou pós Selic), data de aplicação e vencimento/liquidez. O
  **rendimento bruto, o IR, o rendimento líquido, o peso na carteira e o nível de
  risco** são **calculados por função pura** — nunca digitados.
- **Ciclo de status do aporte** que **avança na ordem e volta um passo**:
  **Planejado → Aplicado → Resgatável → Resgatado** (nada é beco sem saída); a
  transição carimba/limpa datas quando fizer sentido.
- **Lista organizada** por **nível de risco** (e por categoria), com indicadores
  por grupo (total e % da carteira em cada risco).
- **Filtros/preferências PERSISTIDOS** (localStorage): filtro por categoria/risco/
  horizonte e o **perfil-alvo** seguem aplicados ao voltar ao app.
- **Painel/dashboard** com os números-chave: **patrimônio total**, **composição
  por risco**, **rendimento líquido projetado**, **aderência ao perfil de baixo
  risco** e **destaque do que exige atenção agora** (ex.: fatia em risco médio/alto
  acima do teto conservador).
- **Ações destrutivas só com confirmação.**
- O usuário pode **exportar/limpar** seus dados (o dado é dele — LGPD).

## Como responder aqui (regras automáticas de TODA resposta)

- **Roteiro previsto de prompts** no `PROMPTS.md` (Prompt 1 → 13), guia e não
  trilho; **Prompt 1 é a fundamentação** (já executado no Setup 0).
- **Partes pequenas com testes junto** de cada funcionalidade.
- **Cenários positivos e negativos**, com `(positivo)` / `(negativo)` no nome do teste.
- **Clean code comentado** (o porquê das decisões).
- **Explicar → documentar → perguntar o próximo passo**: ao fim de cada resposta,
  explique em linguagem simples, documente e ofereça 2–3 próximos passos, aguardando a escolha.
- **Acessibilidade WCAG AA desde a v1**: relatório de contraste ao vivo no rodapé
  por funções puras (`luminancia`, `razaoContraste`, `nivelWcag`); teclado,
  textos alternativos e labels ligados aos campos.
- **Usabilidade sem becos**: sempre dá para avançar e voltar; destrutivas confirmam; preferências persistem.
- **Botão "Reiniciar experiência" no header**: zera o fluxo com confirmação.
- **LGPD com dados fictícios**: os aportes de exemplo espelham a **estrutura** de
  uma carteira real (CDB PRÉ/DI, Títulos Públicos/LFT, Poupança, Fundos por risco,
  LCI/LCA), mas com **valores fictícios/arredondados** — nunca dados reais de
  pessoas nem credenciais.
- **Registro de cada avanço**: atualizar `GLOSSARIO.md`, escrever `RESUMAO.md` da
  etapa e registrar o prompt executado (com resultado) no `PROMPTS.md`.

## Qualidade visual (design de TODA interface)

- **Inspiração visual (obrigatória): paleta e estilo baseados numa marca/sistema
  de mercado de referência.** É aqui que mora a "inspiração" (diferente da
  fundamentação). Ao definir a primeira tela, a IA **pergunta ao usuário qual
  marca inspirar** (ex.: um app de investimentos conhecido) em vez de escolher
  sozinha; dela derivam **cores e tom**. Sempre **declarar a referência** e
  **respeitar o contraste WCAG AA**.
- **Design tokens**: escala única de espaçamento (4/8/12/16/24px), raio,
  tipografia, cores e sombras em variáveis CSS, reutilizadas em tudo — derivadas
  da inspiração visual.
- **Layout com Flexbox/Grid sem quebra**, principalmente no dashboard: grid
  responsivo (`flex-wrap`/`auto-fit`) para os cartões **nunca estourarem nem se
  sobreporem** em nenhuma largura.
- **Respiro nas bordas (nada colado)**: mín. `--esp-4`/16px na borda; ao revisar
  o screenshot, procurar de propósito por botão/campo "raspando" a beirada.
- **Espaçamento garantido por TESTE**: função pura `validarEspacamento`
  (mede folga entre caixas via `getBoundingClientRect`, exige > 0,5px, ignora
  pares pai/filho) entra nos testes da primeira tela e roda no E2E.
- **Componentes consistentes** (mesma altura/padding; `<button>` e `<label>`-botão
  pixel-a-pixel idênticos), **controles nativos estilizados**, **estados visíveis**
  (hover/foco/ativo/desabilitado), **responsivo de 360px ao desktop**.
- **Definição de pronto VISUAL**: ao fim de cada tela, **gerar screenshot** e
  revisar layout/consistência/alinhamento/espaçamento antes de encerrar.
- **Após cada etapa, passar pelo ferramental**: `npm run lint` + `npm run format`
  antes de encerrar (o pre-commit do Husky repete no commit).
- **Checagem de regressão em TODO prompt** que altera código: rodar a suíte
  (unitários + E2E) e reportar o **placar**; se algo regrediu, corrigir antes de
  encerrar. Prompts de tela **também geram screenshot** — print e placar juntos.

## Entregas finais do projeto

- **`README.md`** — visão do app, como rodar, como testar, arquitetura e decisões,
  **incluindo o passo a passo para subir o repositório** (git init → commit →
  `npm install` (ativa o Husky) → criar repo remoto → push).
- **Slides** — a história do Setup 0 ao app pronto, alimentados por `PROMPTS.md` e
  `RESUMAO.md`, **abrindo na capa com Tema + Inspiração visual** e um **slide
  dedicado à inspiração**, mais um **slide de qualidade de código**.
