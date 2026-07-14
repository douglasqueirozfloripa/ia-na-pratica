# Glossário do projeto — Organizador de Tarefas e Prioridades

> Este arquivo começa vazio e cresce **ao longo da experiência**: a cada avanço,
> a IA acrescenta os termos novos em **linguagem simples**, com analogia do dia a
> dia e o **porquê** de existir no projeto. Os primeiros termos (Matriz de
> Eisenhower, urgente × importante, quadrantes, GTD, MoSCoW) entram no **Prompt 1**.

## Como registrar cada termo (convenção)

- Agrupe os termos **por etapa** (ex.: "## Etapa 1 — Fundamentação").
- Cada termo em uma linha: **negrito** + explicação curta e concreta, de
  preferência com uma **analogia do dia a dia**.
- Explique o **porquê** de existir no projeto, não só o significado.
- Se um termo se conecta a outro, cite-o.

## Etapa 1 — Fundamentação

- **Priorizar** — decidir **a ordem** em que as coisas serão feitas, não só listá-las.
  Analogia: numa fila de e-mails, é escolher qual abrir primeiro em vez de olhar
  todos de uma vez. No app, é o coração do **Prioriza**: transformar uma lista de
  tarefas numa ordem de "faça esta agora".

- **Urgente × Importante** — as duas perguntas que separam o que corre do que
  vale. **Urgente** = "tem prazo/pressão agora" (o telefone tocando).
  **Importante** = "traz resultado de verdade" (estudar para a prova de amanhã).
  A frase que originou tudo: *"o que é urgente raramente é importante, e o que é
  importante raramente é urgente"*. No app, o usuário responde essas duas coisas e
  o resto é calculado. Fonte:
  [Quote Investigator](https://quoteinvestigator.com/2014/05/09/urgent/).

- **Matriz de Eisenhower** — uma grade de **quatro quadrantes** que cruza urgente ×
  importante. Popularizada por **Dwight D. Eisenhower** (discurso de 1954) e
  transformada nos quatro quadrantes por **Stephen Covey** (*The 7 Habits of
  Highly Effective People*, 1989). Analogia: quatro gavetas onde cada tarefa cai
  numa só. É o **motor de priorização** do app. Fonte:
  [Asana — Eisenhower Matrix](https://asana.com/resources/eisenhower-matrix).

- **Os quatro quadrantes** — o que fazer com cada gaveta (nomes deste projeto,
  em português):
  - **Faça agora** — urgente **e** importante: faça primeiro.
  - **Agende** — importante mas **não** urgente: marque um horário (é aqui que mora
    o crescimento).
  - **Delegue** — urgente mas **não** importante: peça ajuda / passe adiante.
  - **Elimine** — nem urgente nem importante: só faz barulho; corte.

- **GTD (Getting Things Done)** — método de **David Allen** (*Getting Things Done:
  The Art of Stress-Free Productivity*, 2001; revisado em 2015): **tirar tudo da
  cabeça** e registrar num lugar confiável, quebrando em ações concretas.
  Analogia: esvaziar os bolsos numa bandeja para parar de tatear procurando as
  chaves. No app, embasa a etapa de **capturar** a tarefa antes de priorizá-la.
  Fonte: [gettingthingsdone.com](https://gettingthingsdone.com/) ·
  [Wikipedia](https://en.wikipedia.org/wiki/Getting_Things_Done).

- **MoSCoW** — método de **Dai Clegg** (Oracle, 1994), consolidado no **DSDM**:
  classificar em **Must / Should / Could / Won't** (deve / deveria / poderia /
  não agora). Os "o" minúsculos são só para formar o nome. Analogia: numa mala com
  pouco espaço, o que **tem** que ir, o que seria bom, o que cabe se sobrar e o que
  fica em casa. No app, é o rótulo **opcional de essencialidade** que complementa
  urgência × importância. Fonte:
  [Wikipedia — MoSCoW method](https://en.wikipedia.org/wiki/MoSCoW_method).

- **Função pura** — um pedaço de código que, para a mesma entrada, dá sempre a
  mesma saída e não mexe em nada por fora. Analogia: uma calculadora — 2+2 sempre
  dá 4. No app, a **prioridade e o quadrante são calculados por função pura**
  (nunca digitados), o que os torna fáceis de testar e à prova de erro humano.
  Aparece de verdade no **Prompt 2**.

## Etapa 2 — Núcleo da lógica

- **Limiar (LIMIAR_ALTO = 3)** — a "linha de corte" que decide se uma nota é
  *alta* ou *baixa*. Analogia: a marca no batente da porta que diz "acima daqui é
  alto". No app, nota de urgência ou importância **≥ 3** conta como alta — é o que
  transforma a escala de 1 a 5 nos dois lados (sim/não) da Matriz de Eisenhower.

- **Nota de prioridade** — um número que resume urgência e importância numa só
  medida para **ordenar a fila** (`importancia × 2 + urgencia`, de 3 a 15). A
  importância pesa o dobro de propósito: o que é importante sobe mesmo sem prazo
  apertado. Analogia: a nota final que ordena os aprovados num vestibular.

- **Validação** — a conferência dos campos **antes de salvar**. Em vez de
  "explodir", `validarTarefa` devolve uma lista de erros (ex.: `titulo-obrigatorio`)
  para a tela mostrar um aviso claro. Analogia: o caixa do banco conferindo se o
  formulário está preenchido antes de aceitar.

## Etapa 3 — Primeira tela

- **Design tokens** — as "peças de Lego" do visual: espaçamento, cantos, fontes e
  **cores** guardados uma única vez em variáveis CSS e reusados em tudo. Analogia:
  a cartela de cores e medidas que uma marca segue em todas as peças. No app,
  garantem que nada fica "solto" e que mudar uma cor muda o site inteiro de forma
  consistente.

- **Inspiração visual** — a marca/sistema real de onde tiramos paleta e estilo,
  **escolhida pelo usuário**. É **diferente da fundamentação** (que é o *porquê*/
  método). Aqui a referência é o **Jenkins**: usamos a paleta oficial dele (Worn
  Navy, Medium Carmine, Bismark…) e um laço-gravata no logo. Analogia: decorar a
  sala "no estilo" de um lugar que você admira, respeitando as medidas do cômodo.

- **Contraste / WCAG AA** — o quão distinguível é um texto do seu fundo, medido
  numa razão de 1:1 (invisível) a 21:1 (preto no branco). **AA** é o mínimo
  aceitável (4.5:1 para texto normal). Analogia: ler cinza-claro no branco versus
  preto no branco. No app, um **relatório ao vivo no rodapé** mostra o nível de
  cada par de cores — a acessibilidade fica visível o tempo todo.

- **`data-testid`** — uma etiqueta invisível colada em botões e campos só para os
  testes encontrarem o elemento. Analogia: a plaquinha com o nome numa peça de
  museu. No app, deixa os testes de interface não quebrarem quando o visual muda.

## Etapa 4 — Persistência

- **localStorage** — uma "gaveta" que o navegador guarda no próprio computador do
  usuário, que continua lá mesmo fechando a aba. Analogia: um caderninho na sua
  mesa — ninguém mais vê, e está lá quando você volta. No app, é onde as tarefas
  ficam salvas (sem servidor, sem nuvem).

- **Serializar / desserializar** — "traduzir" a lista de tarefas para texto ao
  salvar e de volta para lista ao abrir (o localStorage só guarda texto).
  Analogia: desmontar um móvel para caber na caixa e remontar ao chegar. No app,
  `serializarTarefas` guarda e `lerTarefasDe` recupera.

- **Dado corrompido (fronteira de segurança)** — se o texto salvo estiver
  quebrado ou adulterado, `lerTarefasDe` **nunca deixa o app cair**: devolve uma
  lista vazia e descarta itens estranhos. Analogia: o porteiro que barra quem
  está sem crachá em vez de deixar o prédio virar bagunça.

- **Repositório** — o pedaço de código que fala com a gaveta (localStorage) e
  carimba `id` e data de criação. Fica separado das funções puras porque mexe com
  o "mundo externo" (relógio, armazenamento). Analogia: o arquivista que guarda e
  busca as pastas — a regra de negócio não precisa saber onde fica o arquivo.

## Etapa 5 — Lista organizada

- **Agrupar por quadrante** — juntar as tarefas nas quatro "gavetas" de Eisenhower
  (Faça agora, Agende, Delegue, Elimine), sempre nessa ordem. Analogia: separar a
  roupa lavada em pilhas antes de guardar. No app, é o que dá a visão de "o que
  atacar primeiro" em vez de uma lista solta.

- **Ordenar por prioridade** — dentro de cada gaveta, a tarefa de maior nota
  aparece no topo. Analogia: a fila do banco com senha preferencial primeiro. No
  app, a nota é **recalculada na hora** (não confia no valor salvo), então a ordem
  está sempre correta mesmo se o dado tiver sido mexido.

- **Contador por grupo** — o numerozinho ao lado de cada quadrante dizendo quantas
  tarefas há ali. Analogia: o balãozinho de notificações no ícone do app. Ajuda a
  ver de relance onde está o acúmulo (ex.: muita coisa em "Faça agora").

- **Cross-check de contraste** — conferir nosso cálculo de contraste contra uma
  segunda fonte independente (uma implementação escrita do zero e/ou o Adobe Color
  Contrast Analyzer, que usa a mesma fórmula WCAG 2.1). Analogia: somar a conta
  duas vezes, por caminhos diferentes, para ter certeza. No app, os valores
  esperados ficam **fixos num teste** (`logica.test.js`), então uma troca de cor
  que mude o contraste é pega na hora.

## Etapa 6 — Ciclo de status

- **Status da tarefa** — em que ponto ela está: **A fazer → Fazendo → Concluída**.
  Analogia: as raias de um quadro Kanban (a fazer / fazendo / feito). No app, dá
  para **avançar** e **voltar um passo**, e as pontas travam — nunca vira um beco
  sem saída (de "concluída" ainda dá para reabrir).

- **Carimbo de conclusão** — a data/hora gravada quando a tarefa é concluída, e
  **apagada** se ela for reaberta. Analogia: o carimbo de "PAGO" no boleto, que
  some se o pagamento é estornado. No app, quem grava a data é a função pura
  `definirStatus`, recebendo o "agora" de fora (para continuar testável).

- **Reabrir** — tirar uma tarefa de "concluída" de volta para "fazendo". Analogia:
  reabrir um chamado que tinha sido fechado. Garante que nada fica preso: concluir
  não é irreversível.

## Etapa 7 — Painel "Foco do dia"

- **Painel / dashboard** — o resumo no topo com os números-chave (total, quantas
  em Faça agora, concluídas hoje, e "comece por"). Analogia: o painel do carro,
  que mostra de relance velocidade e combustível sem você abrir o motor. No app,
  responde "onde estou e o que ataco agora?" antes de olhar a lista inteira.

- **Pendente** — tarefa que ainda **não** foi concluída (a-fazer ou fazendo). O
  painel conta só pendentes em "Faça agora", porque o que já está feito não pede
  ação. Analogia: a pilha de contas "a pagar" — as já pagas saem da conta.

- **Grid responsivo (auto-fit)** — arranjo em que os cartões se reorganizam
  sozinhos conforme a largura: lado a lado no desktop, empilhados no celular, sem
  nunca "estourar". Analogia: prateleira que ajusta o número de colunas ao tamanho
  do armário. No app, é o que faz o painel não quebrar de 360px ao desktop.

## Etapa 8 — Filtros e preferências

- **Filtro** — mostrar só as tarefas que batem com um critério (quadrante e/ou
  status), sem apagar as outras. Analogia: as abas "Todos / Não lidos" do e-mail.
  No app, ajuda a focar (ex.: só o que está "fazendo").

- **Preferência persistida** — a escolha de filtro/ordenação fica **salva** e volta
  aplicada quando você reabre o app. Analogia: o volume do rádio do carro, que
  continua onde você deixou. No app, mora numa gaveta separada do localStorage
  (`prioriza:prefs`) e, se corromper, volta ao padrão sem travar nada.

- **Ordenação** — a ordem em que as tarefas aparecem: por prioridade (padrão),
  mais recentes ou mais antigas. Analogia: ordenar a caixa de entrada por data ou
  por remetente. No app, é uma preferência que também fica salva.

## Etapa 9 — Ações destrutivas

- **Ação destrutiva** — qualquer ação que apaga dados e não dá para desfazer
  (excluir tarefa, reiniciar tudo). Analogia: rasgar um papel — melhor perguntar
  antes. No app, elas **sempre pedem confirmação**.

- **Confirmação** — a caixinha "tem certeza?" antes de apagar. Cancelar mantém
  tudo; confirmar executa. Analogia: o "deseja mesmo sair sem salvar?". No app,
  protege contra o clique sem querer.

- **Reiniciar experiência** — botão do topo que zera o app (apaga todas as tarefas
  e volta os filtros ao padrão), com confirmação. Analogia: o "restaurar padrões
  de fábrica". Útil para recomeçar do zero numa demonstração.

## Etapa 10 — Exportar / limpar dados (LGPD)

- **LGPD** — a lei brasileira de proteção de dados: em resumo, o dado é da pessoa.
  Analogia: é o seu armário — você decide o que guardar, levar ou jogar fora. No
  app, isso vira: os dados ficam só no seu navegador, dá para **exportar** e
  **apagar** quando quiser, e os exemplos usam **dados fictícios**.

- **Exportar** — baixar um arquivo (`.json`) com todas as suas tarefas, para levar/
  fazer backup. Analogia: tirar uma cópia dos documentos antes de mudar de casa.
  No app, o arquivo é montado por função pura e baixado sem passar por servidor.

- **Dados fictícios** — exemplos inventados (nada de nome/e-mail reais). Analogia:
  o "João da Silva" dos formulários de treino. No app, protege a privacidade em
  demonstrações e telas de exemplo.

## Etapa 11 — Acessibilidade + E2E

- **Teste E2E (ponta a ponta)** — um robô que usa o app como um usuário de verdade
  no navegador: digita, clica, confere o que aparece. Analogia: um cliente-oculto
  testando a loja inteira. No app, o Playwright cobre criar → priorizar → concluir.

- **`aria-label`** — um nome "falado" que damos a um botão para o leitor de tela,
  quando o texto visível se repete. Analogia: crachás com nome completo quando há
  vários "Voltar" iguais. No app, cada Voltar/Avançar/Excluir diz de qual tarefa é.

- **Foco visível** — o contorno que mostra onde você está ao navegar por **Tab**
  (sem mouse). Analogia: o holofote que segue quem está no palco. No app, todo
  campo e botão tem um contorno claro ao receber foco (acessibilidade de teclado).
