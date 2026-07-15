# Glossário do projeto — Render Mais (ex-"Renda Fixa Conservadora")

## Siglas & legendas (referência rápida)

> Também disponíveis **na tela**, no botão **"Siglas"** do topo (painel lateral que
> abre/fecha).

| Sigla | Significado |
|---|---|
| **CDB** | Certificado de Depósito Bancário (coberto pelo FGC) |
| **CDI** | Certificado de Depósito Interbancário — a régua da renda fixa |
| **% do CDI** | Quanto o produto paga em relação ao CDI |
| **LCI / LCA / LF** | Letras de crédito (Imobiliário / Agronegócio / Financeira) — LCI/LCA isentas de IR |
| **LFT** | Letra Financeira do Tesouro (o Tesouro Selic) |
| **Selic** | Taxa básica de juros (Copom) |
| **IR** | Imposto de Renda (regressivo na renda fixa) |
| **FGC** | Fundo Garantidor de Créditos (R$ 250 mil por CPF/instituição) |
| **DY** | Dividend Yield (dividendo em % do preço, ao ano) |
| **RF / RV** | Renda Fixa / Renda Variável |
| **CVM** | Comissão de Valores Mobiliários (define o suitability) |
| **WCAG (AA/AAA)** | Padrão de acessibilidade e seus níveis |
| **a.a. / p.p.** | ao ano / pontos percentuais |


> **Modelo "estado zero".** Cresce ao longo da experiência: a cada avanço, a IA
> acrescenta aqui os termos novos, em **linguagem simples** (como para alguém sem
> conhecimento técnico), explicando o **porquê** de existir no projeto.

## Etapa 1 — Fundamentação (conceito central)

- **CDI (Certificado de Depósito Interbancário)** — a taxa dos empréstimos de um
  dia entre bancos; anda quase colada na Selic. É a **régua** da renda fixa: os
  produtos rendem "X% do CDI". No app, é a base de todo cálculo de rendimento.
- **Selic** — a taxa básica de juros do país, definida pelo Copom. É o "juro-mãe":
  quando sobe, quase tudo na renda fixa rende mais. No app, indexa o Tesouro Selic.
- **% do CDI** — quanto um produto paga em relação ao CDI. Ex.: 110% do CDI rende
  110% da taxa do CDI. Serve para comparar ofertas na mesma régua.
- **IR regressivo** — imposto sobre o **ganho** da renda fixa que **diminui com o
  tempo**: 22,5% (até 180 dias) → 20% → 17,5% → 15% (acima de 720 dias). Quanto
  mais tempo parado, menos imposto. No app, entra na função de rendimento líquido.
- **Isenção de IR (LCI/LCA e poupança)** — esses produtos **não pagam IR**, então
  um "% do CDI" menor pode render mais **líquido** que um CDB tributado.
- **Come-cotas** — nos **fundos**, um adiantamento de IR em maio e novembro (come
  um pedaço das cotas). É por isso que fundo tem tratamento diferente de um CDB.
- **FGC (Fundo Garantidor de Créditos)** — um "seguro" que devolve até **R$ 250
  mil por CPF e por instituição** (teto de R$ 1 mi a cada 4 anos) se o banco
  quebrar. É o que faz um CDB de banco médio ser "baixo risco". No app, sinaliza
  quando um valor passa do teto garantido.
- **Tesouro Selic / LFT (ex.: LFT 010331 = Tesouro Selic 2031)** — título público
  **pós-fixado** (Selic + um pequeno spread), com liquidez diária. É a base da
  reserva de emergência — risco muito baixo.
- **Perfil do investidor / Suitability** — a "prova" que classifica a pessoa em
  **conservador, moderado ou agressivo** (Resolução CVM 30). O app mira o perfil
  **conservador** e mede se a carteira está aderente a ele.
- **Diversificação (Markowitz)** — não pôr tudo num produto só: combinando ativos
  que não sobem/descem juntos, a carteira arrisca menos que a média. É o porquê de
  o app sugerir **proporções** por classe, não um único produto.
- **Fronteira eficiente** — o conjunto das melhores carteiras (mais retorno para
  cada nível de risco). Inspira a ideia de "carteira-alvo" de baixo risco.
- **Nível de risco (muito baixo / baixo / médio)** — como o app agrupa os
  produtos. Convenção interna calibrada pelas referências acima.
- **Rendimento real** — o ganho **descontada a inflação (IPCA)**. É o que de fato
  aumenta o poder de compra. No app, aparece ao lado do rendimento nominal.
- **Liquidez** — quão rápido dá para resgatar sem perda (diária, no vencimento,
  com carência). Importa para a parcela de reserva.

## Etapa 2 — Núcleo da lógica (funções puras)

- **Função pura** — uma função que, para a mesma entrada, dá **sempre a mesma
  saída** e não mexe em nada de fora (sem salvar, sem tela, sem "hora de agora").
  É a receita de bolo que sempre sai igual. No app, é onde vivem os cálculos —
  fácil de testar e à prova de erro de digitação.
- **Rendimento bruto** — o ganho **antes** de descontar o imposto. É o número
  "de vitrine". No app, sai de `rendimentoBruto`.
- **Rendimento líquido** — o que **sobra no bolso** depois do IR (ou o próprio
  bruto, se o produto for isento). É o número que realmente importa para comparar
  produtos. No app, sai de `rendimentoLiquido`.
- **Ganho** — a diferença entre o que você resgata e o que aplicou (só os juros,
  sem o principal). O IR incide sobre o ganho, não sobre o valor todo.
- **Juros compostos (capitalização)** — juros que rendem sobre juros: a cada dia
  o ganho entra na base do dia seguinte, como uma bola de neve. No app, a taxa
  diária é capitalizada pelos dias do prazo.
- **Dias corridos × dias úteis** — "corridos" contam todo dia do calendário;
  "úteis" só os dias de pregão (~252/ano). O IR usa **dias corridos** (180/360/
  720). Convenção do app: usar dias corridos em tudo (simplificação didática).
- **Alíquota** — o **percentual** do imposto aplicado sobre o ganho (ex.: 17,5%).
  No app, vem da tabela regressiva em `aliquotaIR`.
- **Peso na carteira** — a fatia (%) que um aporte representa no total investido.
  Serve para dizer se a carteira está concentrada demais num produto ou risco.
- **Validação** — a "portaria" que barra aporte com dado faltando ou errado
  (valor ≤ 0, categoria inexistente, sem nome) antes de entrar na carteira.

## Etapa 2.5 — Ferramental de qualidade de código

- **ESLint** — um "corretor" que lê o código JavaScript e aponta erros e maus
  hábitos (variável não usada, comparação perigosa). No app, roda com
  `npm run lint` e evita que bug bobo entre no projeto.
- **Prettier** — um "formatador" que reescreve o código num padrão único (aspas,
  vírgulas, indentação), então todo mundo escreve igual. Roda com `npm run format`.
- **Husky** — instala **git hooks**: gatilhos que disparam sozinhos em momentos do
  Git. No app, é quem liga o pre-commit.
- **pre-commit** — o gatilho que roda **antes de cada commit**. Aqui ele chama
  lint + format, então código com erro ou fora do padrão não entra no histórico.
- **`.gitignore`** — a lista do que **não** sobe para o repositório
  (`node_modules/`, resultados de teste, `.DS_Store`). Sobe só o que é fonte.
- **`.eslintignore` / `.prettierignore`** — o mesmo tipo de lista, mas dizendo
  quais arquivos o ESLint e o Prettier devem **ignorar**.

## Etapa 3 — Primeira tela (design + acessibilidade)

- **Inspiração visual** — a marca/sistema de mercado de onde saem as cores e o
  tom da tela. Aqui é a **XP Investimentos** (preto + amarelo, ar de corretora).
  Diferente da fundamentação (que é o "porquê" do app).
- **Design tokens** — as "peças de Lego" do visual: uma escala única de
  espaçamento, cores, raio e tipografia guardadas em variáveis CSS e reusadas em
  tudo. Evita valor solto e mantém a tela coerente.
- **Contraste (WCAG AA/AAA)** — o quanto o texto se destaca do fundo. A WCAG é o
  padrão de acessibilidade; **AA** é o mínimo aceitável e **AAA** o ideal. No app,
  o rodapé mede isso ao vivo.
- **Luminância** — o "brilho" de uma cor (de 0=preto a 1=branco). É o ingrediente
  da conta de contraste. No app, sai de `luminancia`.
- **Razão de contraste** — o resultado da comparação entre duas cores, de 1:1
  (iguais) a 21:1 (preto × branco). No app, `razaoContraste` a calcula e
  `nivelWcag` diz se passou.
- **`data-testid`** — uma etiqueta invisível colada em botões e campos só para os
  testes acharem o elemento. Assim o E2E não quebra quando o visual muda.
- **Teste de espaçamento** — a garantia, por teste, de que nenhum controle fica
  "colado" no vizinho (folga > 0,5px). `validarEspacamento` mede as caixas reais
  dos elementos no navegador.
- **Prévia ao vivo** — o resultado (risco, bruto, IR, líquido) recalculado a cada
  tecla, sem precisar salvar. Dá retorno imediato de "quanto isso rende".

## Etapa 4 — Persistência (localStorage)

- **localStorage** — uma "gavetinha" do navegador que guarda dados no próprio
  computador, mesmo depois de fechar a aba. No app, é onde a carteira fica salva
  (sem servidor, sem banco). O dado é seu e não sai da máquina.
- **Serialização** — transformar a lista de aportes num **texto** (JSON) para
  caber na gavetinha, e depois voltar de texto para lista. No app,
  `serializarAportes` e `desserializarAportes` fazem esse ida-e-volta.
- **JSON** — um formato de texto simples para guardar dados (listas e objetos).
  É a "língua" usada para salvar a carteira.
- **Leitura blindada** — ler os dados salvos com cuidado: se o texto estiver
  corrompido ou fora do formato, o app assume **lista vazia** em vez de travar.
  Evita que um dado estragado derrube a tela.
- **Valor derivado x valor guardado** — a carteira **guarda só o que foi digitado**
  (produto, valor, prazo…); o rendimento e o risco são **recalculados na hora de
  mostrar**, nunca salvos — assim nunca ficam "velhos" ou errados.

## Etapa 5 — Lista organizada por risco

- **Agrupar por nível de risco** — juntar os aportes em três caixas (muito baixo,
  baixo, médio) para enxergar a **composição** da carteira, não só uma lista solta.
- **Peso do grupo (% da carteira)** — quanto cada nível representa do total
  investido (ex.: 50% em "baixo"). É o número que mostra se a carteira está
  "conservadora" o suficiente. No app, sai de `agruparPorRisco` (via
  `pesoNaCarteira`).
- **Patrimônio total** — a soma de tudo que foi aplicado. É a base para calcular
  os pesos. No app, `totalCarteira`.
- **Ordenar por valor** — dentro de cada grupo, o maior aporte aparece primeiro.
  Como peso = valor / total, ordenar por valor é o mesmo que ordenar por peso.
- **Função imutável (não muta)** — a ordenação devolve uma **cópia** ordenada e
  deixa a lista original intacta. Evita "efeito colateral" surpresa em quem chamou.

## Etapa 6 — Ciclo de status do aporte

- **Ciclo de status** — a "vida" de um aporte em quatro fases: **Planejado →
  Aplicado → Resgatável → Resgatado**. Ele avança um passo e volta um passo, sem
  beco sem saída (dá sempre para corrigir).
- **Carimbo de data** — ao mudar de fase, o app anota a data (ex.: quando virou
  "Aplicado"). Voltar de fase **apaga** o carimbo. A data vem "de fora" (a tela
  passa o dia) para a função continuar pura.
- **Transição** — a passagem de uma fase para a vizinha. As funções
  `avancarAporte`/`voltarAporte` só permitem ir para a fase ao lado, nunca pular.
- **Botão desabilitado** — no início, "Voltar" fica apagado; no fim, "Avançar".
  Mostra visualmente que não há para onde ir — o beco sem saída fica impossível.
- **Carteira de exemplo (LGPD)** — um conjunto de aportes fictícios que **espelha
  a estrutura** de uma carteira real (CDB PRÉ/DI, Título público/LFT, Poupança,
  Fundos, LCI/LCA), mas com **valores arredondados/inventados**. Deixa explorar o
  app cheio sem usar dado real de ninguém.

## Etapa 7 — Dashboard (indicadores)

- **Dashboard / painel** — a "tela de instrumentos" da carteira: mostra de relance
  os números-chave (patrimônio, rendimento, aderência) e o que exige atenção.
- **Patrimônio total** — a soma de tudo que está investido. É a base dos pesos.
- **Rendimento líquido projetado** — quanto a carteira inteira renderia no bolso
  (soma do líquido de cada aporte), já descontando o IR de quem paga.
- **Aderência ao perfil conservador** — se a carteira respeita o **teto de risco
  médio** do perfil (≤ 15%). Acima disso, ela sai do perfil "conservador".
- **Carteira-alvo (perfil conservador)** — a proporção ideal por risco que o app
  usa como referência (convenção interna, calibrada pelas fontes): mais peso em
  muito baixo/baixo e pouco em médio.
- **Teto do FGC (R$ 250 mil)** — o limite garantido por CPF e por instituição.
  O painel alerta quando um aporte coberto pelo FGC passa desse valor (o excedente
  fica sem garantia).
- **Alerta** — um aviso do que precisa de atenção agora (risco médio acima do teto,
  valor acima do FGC). Some sozinho quando a situação é resolvida.

## Etapa 8 — Filtros e preferências persistidas

- **Filtro** — uma "peneira" que mostra só parte da carteira (por categoria, risco
  ou horizonte), sem apagar nada. Ajuda a focar num pedaço.
- **Horizonte** — em quanto tempo você precisa do dinheiro: **curto** (até 1 ano),
  **médio** (1–2 anos) ou **longo** (mais de 2 anos). Casa o prazo do produto com
  o seu objetivo.
- **Perfil-alvo (conservador / moderado / agressivo)** — o quanto de risco médio
  você tolera. Cada perfil tem um **teto** (15% / 30% / 60%): a mesma carteira
  pode ser "fora do perfil" no conservador e "aderente" no moderado.
- **Preferência persistida** — filtros e perfil ficam **salvos** no navegador e
  voltam aplicados quando você reabre o app — não precisa reconfigurar.
- **Peso relativo à carteira inteira** — mesmo filtrando, o "% da carteira" de
  cada grupo continua calculado sobre o total real (o filtro só esconde itens, não
  muda a composição).

## Etapa 9 — Simulador de melhoria (como render mais)

- **Rentabilidade anualizada** — o rendimento líquido transformado em "% ao ano",
  para comparar produtos de prazos diferentes **na mesma régua**. Um que rende 5%
  em 6 meses rende mais, por ano, que outro com 5% em 12 meses.
- **Rebalancear** — trocar/realocar aportes para melhorar o resultado (mais renda
  e/ou risco mais adequado). O app aponta as trocas com **maior ganho** primeiro.
- **Produto-alvo (referência)** — o "bom exemplo" com que o app compara cada
  aporte (um CDB DI a 110% ou uma LCI isenta a 97%): se o seu rende menos que o
  melhor alvo, vira dica de troca.
- **Ganho anual estimado** — quanto a mais, por ano, aquela troca renderia (a
  diferença de taxa vezes o valor). É o que ordena as dicas.
- **Mudança de risco da troca** — cada dica mostra o risco atual → o do alvo. Se
  **sobe** (ex.: Tesouro "muito baixo" → LCI "baixo"), aparece em vermelho com ⚠:
  render mais às vezes custa um pouco mais de risco (e de liquidez).
- **IR descontado / economia de IR** — quanto de Imposto de Renda sai do ganho hoje
  × no alvo. Como LCI/LCA é **isenta**, trocar uma tributada por ela **economiza o
  IR** — boa parte do ganho da troca vem daí.
- **Apetite de risco ("só trocas que não aumentam o risco")** — uma opção que filtra
  as dicas: só mostra trocas de risco **igual ou menor**. Para produtos "muito
  baixo" (Tesouro/poupança), some a dica — não há alvo melhor sem subir o risco.
- **IR da renda variável** — ao contrário da RF, você informa o retorno **esperado
  bruto**; o app desconta o IR: **ações 15%** fixo, **multimercado** pela tabela
  regressiva. Prejuízo não paga IR.

## Etapa 20 — Dividendos / renda passiva

- **Dividendos** — parte do lucro que a empresa distribui aos acionistas. Quem tem
  a ação recebe "um pinguinho" periódico, sem vender o papel.
- **Dividend Yield (DY)** — quanto a ação paga de dividendo em % do preço, por ano
  (ex.: DY 6% = R$ 60/ano para cada R$ 1.000). No app, você informa o **DY
  esperado** por ação e ele projeta a renda.
- **Renda passiva** — o dinheiro que "pinga" sem esforço (aqui, a soma dos
  dividendos esperados por ano e por mês). No app, `rendaPassivaCarteira`.
- **Yield trap (armadilha de dividendo)** — DY **alto demais** costuma esconder
  problema (preço caiu, provento não recorrente). O app **alerta** quando o DY de
  uma ação passa de 15%.
- **Concentração** — muito dinheiro num único produto aumenta o risco de um baque
  isolado. O app alerta quando um aporte passa de **30% da carteira**.

## Etapa 21 — Meta de renda passiva + E2E das visões de risco

- **Meta de renda passiva** — você diz quanto quer receber por mês em dividendos e,
  a um DY médio, o app calcula **quanto precisa ter investido** e **quanto falta**.
  No app, `metaRendaPassiva`. Ex.: R$ 1.000/mês a 6% a.a. ⇒ R$ 200 mil investido.
- **Visões de risco (baixo/médio/alto)** — três formas de buscar mais renda: só
  trocas que **não sobem o risco** (baixo), liberar trocas que sobem **um degrau**
  (médio) e acrescentar **ações de maior retorno** (alto). Um E2E compara as três
  sobre a carteira de ~R$ 88 mil e confirma que cada uma aumenta a rentabilidade.
- **Aporte para a meta (meta → plano)** — o **inverso** do plano mensal: dado o
  capital que falta e um prazo, calcula **quanto aportar por mês** para chegar lá.
  No app, `aporteMensalParaMeta`. Ex.: juntar ~R$ 200 mil em 10 anos ≈ R$ 967/mês.
- **Subir de perfil** — aceitar um pouco mais de risco (conservador → moderado)
  para buscar mais retorno. No app, trocar o **perfil-alvo** mostra se a carteira
  passa a caber no novo teto de risco médio.

## Etapa 10 — Ações destrutivas (remover aporte)

- **Ação destrutiva** — uma ação que **apaga dados** (remover um aporte, reiniciar
  a carteira). Por segurança, sempre pede **confirmação** antes.
- **Remover aporte** — tirar um investimento específico da carteira, sem mexer nos
  outros. No app, cada item tem um botão "Remover" (em vermelho) que pede confirmação.
- **Função imutável na remoção** — `removerAporte` devolve uma **nova lista** sem o
  item, deixando a original intacta; a tela então salva e redesenha.

## Etapa 11 — Exportar / limpar dados (LGPD)

- **LGPD (Lei Geral de Proteção de Dados)** — o princípio de que **o dado é seu**:
  você pode levá-lo embora (exportar) e apagá-lo quando quiser.
- **Exportar (JSON)** — baixar a carteira e as preferências num arquivo de texto
  (`carteira-renda-fixa.json`), para guardar ou levar para outro lugar.
- **Blob / download no navegador** — o truque de montar um "arquivo em memória"
  (Blob) e clicar num link invisível para baixá-lo, sem servidor.
- **Limpar dados** — apagar tudo. No app, o "Reiniciar experiência" já faz isso
  (com confirmação), zerando carteira e preferências.

## Etapa 12 — Acessibilidade WCAG AA

- **Skip-link ("Pular para o conteúdo")** — um atalho que aparece ao apertar Tab e
  leva direto ao conteúdo principal, sem percorrer o cabeçalho toda vez. Ajuda quem
  navega por teclado ou leitor de tela.
- **`aria-live`** — marca uma área que muda sozinha (prévia, painel) para o leitor
  de tela **anunciar** a atualização sem o usuário procurar.
- **Rótulo acessível (`<label for>`)** — todo campo é ligado ao seu texto, então o
  leitor de tela sabe "isto é o campo Produto". Testado no E2E por `getByLabel`.
- **Foco visível** — o contorno amarelo que mostra onde o teclado está. Nunca
  removido — é como quem não usa mouse se localiza.
- **Fluxo crítico (E2E)** — o caminho principal (cadastrar → ver painel → filtrar →
  exportar) coberto de ponta a ponta, para garantir que o essencial nunca quebre.

## Etapa 13 — Pivô "Render Mais" + Simulador de trocas

- **Render Mais** — o novo nome/foco do app: **aumentar a rentabilidade** (não é
  mais sobre "ser conservador"), trocando aplicações fracas por melhores e/ou
  começando um plano mensal de aportes.
- **Simular trocas (antes × depois)** — aplicar de mentira todas as dicas e
  comparar a carteira **antes** e **depois**: rentabilidade média e renda por ano.
- **Rentabilidade média da carteira** — a média das rentabilidades dos aportes,
  **ponderada pelo valor** (aportes maiores pesam mais). É o "juro médio" da carteira.
- **Veredito** — a conclusão da simulação: se as trocas **aumentam** a renda (e
  quanto por ano) ou não. Responde direto "vale a pena?".
- **Fatia faltando (aviso LGPD)** — a carteira real dos docs tinha uma parte em
  **ações/multimercado** (renda variável) — agora incluída (ver Etapa 15).

## Etapa 14 — Plano mensal (juros compostos)

- **Juros compostos** — juros que rendem sobre juros: cada aporte novo soma ao que
  já rende, como bola de neve. É o motor do plano mensal.
- **Aporte mensal** — um valor fixo investido todo mês. Constância + tempo é o que
  faz o patrimônio crescer, mesmo com valores pequenos.
- **Montante final × total investido** — o montante é quanto você teria no fim
  (com juros); o total investido é só a soma dos aportes. A diferença é o **ganho**.

## Etapa 15 — Renda variável (ações / multimercado)

- **Renda variável** — investimentos **sem retorno garantido** (ações, fundos de
  ações, multimercado): podem render mais, mas oscilam. Diferente da renda fixa.
- **Rentabilidade esperada** — como a RV não tem "% do CDI", você informa quanto
  espera que renda ao ano (uma estimativa, não uma promessa). O app projeta com ela.
- **Risco alto** — o nível novo, para ações: maior potencial de retorno e de perda.
  Entra na composição e na aderência (médio + alto contam contra o teto do perfil).

## Etapa 16 — Entregas finais

- **README** — o "manual" do projeto: o que é, como rodar, como testar, arquitetura
  e o passo a passo para subir ao GitHub.
- **Slides** — a história do Setup 0 ao app pronto, para apresentar.
- **Tutorial ao vivo** — um script (`node tutorial.js`) que **abre o navegador** e
  executa o fluxo inteiro de simulações, explicando qual função pura está por trás
  de cada tela — aprender vendo funcionar.
