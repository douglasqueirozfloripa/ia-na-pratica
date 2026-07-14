# Instruções do projeto para a IA — Análise de Sentenças/Decisões (fases recursais)

> **Arquivo de instruções ativo.** Gerado no Setup 0 a partir do modelo "estado
> zero" para o tema **Análise de sentenças/decisões judiciais nas fases
> recursais**, no ramo de uma **concessionária de energia elétrica (Eletroca)**. A
> IA lê este arquivo e segue TODAS as regras abaixo em CADA resposta, sem precisar
> que o usuário as repita.
>
> Onde este arquivo vive: **Claude → `CLAUDE.md`** (equivalentes: GitHub Copilot
> → `.github/copilot-instructions.md` · Cursor → `.cursor/rules`).

## O que é o projeto

- **Nome/pitch:** **Instância** — um app que **classifica e acompanha as
  sentenças/decisões judiciais** da concessionária **Eletroca** ao longo das
  **fases recursais**, dizendo, para cada processo, **que espécie de sentença é**,
  **em que instância ele está** e **qual o próximo passo** (recorrer, aguardar o
  prazo ou arquivar após o trânsito em julgado).
- **Ótica jurídica:** **direito civil do consumidor** — o contencioso da Eletroca
  é, na esmagadora maioria, de **relação de consumo** (energia como serviço
  essencial): cobrança indevida, corte/interrupção, dano moral, repetição de
  indébito. A base material é o **CDC (Lei 8.078/1990)** somado à regulação
  setorial da **ANEEL (REN nº 1.000/2021)**.
- **Conceito central:** três bases jurídicas reais, combinadas — **(1) a taxonomia
  das espécies de sentença** (CPC: **terminativa**, sem resolução de mérito, art.
  485, × **definitiva**, com mérito, art. 487; carga de eficácia **declaratória/
  constitutiva/condenatória** — no consumo, predomina a **condenatória**; e a
  espécie **quanto ao órgão julgador**: subjetivamente **simples/plúrima/
  complexa**), **(2) o sistema recursal / as fases recursais** (1º grau → apelação
  no tribunal → recursos às instâncias superiores → **trânsito em julgado**) e
  **(3) o mérito da relação de consumo** (CDC + REN ANEEL 1.000/2021). A **espécie
  e a prioridade de atuação não são digitadas** — são **calculadas por função
  pura** a partir dos dados do caso (resolveu mérito? qual a carga? qual o órgão?
  valor em risco, resultado e prazo).
- **Resultado esperado:** o time jurídico cadastra cada decisão (com dados
  **fictícios**), e o app responde **"esta é a espécie, esta é a fase, aja por
  esta primeiro"** — enxergando, num painel, a **exposição financeira** do
  contencioso, quantos processos têm **prazo recursal correndo** e o que já
  **transitou em julgado**.

## Fundamentação e referências (de onde vem a ideia)

> O conceito central **não é achismo**: vem da lei processual e da doutrina
> consolidada. As referências reais, com a fonte linkada, foram **consolidadas no
> Prompt 1** (fundamentação) e os termos registrados no `GLOSSARIO.md` **antes de
> qualquer código**.

- **Conceito de sentença (CPC, art. 203, §1º)** — pronunciamento que, com base
  nos arts. 485 ou 487, põe fim à fase de conhecimento do procedimento comum ou
  extingue a execução. É a decisão que o app analisa. Fonte:
  [CPC — Lei nº 13.105/2015 (Planalto)](http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13105.htm).
- **Sentença terminativa × definitiva (CPC, arts. 485 e 487)** — a
  **terminativa** extingue o processo **sem resolução de mérito** (art. 485: falta
  de pressuposto, ilegitimidade, abandono…); a **definitiva** resolve o **mérito**
  (art. 487: acolhe/rejeita o pedido, reconhece prescrição/decadência,
  homologa acordo). É o primeiro eixo da classificação. Fonte:
  [CPC arts. 485–487 (Planalto)](http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13105.htm).
- **Classificação pela carga de eficácia — declaratória, constitutiva,
  condenatória (classificação ternária, Enrico Tullio Liebman)** — adotada
  amplamente pela doutrina processual brasileira; distingue a sentença que
  **declara** um direito, a que **cria/modifica/extingue** uma relação jurídica e
  a que **condena** a uma prestação. É o segundo eixo. (A classificação
  **quinária** de Pontes de Miranda acrescenta a **mandamental** e a **executiva
  lato sensu** — registrar como nota.) Fonte:
  [Classificação das sentenças (Jusbrasil)](https://www.jusbrasil.com.br/artigos/classificacao-das-sentencas/657105793) ·
  [Os efeitos da sentença no processo civil (Âmbito Jurídico)](https://ambitojuridico.com.br/cadernos/direito-processual-civil/os-efeitos-da-sentenca-no-processo-civil-brasileiro/).
- **Espécie quanto ao órgão julgador (artigo de referência)** — classificação
  da fonte que o usuário indicou: **subjetivamente simples** (juiz singular),
  **plúrima** (órgão colegiado) ou **complexa** (mais de um órgão, ex.: Júri).
  Casa com a fase recursal (1º grau = simples; apelação/instância superior =
  plúrima, o **acórdão**). O artigo também traz a grade **penal** (condenatória/
  absolutória própria-imprópria/terminativa de mérito), registrada apenas como
  **nota comparativa** — o app é **cível**. Fonte:
  [Espécies de sentença (Jusbrasil)](https://www.jusbrasil.com.br/artigos/especies-de-sentenca/121936620).
- **Direito do consumidor de energia (mérito das disputas)** — a matéria de fundo
  do contencioso da Eletroca: o **Código de Defesa do Consumidor (Lei nº
  8.078/1990)** — relação de consumo, inversão do ônus, repetição de indébito
  (art. 42, parágrafo único) — e a **regulação setorial da ANEEL**, consolidada na
  **Resolução Normativa nº 1.000/2021** (direitos e deveres do consumidor de
  energia; revogou a REN 414/2010). Fonte:
  [CDC — Lei 8.078/1990 (Planalto)](http://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm) ·
  [REN ANEEL 1.000/2021 (ANEEL)](https://www2.aneel.gov.br/cedoc/ren20211000.html) ·
  [ANEEL — resumo da Resolução 1.000](https://www.gov.br/aneel/pt-br/assuntos/noticias/2022/conheca-a-resolucao-1-000-que-reune-os-direitos-e-deveres-do-consumidor-de-energia-eletrica).
- **Sistema recursal / fases recursais (CPC, art. 994 e seguintes)** — o caminho
  de impugnação da decisão: **apelação** (contra a sentença, ao tribunal de 2º
  grau), **recurso especial** (STJ, uniformiza a lei federal) e **recurso
  extraordinário** (STF, matéria constitucional), além dos **embargos de
  declaração** (obscuridade/omissão/contradição) e dos **agravos**. Esgotados os
  recursos, dá-se o **trânsito em julgado** (a decisão se torna imutável). É o
  motor do **ciclo de status** do app. Fonte:
  [CPC art. 994 (Planalto)](http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13105.htm).
- **Contexto do ramo (concessionária de energia — Eletroca):** o **contencioso de
  consumo em massa** típico do setor (cobrança/faturamento, TUSD/TUST, corte de
  fornecimento, dano moral) motiva **triar por espécie, por fase e por exposição
  financeira**. É a motivação de negócio, sob a ótica **cível-consumerista** acima;
  **não** substitui a fundamentação jurídica.
- **Convenções deste projeto (não são fonte externa):** os rótulos de tela em
  português — **"1º grau / Apelação (2º grau) / Instância superior / Transitado
  em julgado"**, **"Painel do contencioso"**, **"aja por esta primeiro"** — são
  escolhas internas para deixar o app didático e em português claro.

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
- **Pirâmide de testes** (Mike Cohn): a maior parte da cobertura na **base de
  unitários** (sobre as funções puras da `logica.js`) e só o essencial no **topo
  de E2E** (fluxos críticos de tela). Sempre empurrar a lógica para funções puras.
- **`data-testid` em todos os botões e campos de ação**, para os testes de
  interface não quebrarem quando o visual mudar.
- Cada tela/módulo referencia, em comentário, o arquivo de teste que a cobre.
- **Qualidade de código automatizada (passo 2.5, cedo)** — três scripts no
  `package.json`: `npm run lint` (**ESLint**), `npm run format` (**Prettier**
  `--write`) e `npm run prepare` (ativa o **Husky**). O **pre-commit do Husky roda
  lint + format antes de CADA commit, em QUALQUER branch**. Arquivos de exclusão
  desde o início: `.gitignore`, `.eslintignore`, `.prettierignore` (ignorando
  `node_modules/`, `test-results/`, `playwright-report/`, `.DS_Store`).

## Regras de negócio (não quebrar)

- **Decisão** é a entidade principal (uma sentença/decisão de um processo de
  **consumo**), com **campos obrigatórios validados**: `numeroProcesso`
  (fictício), `orgaoVara`, **`tipoLide`** (o assunto de consumo — ver lista
  abaixo), **`orgaoJulgador`** (singular/colegiado/complexo), **`resolveuMerito`**
  (sim/não), **`cargaEficacia`** (declaratória/constitutiva/condenatória — exigida
  só quando resolveu mérito), **`resultado`** (procedente/parcial/improcedente),
  **`valorEmRisco`** (R$ ≥ 0), `faseRecursal` (ciclo de status, começa em "1º
  grau"), `prazoRecursalAte` (data) e `dataTransito` (carimbo automático). O `id`
  é **gerado**, nunca digitado. O app **rejeita** decisão sem `numeroProcesso`,
  sem `tipoLide` ou sem classificação obrigatória.
  - **`tipoLide` (6 tipos, todos ancorados em CDC/ANEEL):** (1) **Cobrança /
    faturamento indevido**; (2) **Recuperação de consumo / irregularidade no
    medidor (TOI)**; (3) **Interrupção / corte de fornecimento**; (4) **Dano
    moral**; (5) **Dano material (danos elétricos a aparelhos)**; (6) **Repetição
    de indébito** (devolução em dobro, art. 42 CDC).
- **A espécie e a prioridade são CALCULADAS por função pura**, nunca digitadas:
  - `classificarEspecie(resolveuMerito, cargaEficacia, orgaoJulgador)` →
    **terminativa** (sem mérito) ou **definitiva** (com mérito), o tipo pela carga
    e a espécie **quanto ao órgão** (subjetivamente **simples/plúrima/complexa**).
    Regra dura: **sem mérito NUNCA é definitiva**; e órgão colegiado ⇒ plúrima.
  - `pontuarPrioridade(valorEmRisco, resultado, diasParaPrazo)` → nota de
    **prioridade de atuação** (quanto maior a exposição e mais curto o prazo, mais
    urgente).
- **Ciclo de status = fases recursais**, que **avança na ordem e volta um passo**
  (nada é beco sem saída): **1º grau → Apelação (2º grau) → Instância superior
  (STJ/STF) → Transitado em julgado**. Avançar de fase e **voltar um passo**;
  **transitar em julgado carimba a data**; **reabrir/voltar limpa** o carimbo.
- **Lista organizada por fase recursal** (1º grau → … → Transitado em julgado),
  com **contador por grupo** e cada decisão ordenada pela prioridade de atuação.
- **Filtros/preferências são PERSISTIDOS** (localStorage): filtro por **fase**,
  por **espécie** e por **resultado**, além da ordenação, seguem aplicados ao
  voltar ao app.
- **Painel "Painel do contencioso"** com os números-chave: total de decisões,
  quantas com **prazo recursal correndo** (atenção), quantas **transitadas em
  julgado**, **exposição financeira total** e o destaque **"aja por esta
  primeiro"**.
- **Ações destrutivas só com confirmação** (excluir decisão, limpar tudo).
- O usuário pode **exportar/limpar** seus dados (o dado é dele — LGPD).

## Como responder aqui (regras automáticas de TODA resposta)

- **Roteiro previsto de prompts** está no `PROMPTS.md` (Prompt 1 → N adaptado a
  este tema). É **guia, não trilho**: a ordem pode mudar, mas vale sempre "um
  objetivo por prompt, com testes junto". O **Prompt 1** é a **fundamentação**: a
  IA pesquisa/consolida as referências reais do tema (CPC arts. 203/485/487/994,
  classificação ternária de Liebman, sistema recursal), documenta **com link** e
  registra os termos no `GLOSSARIO.md` — **antes de escrever qualquer código**.
- **Decisões que são do usuário se PERGUNTAM, não se presumem.** Em especial a
  **inspiração visual** (marca/sistema que guia a paleta): ao chegar na primeira
  tela (Prompt 3), a IA **pergunta ao usuário qual marca** usar como referência
  antes de definir as cores — só propõe um padrão se o usuário abrir mão da
  escolha.
- **Partes pequenas com testes junto** de cada funcionalidade.
- **Cenários positivos e negativos**, com `(positivo)` / `(negativo)` no nome do
  teste (o que deve funcionar E o que deve ser bloqueado/dar erro — ex.: decisão
  sem identificador é rejeitada; decisão sem mérito **nunca** é classificada como
  definitiva).
- **Clean code comentado** nos trechos importantes (o porquê das decisões).
- **Explicar → documentar → perguntar o próximo passo**: ao final de cada
  resposta, explico em linguagem simples, documento a mudança e ofereço 2–3
  opções de próximo passo, aguardando a escolha.
- **Acessibilidade com auditoria de contraste WCAG AA desde a primeira versão**:
  toda cor escolhida já medindo o contraste (mín. AA); **relatório de contraste
  ao vivo no rodapé** por funções puras (`luminancia`, `razaoContraste`,
  `nivelWcag`); teclado, textos alternativos e labels ligados aos campos.
- **Usabilidade sem becos sem saída**: sempre dá para avançar e voltar (o ciclo
  de fases volta um passo); ações destrutivas confirmam; preferências persistem.
- **Botão "Reiniciar experiência" no header**: zera o fluxo com confirmação.
- **LGPD com dados fictícios**: **nunca** números de processo, partes, advogados
  ou valores reais — todo exemplo é inventado. Nada de dado pessoal real.
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
  **"Painel do contencioso"**, que usa grid/flex responsivo (`flex-wrap`/
  `auto-fit`) para os cartões **nunca estourarem nem se sobreporem** em nenhuma
  largura.
- **Espaçamento garantido por TESTE (não só pelo olho)**: função pura de layout
  (`validarEspacamento`) mede a folga entre as caixas dos elementos
  (`getBoundingClientRect`) e exige distância **> 0,5px** (ignorando pares pai/
  filho); entra nos testes da primeira tela e roda no E2E — elemento colado ou
  sobreposto **reprova**.
- **Componentes consistentes**: todos os botões com mesma altura/padding/
  alinhamento (variam só na cor); `<button>` e `<label>` que age como botão ficam
  **pixel-a-pixel idênticos** (mesma classe base).
- **Controles nativos estilizados**: `input`, `select`, `checkbox`, `radio`,
  `date` e `file` com estilo próprio — nunca com a cara padrão do navegador
  destoando.
- **Estados visíveis**: hover, foco, ativo e desabilitado em tudo que é clicável.
- **Responsivo de 360px ao desktop**; largura de leitura confortável.
- **Definição de pronto VISUAL**: ao final de cada tela, **gerar um screenshot** e
  revisar layout (flex/grid), consistência, alinhamento e espaçamento **antes de
  encerrar**.
- **Ferramental a cada etapa**: rodar `npm run lint` e `npm run format` antes de
  encerrar; o pre-commit do Husky repete lint + format em qualquer branch.
- **Checagem de regressão em TODO prompt**: qualquer prompt que altera código
  (inclusive os sem tela, como persistência) **roda a suíte (unitários + E2E) e
  reporta o placar**; nada vermelho passa. Prompts de tela, além disso, **levam
  screenshot** — print e placar andam juntos.

## Entregas finais do projeto

- **`README.md`** — visão do app, como rodar, como testar, arquitetura e decisões,
  **incluindo o passo a passo para subir o repositório** (`git init` → commit →
  `npm install` que ativa o Husky → criar repo remoto → push).
- **Slides de apresentação** — a história do Setup 0 ao app pronto, alimentados
  pelo `PROMPTS.md` e pelo `RESUMAO.md`. **Abrem na capa apresentando o TEMA e a
  INSPIRAÇÃO visual**, com um **slide dedicado à inspiração** — mesma lógica de
  abertura de todos os projetos.
