# Glossário do projeto — Funil de Venda

> Este arquivo começa vazio e cresce **ao longo da experiência**: a cada avanço,
> a IA acrescenta os termos novos em **linguagem simples**, com analogia do dia a
> dia e o **porquê** de existir no projeto. Os primeiros termos (funil de vendas,
> modelo AIDA, etapas, Lead, qualificação BANT, probabilidade/taxa de conversão,
> valor ponderado) entram no **Prompt 1**.

## Como registrar cada termo (convenção)

- Agrupe os termos **por etapa** (ex.: "## Etapa 1 — Fundamentação").
- Cada termo em uma linha: **negrito** + explicação curta e concreta, de
  preferência com uma **analogia do dia a dia**.
- Explique o **porquê** de existir no projeto, não só o significado.
- Se um termo se conecta a outro, cite-o.

## Etapa 1 — Fundamentação

- **Funil de vendas** — a imagem de um funil de cozinha: **muita gente entra pela
  boca larga** (curiosos) e **poucos saem pelo bico fino** (clientes que compram).
  A cada etapa, uma parte desiste e o número diminui. No app, é a espinha dorsal:
  cada negócio ocupa uma **etapa** do funil, e enxergar isso mostra onde estão as
  oportunidades e onde elas travam. Nasce do **Modelo AIDA**. Fonte:
  [HubSpot — Sales Pipeline](https://blog.hubspot.com/sales/sales-pipeline).

- **Modelo AIDA** — as quatro fases pelas quais um cliente passa antes de comprar:
  **A**tenção → **I**nteresse → **D**esejo → **A**ção. Analogia: uma vitrine que
  primeiro te faz *olhar*, depois *chegar perto*, depois *querer* e por fim
  *entrar e comprar*. Criado pelo publicitário **Elias St. Elmo Lewis** (1898); a
  sigla "AIDA" foi cunhada por **C. P. Russell** (1921) e a ligação com o desenho
  de **funil** aparece em *Bond Salesmanship*, de **William W. Townsend** (1924).
  No app, é a origem da ideia de **etapas em ordem** que estreitam até o
  fechamento. Fonte:
  [ProvenModels — AIDA / Elias St. Elmo Lewis](https://www.provenmodels.com/547/aidasales-funnel/elias-st.-elmo-lewis) ·
  [MasterClass — AIDA Model](https://www.masterclass.com/articles/aida-model-explained).

- **Etapa (estágio do funil)** — cada degrau que um negócio sobe rumo ao
  fechamento. Neste projeto, em ordem: **Lead → Qualificação → Proposta →
  Negociação → Fechado**. Analogia: os andares de um prédio — você sobe um por vez
  e pode descer um se precisar recuar. No app, a etapa **avança na ordem e volta
  um passo** (sem beco sem saída) e é ela que define a **probabilidade** do
  negócio.

- **Lead** — um contato que demonstrou algum interesse, mas **ainda não é
  cliente** — está no topo (boca larga) do funil. Analogia: alguém que pediu o
  cardápio, mas ainda não fez o pedido. No app, é a **primeira etapa** de todo
  negócio, antes de ser qualificado.

- **Qualificação (BANT)** — checar se o Lead **vale a pena perseguir**, por quatro
  perguntas: **B**udget (tem orçamento?), **A**uthority (fala com quem decide?),
  **N**eed (tem uma necessidade real?), **T**imeline (tem prazo para comprar?) —
  em português, **Orçamento / Autoridade / Necessidade / Prazo**. Framework criado
  pela **IBM** nos anos 1950. Analogia: antes de fazer uma proposta de casamento,
  conferir se a pessoa está solteira, disponível e a fim. No app, a qualificação
  **ajusta a probabilidade** de fechamento com critérios objetivos, não com
  palpite. Fonte:
  [HubSpot — BANT](https://blog.hubspot.com/sales/bant) ·
  [Lucidchart — What is BANT](https://lucid.co/blog/what-is-BANT-and-how-can-it-streamline-lead-qualification).

- **Probabilidade de fechamento** — a chance (em %) de um negócio virar venda,
  estimada pela **etapa** em que ele está (quanto mais fundo no funil, maior) e
  ajustada pela **qualificação BANT**. Analogia: um time que já está na final tem
  mais chance de ser campeão do que um que está na primeira rodada. No app, é
  **calculada por função pura** — nunca digitada — para ser justa e testável.

- **Taxa de conversão** — de cada 10 negócios **fechados**, quantos foram
  **Ganhos**. É a nota do funil: mostra o quão eficiente é a passagem da boca larga
  ao bico fino. Analogia: de 10 pessoas que entraram na loja, quantas saíram com
  sacola. No app, é um dos números-chave do painel **"Visão do funil"**.

- **Valor ponderado (weighted pipeline)** — o valor do negócio **multiplicado pela
  probabilidade** dele fechar. Um negócio de R$ 10.000 com 30% de chance "vale",
  na previsão, R$ 3.000. Analogia: não é o quanto está na mesa, é o quanto
  realisticamente **cabe no bolso**. No app, é o critério que **ordena o foco**
  (os negócios mais "prováveis × valiosos" primeiro) e alimenta a previsão de
  receita do painel. Fonte:
  [HubSpot — Sales Pipeline](https://blog.hubspot.com/sales/sales-pipeline).

- **Ganho / Perdido (desfecho)** — como um negócio **sai** do funil ao ser
  fechado: **Ganho** (virou venda) ou **Perdido** (não fechou). Analogia: o apito
  final do jogo — vitória ou derrota, mas o jogo acabou. No app, fechar **carimba
  a data e o desfecho**; reabrir limpa o fechamento e devolve o negócio ao funil.

- **Função pura** — um pedaço de código que, para a mesma entrada, dá sempre a
  mesma saída e não mexe em nada por fora. Analogia: uma calculadora — 2+2 sempre
  dá 4. No app, a **probabilidade e o valor ponderado são calculados por função
  pura** (nunca digitados), o que os torna fáceis de testar e à prova de erro
  humano. Aparece de verdade no **Prompt 2**.

## Etapa 2 — Núcleo da lógica

- **Probabilidade-base por etapa** — a régua de chances que o app usa: **Lead 10%,
  Qualificação 25%, Proposta 50%, Negociação 75%, Fechado 100%**. Analogia: quanto
  mais perto da linha de chegada, maior a aposta de que o corredor termina. No app,
  é o ponto de partida do cálculo, ajustado depois pelo BANT.

- **Bônus BANT** — cada critério de qualificação atendido soma **+5%** na chance
  (até +20% com os quatro). Analogia: cada documento a mais que o cliente entrega
  aumenta a confiança de que o negócio sai. No app, é como a qualificação "afina" a
  probabilidade-base sem virar uma etapa à parte.

- **Validação de campos** — a "portaria" que barra um negócio malformado antes de
  salvar (sem nome, valor ≤ 0 ou etapa inexistente). Analogia: o formulário do
  cartório que devolve se faltou preencher. No app, `validarNegocio` devolve a
  lista de erros para a tela mostrar — em vez de deixar entrar dado quebrado.

- **Jest** — a ferramenta de mercado que **roda os testes** e avisa em verde/
  vermelho se a lógica ainda funciona. Analogia: o revisor que confere a conta
  toda vez que você mexe na planilha. No app, roda com `npm test` e cobre os
  cenários **(positivo)** e **(negativo)** de cada função.

## Etapa 3 — Primeira tela

- **Design tokens** — as "peças de LEGO" do visual: cores, espaçamentos, cantos e
  sombras guardados em variáveis (`--cor-primaria`, `--esp-4`…) e reusados em tudo.
  Analogia: a paleta fixa de um pintor — todo quadro sai coerente porque vem das
  mesmas tintas. No app, garantem que nada tenha valor "solto" e que mudar o tema
  seja trocar a peça, não repintar tudo.

- **Inspiração visual** — a **marca de referência** de onde saem as cores e o tom
  (aqui, o **Pipedrive**, verde). Diferente da **fundamentação** (o *porquê* do
  app): a inspiração é o *como se parece*. No app, foi declarada na tela e toda cor
  dela passou pela auditoria de contraste.

- **Contraste WCAG (AA/AAA)** — o quão "destacada" uma cor fica sobre a outra,
  medido de 1:1 a 21:1. **AA** é o mínimo aceitável; **AAA** é o ideal. Analogia:
  ler texto cinza-claro num fundo branco cansa a vista — pouco contraste. No app,
  o **rodapé calcula isso ao vivo** (`luminancia`, `razaoContraste`, `nivelWcag`)
  para nenhuma cor passar batido.

- **`data-testid`** — uma etiqueta invisível colada em botões e campos só para os
  testes acharem o elemento certo. Analogia: a plaquinha com o número na porta —
  muda a decoração da sala, o número continua. No app, deixa os testes de tela
  (Playwright) **não quebrarem quando o visual muda**.

- **Prévia ao vivo** — o cartão que recalcula **probabilidade e valor ponderado** a
  cada tecla, usando as mesmas funções puras dos testes. Analogia: a calculadora
  que já mostra o total enquanto você digita. No app, torna visível o efeito da
  etapa e do BANT antes mesmo de salvar.

- **Teste de espaçamento (nada colado)** — uma verificação automática de que
  botões e campos têm **folga > 0,5px** entre si (não se encostam nem se
  sobrepõem). Analogia: passar a mão pela estante para sentir se dois quadros estão
  grudados. No app, a função pura `validarEspacamento` mede a **distância entre as
  caixas** dos elementos (o retângulo que cada um ocupa na tela) e o E2E reprova se
  algo estiver colado — foi ela que pegou o botão "Adicionar ao funil" encostado na
  fileira BANT.

## Etapa 4 — Persistência

- **localStorage** — uma "gavetinha" que o navegador guarda **no próprio
  computador**, que sobrevive a fechar a aba. Analogia: um caderno que fica na sua
  mesa — você fecha, reabre e as anotações continuam lá. No app, é onde os negócios
  ficam salvos, sem servidor nem banco.

- **Serializar / desserializar** — como o localStorage só guarda **texto**,
  "serializar" é transformar a lista de negócios em texto (JSON) para guardar, e
  "desserializar" é fazer o caminho de volta. Analogia: desmontar um móvel para
  caber na caixa e remontar ao chegar. No app, são funções puras (`serializarNegocios`,
  `desserializarNegocios`) — a segunda **blinda contra dado corrompido** (JSON
  quebrado vira lista vazia, o app não trava).

- **Dado corrompido** — texto salvo que não é um JSON válido (ex.: cortado pela
  metade). Analogia: uma página rasgada do caderno. No app, em vez de quebrar, o
  leitor seguro **ignora e começa com lista vazia** — testado no cenário negativo.

## Etapa 5 — Lista organizada por etapa

- **Agrupar por etapa** — juntar os negócios que estão no mesmo degrau do funil,
  na ordem oficial (Lead → … → Fechado). Analogia: separar as contas em pastas por
  mês. No app, `agruparPorEtapa` monta os grupos e ainda entrega, de cada um, a
  **quantidade** e a **soma de valor**.

- **Ordenar por valor ponderado** — dentro de cada etapa, mostrar primeiro o
  negócio que "mais vale de verdade" (valor × probabilidade), não o de maior preço
  de fachada. Analogia: numa fila de possíveis vendas, atender antes quem tem mais
  chance real de fechar grande. Foi por isso que a "Óptica Visão" (R$ 6.000
  ponderados) apareceu acima da "Clínica Sorriso" (R$ 2.600), mesmo com valor bruto
  maior.

- **Soma de valor por grupo** — o total (bruto) de cada etapa, no cabeçalho do
  grupo. Analogia: o subtotal de cada categoria no extrato. No app, ajuda a
  enxergar onde está concentrado o dinheiro no funil.

## Etapa 6 — Ciclo de etapas

- **Avançar / Voltar um passo** — mover o negócio para a próxima etapa (ou a
  anterior), **sempre um degrau de cada vez**. Analogia: subir/descer a escada
  degrau a degrau, sem pular nem cair. No app, o Lead não "volta" (é o topo) e o
  Fechado não "avança" (é o fim) — **sem beco sem saída**.

- **Desfecho (Ganho / Perdido)** — como o negócio termina ao chegar em Fechado:
  virou venda (**Ganho**) ou não (**Perdido**). Analogia: o placar final do jogo.
  No app, fechar **exige** escolher o desfecho, **carimba a data** e passa a mandar
  no cálculo: Ganho = 100% (valor cheio), Perdido = 0% (valor zero).

- **Reabrir** — tirar um negócio de Fechado de volta para Negociação, **limpando**
  o desfecho e a data. Analogia: reabrir um chamado que tinha sido encerrado por
  engano. No app, garante que fechar não é irreversível.

- **Carimbo de data (passado de fora)** — a data de fechamento é gerada pela tela
  e **entregue** à função pura (`agora`), em vez de a função "olhar o relógio".
  Analogia: o caixa anota no recibo a hora que o sistema informou. No app, é o que
  mantém a regra **testável** (mesma entrada → mesma saída).

## Etapa 10 — Exportar / limpar dados (LGPD)

- **LGPD (o dado é do usuário)** — a ideia de que a pessoa é dona dos próprios
  dados e pode **levá-los** ou **apagá-los** quando quiser. Analogia: numa
  academia, você pode pedir sua ficha de volta ou pedir para apagarem seu
  cadastro. No app, os negócios ficam só neste navegador e há botões para exportar
  e para limpar tudo.

- **Exportar (.json)** — baixar um arquivo com todos os negócios. Analogia: tirar
  uma cópia xerox da sua pasta para levar. No app, a função pura `exportarJson`
  monta o conteúdo (com data e total) e a tela dispara o download.

- **Ação destrutiva com confirmação** — antes de apagar tudo, o app **pergunta**
  ("tem certeza?"). Analogia: a caixa de diálogo "deseja mesmo excluir?" antes de
  esvaziar a lixeira. No app, "Limpar tudo" só apaga se o usuário confirmar —
  cancelar mantém os dados intactos (ambos testados).

## Etapa 11 — Acessibilidade + E2E

- **Nome acessível** — o "rótulo" que um leitor de tela lê para cada campo/botão
  (vem do `<label>`, do texto do botão, etc.). Analogia: a etiqueta em braille na
  porta do elevador. No app, cada campo tem seu nome (Nome, Valor, Etapa) e o teste
  confere isso automaticamente.

- **Região nomeada (landmark)** — uma parte da página com um nome próprio, que o
  leitor de tela lista para "pular" direto até ela. Analogia: as placas de setor
  num estacionamento (A, B, C). No app, a lista é a região "Negócios por etapa do
  funil".

- **`aria-live`** — avisa a tecnologia assistiva quando um texto muda sozinho, sem
  recarregar a página. Analogia: um locutor anunciando a mudança no placar. No app,
  a mensagem e o contador de negócios usam `aria-live` para o usuário cego "ouvir"
  a atualização.

- **E2E de fluxo completo** — um teste que imita o usuário do começo ao fim (criar
  → avançar → fechar). Analogia: um cliente-oculto que percorre a loja inteira. No
  app, garante que as partes funcionam **juntas**, não só isoladas.

## Etapa 12 — Entregas finais

- **README** — o "manual de entrada" do projeto: o que é, como rodar, como testar,
  arquitetura e decisões. Analogia: a placa na porta explicando a casa a quem chega.
  No app, permite alguém rodar tudo do zero seguindo só ele.

- **Slides (deck)** — a apresentação da história do projeto, do Setup 0 ao app
  pronto. Analogia: o álbum de fotos da viagem, na ordem. No app, é um `slides.html`
  autossuficiente (navega por teclado/cliques), alimentado pelo PROMPTS.md e RESUMAO.md.
