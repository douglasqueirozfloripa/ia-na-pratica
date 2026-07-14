# Glossário do projeto — Análise de Sentenças/Decisões (fases recursais)

> **Semente (estado zero).** Este arquivo começa praticamente vazio e cresce **ao
> longo da experiência**: a cada avanço, a IA acrescenta aqui os termos novos que
> apareceram, explicados em **linguagem simples** (como se fosse para alguém sem
> conhecimento jurídico ou técnico), com uma analogia do dia a dia, o **porquê** de
> existir no app e a **fonte** quando for conceito jurídico.

## Como registrar cada termo (convenção)

- Agrupe os termos **por etapa** (ex.: "## Etapa 1 — Fundamentação").
- Cada termo em uma linha: **negrito** + explicação curta e concreta, de
  preferência com uma **analogia do dia a dia**.
- Explique o **porquê** de existir no projeto, não só o significado do dicionário.
- Conceito jurídico entra **com a fonte linkada**; se conecta a outro termo,
  cite-o para o leitor navegar.

## Etapa 1 — Fundamentação

> De onde vêm os conceitos que o app usa. Fontes reais linkadas. Ainda **sem
> código** — aqui alinhamos o vocabulário jurídico antes de programar.

- **Sentença** — é a "palavra final" do juiz numa fase do processo: o
  pronunciamento que, com base nos arts. 485 ou 487 do CPC, **põe fim à fase de
  conhecimento** ou **extingue a execução** (CPC, art. 203, §1º). Analogia: é o
  apito final do juiz de um tempo do jogo — encerra aquela etapa. No app, **cada
  decisão cadastrada é uma sentença** a ser classificada e acompanhada. Fonte:
  [CPC — Lei nº 13.105/2015, art. 203 (Planalto)](http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13105.htm).

- **Mérito** — é o **coração da disputa**: o pedido em si (quem tem razão no que
  se discute). Uma decisão pode encerrar o processo **enfrentando** o mérito ou
  **sem chegar** a ele (por um problema formal). Analogia: julgar o placar do jogo
  (mérito) × cancelar a partida por falta de condições (sem mérito). É o **primeiro
  eixo** da classificação no app. Fonte:
  [CPC, arts. 485 e 487 (Planalto)](http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13105.htm).

- **Sentença terminativa (sem resolução de mérito — CPC, art. 485)** — encerra o
  processo por uma **questão processual/formal** (falta um pressuposto, parte
  ilegítima, abandono…) **sem julgar o pedido**. Não faz coisa julgada material,
  então a **mesma questão pode voltar** em nova ação (superado o problema).
  Analogia: a partida foi anulada por um erro de organização — dá para remarcar.
  No app, sai de `classificarEspecie(resolveuMerito=false, …)`. Fonte:
  [CPC, art. 485 (Planalto)](http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13105.htm) ·
  [Extinção do processo — arts. 485 e 487 (Direito em Tese)](https://direitoemtese.com.br/extincao-do-processo-artigos-485-e-487-do-cpc/).

- **Sentença definitiva (com resolução de mérito — CPC, art. 487)** — **julga o
  pedido** (acolhe/rejeita), reconhece prescrição/decadência ou homologa acordo.
  Depois do trânsito em julgado, faz **coisa julgada material** — a mesma demanda
  **não** pode ser rediscutida. Analogia: o placar foi validado e não muda mais.
  No app, sai de `classificarEspecie(resolveuMerito=true, …)`. Fonte:
  [CPC, art. 487 (Planalto)](http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13105.htm).

- **Carga de eficácia (o que a sentença "faz")** — o **segundo eixo** da
  classificação, olhando o efeito preponderante da decisão de procedência:
  - **Declaratória** — apenas **declara** que existe (ou não) uma relação jurídica
    (ex.: reconhecer que uma dívida não existe). Não manda ninguém fazer nada além
    de reconhecer.
  - **Constitutiva** — **cria, modifica ou extingue** uma relação jurídica (ex.:
    anular um contrato). Muda o "estado jurídico" das partes.
  - **Condenatória** — **condena** a uma prestação (pagar, entregar, fazer) — a
    mais comum no contencioso de uma concessionária (ex.: condenação a indenizar).
  Essa é a **classificação ternária**, atribuída a **Enrico Tullio Liebman** e
  adotada pela doutrina brasileira. Fonte:
  [Classificação das sentenças (Jusbrasil)](https://www.jusbrasil.com.br/artigos/classificacao-das-sentencas/657105793) ·
  [Os efeitos da sentença no processo civil (Âmbito Jurídico)](https://ambitojuridico.com.br/cadernos/direito-processual-civil/os-efeitos-da-sentenca-no-processo-civil-brasileiro/).

- **Classificação quinária (nota)** — **Pontes de Miranda** acrescentou às três
  espécies outras duas: **mandamental** (o juiz **manda** cumprir de imediato) e
  **executiva lato sensu** (a própria decisão já efetiva o direito). Premissa dele:
  "nenhuma sentença é pura" — toda decisão tem uma mistura de cargas, mas uma
  **prepondera**. O app usa a **ternária** por simplicidade didática e registra a
  quinária como nota. Fonte:
  [Classificação das sentenças (Jusbrasil)](https://www.jusbrasil.com.br/artigos/classificacao-das-sentencas/657105793).

- **Espécie quanto ao órgão julgador** — quem proferiu a decisão:
  **subjetivamente simples** (um juiz sozinho — órgão monocrático), **plúrima**
  (um órgão **colegiado**, ex.: uma câmara do tribunal) ou **complexa** (mais de um
  órgão decide partes diferentes, ex.: no Júri os jurados decidem o mérito e o
  juiz-presidente a pena). Analogia: uma decisão de árbitro único × um conselho ×
  uma mesa dividindo tarefas. No app isso **casa com a fase recursal**: 1º grau
  costuma ser **simples** (sentença de juiz singular) e a apelação/instância
  superior vira **plúrima** (**acórdão** de colegiado). Fonte:
  [Espécies de sentença (Jusbrasil)](https://www.jusbrasil.com.br/artigos/especies-de-sentenca/121936620).

- **Classificação pelo conteúdo no processo penal (nota do artigo de referência)**
  — a fonte que baliza o tema classifica ainda as sentenças **criminais** em
  **condenatória** (acolhe a *pretensão punitiva*), **absolutória** —
  **própria** (nenhuma sanção, CPP art. 386) ou **imprópria** (impõe *medida de
  segurança*) — e **terminativa de mérito** (julga o mérito sem condenar nem
  absolver, ex.: extinção da punibilidade). É vocabulário **penal**; o app trata do
  contencioso **cível** da concessionária, então essa grade entra como **nota
  comparativa** (o eixo principal do app está definido acima). Fonte:
  [Espécies de sentença (Jusbrasil)](https://www.jusbrasil.com.br/artigos/especies-de-sentenca/121936620).

- **Fases recursais / sistema recursal** — o **caminho de impugnação** de uma
  decisão, do 1º grau até a última instância. Principais recursos (CPC, art. 994 e
  seguintes): **apelação** (contra a sentença, sobe ao tribunal de 2º grau),
  **recurso especial** (STJ — uniformiza a interpretação da lei **federal**),
  **recurso extraordinário** (STF — matéria **constitucional**), além dos
  **embargos de declaração** (corrigem obscuridade/omissão/contradição) e dos
  **agravos**. Analogia: recorrer é "pedir revisão do lance" a uma instância cada
  vez mais alta. No app, viram o **ciclo de status** (1º grau → Apelação →
  Instância superior → Transitado em julgado). Fonte:
  [CPC, art. 994 (Planalto)](http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13105.htm) ·
  [Quadro de recursos no processo civil (MPCE)](https://mpce.mp.br/institucional/nurc/quadro-de-recursos-no-processo-civil/) ·
  [Tipos de recursos cíveis (Jusbrasil)](https://www.jusbrasil.com.br/artigos/tipos-de-recursos-juridicos-civeis/791765686).

- **Trânsito em julgado** — o momento em que **acabam os recursos** cabíveis e a
  decisão se torna **imutável** (coisa julgada). Analogia: o placar entra para a
  súmula do campeonato — ninguém revisa mais. No app é a **última fase**: carimba
  a data e "arquiva" o caso; reabrir/voltar limpa o carimbo. Fonte:
  [Quadro de recursos no processo civil (MPCE)](https://mpce.mp.br/institucional/nurc/quadro-de-recursos-no-processo-civil/).

- **Relação de consumo / CDC** — quando alguém contrata um serviço como
  destinatário final, vale o **Código de Defesa do Consumidor (Lei nº
  8.078/1990)**: fornecedor responde de forma mais rígida, o ônus da prova pode
  ser **invertido** a favor do consumidor e a cobrança indevida gera **repetição
  de indébito** (devolução em dobro, art. 42, parágrafo único). Analogia: as
  regras do jogo pendem para proteger o lado mais fraco. No app é o **mérito**
  típico das disputas da Eletroca (é por isso que a carga **condenatória**
  predomina). Fonte:
  [CDC — Lei 8.078/1990 (Planalto)](http://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm).

- **ANEEL / REN nº 1.000/2021** — a **ANEEL** é a agência que regula o setor
  elétrico. A **Resolução Normativa nº 1.000/2021** reúne, num só documento, os
  **direitos e deveres do consumidor de energia** (regras de faturamento, corte,
  religação, prazos) — consolidou dezenas de normas e **revogou a REN 414/2010**.
  Analogia: o "manual da casa" que o contrato de luz precisa seguir. No app, é a
  **régua regulatória** por trás de muitas decisões de consumo. Fonte:
  [REN ANEEL 1.000/2021 (ANEEL)](https://www2.aneel.gov.br/cedoc/ren20211000.html) ·
  [ANEEL — resumo da Resolução 1.000](https://www.gov.br/aneel/pt-br/assuntos/noticias/2022/conheca-a-resolucao-1-000-que-reune-os-direitos-e-deveres-do-consumidor-de-energia-eletrica).

- **Tipo de lide de consumo (`tipoLide`)** — o **assunto** da disputa, sempre
  ancorado no CDC/ANEEL. O app oferece 6: **cobrança/faturamento indevido**;
  **recuperação de consumo / irregularidade no medidor (TOI** — o *Termo de
  Ocorrência de Irregularidade* que a distribuidora lavra quando suspeita de
  fraude no medidor); **interrupção/corte de fornecimento**; **dano moral**;
  **dano material** (aparelhos queimados por surto/oscilação); e **repetição de
  indébito** (devolução **em dobro** do que foi cobrado indevidamente, CDC art.
  42, parágrafo único). Analogia: é a "etiqueta do caso" que diz do que ele trata.
  No app, alimenta filtros e o painel — e conecta com **relação de consumo / CDC**.

- **Função pura** — um pedaço de código que, para a **mesma entrada**, dá **sempre
  a mesma saída** e **não mexe em nada de fora** (não lê tela, não grava banco).
  Analogia: uma calculadora — 2+2 é sempre 4, sem efeito colateral. No app, a
  **classificação da espécie** e a **prioridade de atuação** são funções puras:
  fáceis de testar e nunca "digitadas no chute". Conecta com **mérito** e **carga
  de eficácia**, que são as entradas de `classificarEspecie`.

## Etapa 2.5 — Ferramental de qualidade de código

- **ESLint** — o "revisor automático" do JavaScript: aponta erros e maus hábitos
  (variável não usada, `==` onde devia ser `===`…). Analogia: o corretor
  ortográfico, mas para código. No app roda com `npm run lint`.
- **Prettier** — o "formatador": reescreve o código num **padrão único** (aspas,
  vírgulas, indentação), então ninguém discute estilo. Analogia: passar o texto
  todo pela mesma régua de formatação. Roda com `npm run format`.
- **Husky** — instala **git hooks** (gatilhos automáticos do Git). Analogia: um
  porteiro que confere as regras na entrada. Aqui ativa o **pre-commit**.
- **pre-commit** — gatilho que roda **antes de cada commit**: neste projeto,
  `lint + format + test`. Se algo reprova, o commit não acontece — código fora do
  padrão ou com teste vermelho **não entra no histórico**.
- **`.gitignore` / `.eslintignore` / `.prettierignore`** — listas do que cada
  ferramenta deve **ignorar** (ex.: `node_modules/`, artefatos de teste). Analogia:
  a lista de "não guardar isto" antes de arrumar o armário.

> **Nota deste layout:** como o `.git` fica na pasta-raiz do experimento (e não
> dentro de cada projeto), o Husky v9 **não fixa** o hook automaticamente aqui
> (sai sem erro, por design). O arquivo `.husky/pre-commit` fica como referência
> do gatilho pretendido; na prática, `npm run lint`/`format`/`test` são rodados a
> cada etapa antes de encerrar.

## Etapa 3 — Primeira tela (design + acessibilidade)

- **Inspiração visual (Jusbrasil)** — a **marca/sistema de mercado** que guia
  paleta e estilo. Aqui é o **Jusbrasil** (portal jurídico), com azul institucional
  e verde. Analogia: é o "figurino" do app. Diferente da **fundamentação** (o
  *porquê* jurídico) — inspiração é o *visual*. **Escolhida pelo usuário**, não
  pela IA.
- **Design tokens** — as "peças de Lego" do visual guardadas em variáveis
  (espaçamento 4/8/12/16/24, cores, raio, sombra, tipografia). Analogia: uma
  paleta de tintas e réguas padronizadas; ninguém pinta com cor solta. Garantem
  telas consistentes.
- **Contraste / razão de contraste (WCAG)** — o quão distinta uma cor de texto é
  do fundo (de 1:1 a 21:1). O **WCAG AA** exige ≥ **4,5:1** (texto normal). No app,
  o **rodapé mede ao vivo** e um **teste reprova** qualquer par abaixo de AA.
  Analogia: ler texto cinza-claro no branco cansa — o contraste garante leitura.
- **`validarEspacamento`** — função pura que mede a **folga entre as caixas** dos
  elementos (via `getBoundingClientRect`) e exige distância **> 0,5px**, ignorando
  pares **pai/filho** (que se contêm de propósito). Analogia: um fiscal que mede se
  os móveis não estão grudados. Garante "nada colado" **por teste**, não só pelo
  olho.
- **Prévia calculada (`rotuloEspecie`)** — monta o texto amigável da espécie
  (ex.: "Definitiva · condenatória · plúrima") a partir do que as funções puras
  calcularam — reforçando que a classificação **não é digitada**.

## Etapa 4 — Persistência (localStorage)

- **localStorage** — o "caderno de anotações" do navegador: guarda dados no
  próprio computador do usuário, **sem servidor nem banco**. Analogia: uma gaveta
  na sua mesa — o que você guarda continua lá quando volta. No app, as decisões
  ficam na gaveta `instancia:decisoes`.
- **Serializar / desserializar** — converter os dados em **texto** para guardar
  (`serializarDecisoes` → JSON) e de volta em objetos ao ler (`lerDecisoesDe`).
  Analogia: dobrar a roupa para caber na gaveta e desdobrar ao usar.
- **Fronteira de segurança (leitura blindada)** — `lerDecisoesDe` **nunca lança
  erro**: se o texto guardado estiver vazio, quebrado ou adulterado, devolve uma
  lista vazia e descarta itens estranhos. Analogia: um porteiro que barra o que
  não parece decisão, para o app não cair por causa de dado torto.
- **Repositório (`repositorio.js`)** — a camada **impura** que fala com o
  localStorage e carimba o que vem do "mundo externo" (`id`, data de criação,
  fase inicial). Fica separada das **funções puras** (que só calculam), para a
  lógica continuar fácil de testar.

## Etapa 5 — Lista por fase recursal

- **Agrupar por fase (`agruparPorFase`)** — separa as decisões em "gavetas" na
  ordem do trâmite (1º grau → apelação → instância superior → transitado), cada
  uma com um contador. Analogia: um fichário com uma aba por instância.
- **Ordenar por prioridade (`ordenarPorPrioridade`)** — dentro de cada fase,
  mostra primeiro o que exige ação (maior prioridade). É **ordenação estável**: em
  caso de empate, mantém a ordem original — nada "pula de lugar" sem motivo.
- **Injetar o "hoje" (`hojeISO`)** — para calcular quantos dias faltam ao prazo
  sem perder a pureza, a data de hoje é **passada de fora** para as funções, em vez
  de lida do relógio lá dentro. Assim o teste controla o "hoje" e o resultado é
  sempre o mesmo. Conecta com **função pura**.
- **Recalcular, não confiar no salvo** — espécie e prioridade são **recalculadas**
  na hora de exibir, a partir dos dados; um campo adulterado na gaveta não engana
  a tela. Reforça a **fronteira de segurança**.

## Etapa 6 — Ciclo de fases recursais

- **Ciclo de fases (avança/volta um passo)** — a decisão caminha 1º grau →
  apelação → instância superior → transitado, e pode **voltar** um passo, mas as
  pontas **travam** (não dá para avançar além do trânsito nem voltar antes do 1º
  grau). Analogia: subir e descer um lance de escada, sem cair no vão. "Sem beco
  sem saída" é pilar de usabilidade do projeto.
- **Carimbar / limpar o trânsito (`definirFase`)** — ao chegar em "transitado", a
  data é **carimbada** (`dataTransito`); ao **reabrir** (voltar), a data é
  **limpa**, pois o processo voltou a correr. Analogia: bater o carimbo de
  "encerrado" — e tirá-lo se o caso for reaberto.

## Etapa 7 — Painel do contencioso (dashboard)

- **Painel/dashboard (`calcularResumo`)** — os números-chave do conjunto num
  relance: total, quantas com **prazo recursal correndo**, quantas **transitadas**,
  a **exposição em disputa** (soma do valor em risco das que ainda não transitaram)
  e o **destaque** ("aja por esta primeiro"). Analogia: o painel do carro — você
  vê o essencial sem abrir o motor.
- **Exposição "em disputa"** — soma só o que ainda está em jogo (exclui o que já
  transitou em julgado): mostra o risco financeiro que a empresa ainda pode mudar.
- **Tile em "atenção"** — o cartão de prazo fica destacado (borda/vermelho) quando
  há prazo correndo, chamando o olho para o que exige ação — respeitando o
  contraste WCAG AA.

## Etapa 8 — Filtros/preferências persistidos

- **Filtro (`filtrarDecisoes`)** — mostra só as decisões que casam com fase,
  espécie (mérito) e resultado escolhidos. Analogia: peneirar; o que não passa some
  da lista (mas continua salvo). "Todas/Todos" = sem peneira.
- **Preferência persistida (`lerPreferencias`/`salvarPrefs`)** — a escolha de
  filtro fica guardada na gaveta `instancia:prefs` e **volta aplicada** quando você
  reabre o app. Analogia: o app lembra como você deixou as coisas. Leitura
  **blindada**: preferência corrompida cai no padrão.

## Etapa 9 — Ações destrutivas com confirmação

- **Ação destrutiva** — algo que apaga dados (excluir uma decisão, reiniciar
  tudo). Sempre pede **confirmação** antes, para não apagar por engano. Analogia: a
  pergunta "tem certeza?" antes de rasgar um documento.
- **`removerDecisao`** — função pura que devolve a lista **sem** o item de um id
  (não altera a original). Analogia: tirar uma ficha do fichário e entregar um
  fichário novo, sem a ficha.
- **Reiniciar experiência (`limparTudo`)** — zera decisões **e** preferências,
  voltando o app ao estado inicial (com confirmação). É o "recomeçar do zero".

## Etapa 9.5 — Valor da causa × valor da condenação

- **Valor da causa (`valorCausa`)** — quanto está **em risco** na disputa (o
  pedido). Alimenta a **exposição em disputa** e a prioridade. Analogia: o tamanho
  da aposta enquanto o jogo não acabou.
- **Valor da condenação / a pagar (`valorCondenacao`)** — quanto a empresa foi
  **efetivamente condenada a pagar** naquela decisão (0 se venceu/defendeu).
  Analogia: a conta final. Somado no painel como **"Total condenado (a pagar)"**.
- **% defendidos** — percentual de decisões **improcedentes** (a empresa se
  defendeu com êxito). É um placar de sucesso do jurídico.

## Etapa 10 — Exportar / limpar (LGPD)

- **Exportar (`montarExportacao`)** — gera um arquivo `.json` com todas as decisões
  para o usuário **levar embora** (o dado é dele — LGPD). Analogia: pedir a segunda
  via de tudo que está guardado.
- **Limpar meus dados** — apaga as decisões salvas (com confirmação), sem enviar
  nada a lugar nenhum — tudo sempre foi só no navegador.

## Etapa 11 — Acessibilidade e testes E2E

- **Acessibilidade (WCAG AA)** — o app precisa servir a todos: contraste medido e
  garantido por teste, navegação por **teclado**, **foco visível**, rótulos ligados
  aos campos (`for/id`), agrupamentos em `fieldset/legend` e regiões `aria-live`
  que anunciam mudanças (prévia, contador, painel).
- **Teste E2E (Playwright)** — abre um **navegador de verdade** e usa o app como um
  usuário: cadastra, classifica, avança de fase, exclui. Analogia: um fiscal
  percorrendo a casa pronta. Localiza elementos por **`data-testid`** (não quebra
  quando o visual muda). Complementa os unitários (Jest) no topo da **pirâmide**.
