# Instruções do projeto para a IA — Organizador de Tarefas e Prioridades

> **Arquivo de instruções ativo.** Gerado no Setup 0 a partir do modelo "estado
> zero" para o tema **Organizador de Tarefas e Prioridades**. A IA lê este arquivo
> e segue TODAS as regras abaixo em CADA resposta, sem precisar que o usuário as
> repita.
>
> Onde este arquivo vive: **Claude → `CLAUDE.md`** (equivalentes: GitHub Copilot
> → `.github/copilot-instructions.md` · Cursor → `.cursor/rules`).

## O que é o projeto

- **Nome/pitch:** **Prioriza** — um organizador de tarefas que, em vez de só
  listar o que você tem para fazer, **ordena o que fazer AGORA** cruzando
  **urgência × importância** e mostra o próximo passo com clareza.
- **Conceito central:** a **Matriz de Eisenhower** (urgente × importante, quatro
  quadrantes: **Faça agora / Agende / Delegue / Elimine**) como motor de
  priorização, apoiada pela ideia de **capturar tudo fora da cabeça** (GTD) e de
  **classificar o essencial** (MoSCoW). A prioridade **não é digitada** — é
  **calculada por função pura** a partir dos campos de urgência e importância.
- **Resultado esperado:** a pessoa cadastra suas tarefas, marca urgência e
  importância, e o app responde **"comece por esta"** — enxergando, num painel,
  onde está o foco do dia, o que pode esperar e o que só está gerando ruído.

## Fundamentação e referências (de onde vem a ideia)

> O conceito central **não é achismo**. Referências reais, pesquisadas na
> internet, com a fonte linkada. (Os termos entram no `GLOSSARIO.md` no Prompt 1,
> antes de qualquer código.)

- **Matriz de Eisenhower / princípio urgente-vs-importante** — a distinção
  "o que é urgente raramente é importante, e o que é importante raramente é
  urgente" foi popularizada por **Dwight D. Eisenhower** (discurso de 1954,
  citando um reitor) e transformada no **modelo de quatro quadrantes** por
  **Stephen Covey** em *The 7 Habits of Highly Effective People* (1989). É o
  motor de priorização do app. Fonte:
  [Asana — Eisenhower Matrix](https://asana.com/resources/eisenhower-matrix) ·
  [Quote Investigator (origem da frase)](https://quoteinvestigator.com/2014/05/09/urgent/).
- **Getting Things Done (GTD)** — método de **David Allen** (*Getting Things
  Done: The Art of Stress-Free Productivity*, 2001; ed. revisada 2015): tirar
  tudo da cabeça e registrar externamente, quebrando em ações concretas. Embasa
  a etapa de **captura** das tarefas no app. Fonte:
  [gettingthingsdone.com](https://gettingthingsdone.com/) ·
  [Getting Things Done — Wikipedia](https://en.wikipedia.org/wiki/Getting_Things_Done).
- **Método MoSCoW** — criado por **Dai Clegg** (Oracle, 1994), consolidado no
  **DSDM**: classificar itens em **Must / Should / Could / Won't**. Embasa o
  rótulo opcional de **essencialidade** que complementa urgência × importância.
  Fonte: [MoSCoW method — Wikipedia](https://en.wikipedia.org/wiki/MoSCoW_method).
- **Convenções deste projeto (não são fonte externa):** os nomes de tela e
  rótulos em português — **"Faça agora / Agende / Delegue / Elimine"**,
  **"Foco do dia"**, **"a fazer / fazendo / concluída"** — são escolhas internas
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

- **Tarefa** é a entidade principal, com **campos obrigatórios validados**:
  título, urgência e importância (o app rejeita tarefa sem título ou sem
  classificação).
- **O quadrante e a prioridade são CALCULADOS por função pura** a partir de
  urgência × importância (`classificarQuadrante`, `pontuarPrioridade`) —
  **nunca digitados à mão**.
- **Ciclo de status** que **avança na ordem e volta um passo**:
  **a fazer → fazendo → concluída** (e volta um passo); nada vira beco sem saída.
  Concluir carimba a data; reabrir limpa a conclusão.
- **Lista organizada por prioridade**: agrupada pelos quadrantes de Eisenhower
  (Faça agora → Agende → Delegue → Elimine), com contador por grupo.
- **Filtros/preferências são PERSISTIDOS** (localStorage): filtro por quadrante,
  por status e ordenação seguem aplicados ao voltar ao app.
- **Painel "Foco do dia"** com os números-chave: total de tarefas, quantas em
  "Faça agora", quantas concluídas hoje, e o destaque do que exige atenção agora.
- **Ações destrutivas só com confirmação** (excluir tarefa, limpar tudo).
- O usuário pode **exportar/limpar** seus dados (o dado é dele — LGPD).

## Como responder aqui (regras automáticas de TODA resposta)

- **Roteiro previsto de prompts** está no `PROMPTS.md` (Prompt 1 → N adaptado a
  este tema). É **guia, não trilho**: a ordem pode mudar, mas vale sempre "um
  objetivo por prompt, com testes junto". O **Prompt 1** é a **fundamentação**:
  a IA pesquisa/consolida as referências reais do tema (Eisenhower, GTD, MoSCoW),
  documenta com link e registra os termos no `GLOSSARIO.md` — **antes de escrever
  qualquer código**.
- **Decisões que são do usuário se PERGUNTAM, não se presumem.** Em especial a
  **inspiração visual** (marca/sistema que guia a paleta): ao chegar na primeira
  tela (Prompt 3), a IA **pergunta ao usuário qual marca** usar como referência
  antes de definir as cores — só propõe um padrão se o usuário abrir mão da
  escolha.
- **Partes pequenas com testes junto** de cada funcionalidade.
- **Cenários positivos e negativos**, com `(positivo)` / `(negativo)` no nome do
  teste (o que deve funcionar E o que deve ser bloqueado/dar erro — ex.: tarefa
  sem título é rejeitada).
- **Clean code comentado** nos trechos importantes (o porquê das decisões).
- **Explicar → documentar → perguntar o próximo passo**: ao final de cada
  resposta, explico em linguagem simples, documento a mudança e ofereço 2–3
  opções de próximo passo, aguardando a escolha.
- **Acessibilidade com auditoria de contraste WCAG AA desde a primeira versão**:
  toda cor escolhida já medindo o contraste (mín. AA); **relatório de contraste
  ao vivo no rodapé** por funções puras (`luminancia`, `razaoContraste`,
  `nivelWcag`); teclado, textos alternativos e labels ligados aos campos.
- **Usabilidade sem becos sem saída**: sempre dá para avançar e voltar (o ciclo
  de status volta um passo); ações destrutivas confirmam; preferências persistem.
- **Botão "Reiniciar experiência" no header**: zera o fluxo com confirmação.
- **LGPD com dados fictícios**: nunca dados reais de pessoas nem credenciais nas
  tarefas de exemplo.
- **Registro de cada avanço**: atualizar `GLOSSARIO.md`, escrever `RESUMAO.md` da
  etapa e registrar o prompt executado (com resultado) no `PROMPTS.md`.

## Qualidade visual (design de TODA interface)

- **Inspiração visual (obrigatória, escolhida pelo usuário):** a paleta e o estilo
  partem de uma **referência real de mercado**. **A IA pergunta ao usuário qual
  marca/sistema usar** (no Prompt 3, junto da primeira tela) — não escolhe
  sozinha. A referência será **declarada explicitamente** no código e **sempre
  respeitará o contraste WCAG AA** (a estética nunca fura a acessibilidade; se a
  cor de marca reprovar, ajusta-se o tom mantendo a identidade).
- **Design tokens**: escala **única** de espaçamento (4/8/12/16/24px), raio,
  tipografia, **cores** e sombras em variáveis CSS, reutilizada em tudo (nada de
  valores soltos) — **derivadas da inspiração visual acima**.
- **Layout com Flexbox/Grid, bem organizado e sem quebra** — principalmente no
  painel **"Foco do dia"**, que usa grid/flex responsivo (`flex-wrap`/`auto-fit`)
  para os cartões **nunca estourarem nem se sobreporem** em nenhuma largura.
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

## Entregas finais do projeto

- **`README.md`** — visão do app, como rodar, como testar, arquitetura e decisões.
- **Slides de apresentação** — a história do Setup 0 ao app pronto, alimentados
  pelo `PROMPTS.md` e pelo `RESUMAO.md`.
