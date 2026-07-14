# Instruções do projeto para a IA — Funil de Venda

> **Arquivo de instruções ativo.** Foi gerado no Setup 0 a partir do modelo
> "estado zero" para o tema **Funil de Venda**. A IA lê este arquivo e segue
> TODAS as regras abaixo em CADA resposta, sem precisar que o usuário as repita.
>
> Onde este arquivo vive: **Claude → `CLAUDE.md`** (equivalentes: GitHub Copilot
> → `.github/copilot-instructions.md` · Cursor → `.cursor/rules`).

## O que é o projeto

- **Nome/pitch:** **Funil** — um gestor de oportunidades de venda que, em vez de
  só listar contatos, mostra **em que etapa do funil** cada negócio está e **qual
  o próximo passo**, calculando a **probabilidade de fechamento** e o **valor
  ponderado** previsto de cada negócio.
- **Conceito central:** o **funil de vendas** (metáfora que vem do modelo
  **AIDA**) como motor. Cada negócio percorre **etapas** em ordem — **Lead →
  Qualificação → Proposta → Negociação → Fechado** (Ganho/Perdido) — e a cada
  etapa corresponde uma **probabilidade**. A qualificação usa **BANT** (Orçamento,
  Autoridade, Necessidade, Prazo). A **probabilidade e o valor ponderado são
  calculados por função pura** a partir da etapa e da qualificação — **nunca
  digitados à mão**.
- **Resultado esperado:** a pessoa cadastra seus negócios (contato + valor), marca
  a etapa e a qualificação, e o app responde **"foque neste"** — enxergando, num
  painel, o valor total no funil, o valor ponderado previsto, a taxa de conversão
  e o negócio que exige atenção agora.

## Fundamentação e referências (de onde vem a ideia)

> O conceito central **não é achismo**. Referências reais, pesquisadas na
> internet, com a fonte linkada. (Os termos entram no `GLOSSARIO.md` no Prompt 1,
> antes de qualquer código.)

- **Modelo AIDA / origem do funil** — a metáfora do funil de vendas nasce do
  modelo **AIDA** (Atenção → Interesse → Desejo → Ação), criado pelo publicitário
  americano **Elias St. Elmo Lewis** (1898). A sigla "AIDA" foi cunhada por
  **C. P. Russell** (1921) e a associação explícita do modelo ao **funil** aparece
  em *Bond Salesmanship*, de **William W. Townsend** (1924). É a origem da ideia de
  que muitos entram no topo e poucos chegam ao fechamento — o motor do app. Fonte:
  [ProvenModels — AIDA / Elias St. Elmo Lewis](https://www.provenmodels.com/547/aidasales-funnel/elias-st.-elmo-lewis) ·
  [MasterClass — AIDA Model](https://www.masterclass.com/articles/aida-model-explained).
- **BANT (qualificação de leads)** — framework criado pela **IBM** (anos 1950)
  para qualificar oportunidades por **Budget / Authority / Need / Timeline**
  (Orçamento / Autoridade / Necessidade / Prazo). Embasa a **qualificação** que
  ajusta a probabilidade de fechamento no app. Fonte:
  [HubSpot — BANT](https://blog.hubspot.com/sales/bant) ·
  [Lucidchart — What is BANT](https://lucid.co/blog/what-is-BANT-and-how-can-it-streamline-lead-qualification).
- **Pipeline de vendas / valor ponderado (weighted pipeline)** — prática de CRM de
  estimar a receita prevista multiplicando o **valor do negócio pela probabilidade
  da etapa**, e de medir a **taxa de conversão** entre etapas. Embasa o painel
  "Visão do funil". Fonte:
  [HubSpot — Sales Pipeline](https://blog.hubspot.com/sales/sales-pipeline).
- **Convenções deste projeto (não são fonte externa):** os nomes de etapa e
  rótulos em português — **"Lead / Qualificação / Proposta / Negociação /
  Fechado"**, **"Visão do funil"**, **"Ganho / Perdido"** — são escolhas internas
  para deixar o app didático e em português claro.

> **⚠️ Inspiração visual é outra coisa.** A base conceitual acima é o *porquê* do
> app. A paleta e o estilo de tela (marca/sistema de referência de mercado) ficam
> em **Qualidade visual → Design tokens** e serão definidos junto da primeira
> tela — **não** aqui.

## Stack (tecnologia)

- **HTML + CSS + JavaScript puros**: `index.html` (telas/estilos) e `logica.js`
  (regras de negócio em **funções puras**) — abre em qualquer navegador, sem
  instalar nada.
- Dados no **localStorage** do navegador (sem servidor, sem banco).
- **Testes com frameworks de mercado**: **Jest** para as regras
  (`logica.test.js`, `npm test`) e **Playwright** para interface/E2E
  (`e2e/app.spec.js`, `npm run test:e2e`), localizando elementos por
  **`data-testid`**.
- **`data-testid` em todos os botões e campos de ação**, para os testes de
  interface não quebrarem quando o visual mudar.
- Cada tela/módulo referencia, em comentário, o arquivo de teste que a cobre.

## Regras de negócio (não quebrar)

- **Negócio (oportunidade)** é a entidade principal, com **campos obrigatórios
  validados**: nome do negócio/contato, **valor** (número maior que zero) e etapa
  (o app rejeita negócio sem nome ou com valor inválido).
- **A probabilidade e o valor ponderado são CALCULADOS por função pura** a partir
  da etapa e da qualificação BANT (`probabilidadeDaEtapa`, `pontuarQualificacao`,
  `valorPonderado`) — **nunca digitados à mão**.
- **Ciclo de etapas do funil** que **avança na ordem e volta um passo**:
  **Lead → Qualificação → Proposta → Negociação → Fechado** (e volta um passo);
  nada vira beco sem saída. Fechar carimba a data e o desfecho (**Ganho/Perdido**);
  reabrir limpa o fechamento.
- **Lista organizada por etapa do funil**: agrupada por etapa (Lead → Qualificação
  → Proposta → Negociação → Fechado), ordenada por prioridade (valor ponderado),
  com **contador e soma de valor** por grupo.
- **Filtros/preferências são PERSISTIDOS** (localStorage): filtro por etapa, por
  status (aberto/ganho/perdido) e ordenação seguem aplicados ao voltar ao app.
- **Painel "Visão do funil"** com os números-chave: total de negócios, **valor
  total no funil**, **valor ponderado previsto**, **taxa de conversão** (ganhos ÷
  fechados) e o destaque do negócio que exige atenção agora.
- **Ações destrutivas só com confirmação** (excluir negócio, limpar tudo).
- O usuário pode **exportar/limpar** seus dados (o dado é dele — LGPD; aqui há
  dados de contatos, então isso é especialmente importante).

## Como responder aqui (regras automáticas de TODA resposta)

- **Roteiro previsto de prompts** está no `PROMPTS.md` (Prompt 1 → N adaptado a
  este tema). É **guia, não trilho**: a ordem pode mudar, mas vale sempre "um
  objetivo por prompt, com testes junto". O **Prompt 1** é a **fundamentação**:
  a IA pesquisa/consolida as referências reais do tema (AIDA/funil, BANT, pipeline
  ponderado), documenta com link e registra os termos no `GLOSSARIO.md` — **antes
  de escrever qualquer código**.
- **Partes pequenas com testes junto** de cada funcionalidade.
- **Cenários positivos e negativos**, com `(positivo)` / `(negativo)` no nome do
  teste (o que deve funcionar E o que deve ser bloqueado/dar erro — ex.: negócio
  com valor zero ou negativo é rejeitado).
- **Clean code comentado** nos trechos importantes (o porquê das decisões).
- **Explicar → documentar → perguntar o próximo passo**: ao final de cada
  resposta, explico em linguagem simples, documento a mudança e ofereço 2–3
  opções de próximo passo, aguardando a escolha.
- **Acessibilidade com auditoria de contraste WCAG AA desde a primeira versão**:
  toda cor escolhida já medindo o contraste (mín. AA); **relatório de contraste
  ao vivo no rodapé** por funções puras (`luminancia`, `razaoContraste`,
  `nivelWcag`); teclado, textos alternativos e labels ligados aos campos.
- **Usabilidade sem becos sem saída**: sempre dá para avançar e voltar (a etapa do
  funil volta um passo); ações destrutivas confirmam; preferências persistem.
- **Botão "Reiniciar experiência" no header**: zera o fluxo com confirmação.
- **LGPD com dados fictícios**: nunca dados reais de pessoas nem credenciais nos
  contatos/negócios de exemplo.
- **Registro de cada avanço**: atualizar `GLOSSARIO.md`, escrever `RESUMAO.md` da
  etapa e registrar o prompt executado (com resultado) no `PROMPTS.md`.

## Qualidade visual (design de TODA interface)

- **Inspiração visual (obrigatória):** a paleta e o estilo partem de uma
  **referência real de mercado do mesmo domínio** — referência escolhida: a
  identidade do **Jira** (Atlassian), com seu **azul característico** e o layout
  limpo de gestão de trabalho em boards/colunas/cartões. A referência é **declarada
  explicitamente** no código (tokens do `index.html`) e **sempre respeita o contraste WCAG
  AA**. Se o usuário indicar outra marca/sistema, usamos a dele.
- **Design tokens**: escala **única** de espaçamento (4/8/12/16/24px), raio,
  tipografia, **cores** e sombras em variáveis CSS, reutilizada em tudo (nada de
  valores soltos) — **derivadas da inspiração visual acima**.
- **Layout com Flexbox/Grid, bem organizado e sem quebra** — principalmente no
  painel **"Visão do funil"** e nas colunas de etapa, que usam grid/flex
  responsivo (`flex-wrap`/`auto-fit`) para os cartões **nunca estourarem nem se
  sobreporem** em nenhuma largura.
- **Respiro nas bordas (nada colado)**: botões, campos e inputs **nunca encostam
  na margem** do cartão/tela nem ficam grudados uns nos outros — sempre com o
  espaçamento da escala (padding do container e gaps consistentes; mín.
  `--esp-4`/16px na borda). Ao revisar o screenshot, procurar de propósito por
  algum botão/campo "raspando" a beirada ou espremido e corrigir antes de encerrar.
- **Espaçamento garantido por TESTE**: a função pura `validarEspacamento` mede a
  folga entre as caixas dos elementos e exige **> 0,5px** (ignorando pares
  pai/filho); roda no **E2E** sobre os elementos reais. Elemento colado/sobreposto
  **reprova o teste** — só faz sentido depois da inspiração visual aplicada.
- **Componentes consistentes**: todos os botões com mesma altura/padding/
  alinhamento (variam só na cor); `<button>` e `<label>` que age como botão ficam
  **pixel-a-pixel idênticos** (mesma classe base).
- **Controles nativos estilizados**: `input`, `select`, `checkbox`, `radio` e
  `file` com estilo próprio — nunca com a cara padrão do navegador destoando.
- **Estados visíveis**: hover, foco, ativo e desabilitado em tudo que é clicável.
- **Responsivo de 360px ao desktop**; largura de leitura confortável.
- **Definição de pronto VISUAL**: ao final de cada tela, **gerar um screenshot** e
  revisar layout (flex/grid), consistência, alinhamento e espaçamento **antes de
  encerrar**.
- **Checagem de regressão em TODO prompt**: qualquer prompt que altera código
  (lógica, persistência, tela — inclusive os sem tela, como o de localStorage)
  **roda a suíte (Jest + Playwright) e confirma que nada quebrou**, reportando o
  placar. Teste vermelho: reportar (com a saída), corrigir e só então encerrar.
- **Prompts de tela também levam print**: além da checagem acima, **geram o
  screenshot** e revisam o visual; a tela só está pronta se o screenshot está bom
  **E** nenhum teste regrediu.

## Entregas finais do projeto

- **`README.md`** — visão do app, como rodar, como testar, arquitetura e decisões.
- **Slides de apresentação** — a história do Setup 0 ao app pronto, alimentados
  pelo `PROMPTS.md` e pelo `RESUMAO.md`.
