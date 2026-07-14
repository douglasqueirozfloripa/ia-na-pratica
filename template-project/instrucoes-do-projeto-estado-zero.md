# Instruções do projeto para a IA — [TEMA DO PROJETO]

> **Modelo "estado zero" (genérico e reutilizável).** Este arquivo é o ponto de
> partida de QUALQUER projeto do experimento. Ele não descreve um app específico:
> descreve **como** as instruções serão montadas a partir de dois insumos que
> você fornece no Setup 0 — o **tema** e o **setup inicial**. A IA lê este arquivo
> e vai preenchendo cada seção (trocando os `[campos entre colchetes]`) conforme
> o tema escolhido.
>
> **Antes de tudo:** crie uma pasta no computador para o projeto e abra/informe
> essa pasta para a ferramenta de IA — é nela que este arquivo e todos os
> arquivos do app devem ser salvos.
>
> Onde salvar: GitHub Copilot → `.github/copilot-instructions.md` · Cursor →
> `.cursor/rules` · Claude → `CLAUDE.md`.

## Setup 0 — o que você informa (e o que a IA faz)

> **Norte para iniciantes:** comece simples — um app que roda direto no navegador
> com **HTML + CSS + JavaScript puros**, mantendo as **regras em funções puras**
> (`logica.js`) separadas da tela (`index.html`), guardando dados no
> **localStorage** e cobrindo tudo com **testes** (Jest + Playwright) — sem
> servidor, sem build e sem framework.

1. Você diz **o tema** do projeto (que app quer criar) e o **setup inicial**
   (stack desejada, se houver preferência).
2. A IA preenche este documento: **descreve o app**, **cita a base conceitual**,
   define **stack**, **regras de negócio** e as **regras automáticas** de resposta.
3. Ao final do Setup 0, a IA confirma que passará a seguir estas regras em TODAS
   as respostas e resume, em uma frase, o que entendeu do app.

## O que é o projeto

> Preencher a partir do tema. Deve responder: qual o nome do app, o que ele faz
> em uma frase, qual **problema** resolve, qual o **conceito central** (o método
> ou a ideia que organiza tudo) e qual o **resultado esperado** para quem usa.

- **Nome/pitch:** [nome do app] — [o que faz, em uma frase].
- **Conceito central:** [o método/ideia que estrutura o app].
- **Resultado esperado:** [o que a pessoa consegue fazer/enxergar ao usar].

## Fundamentação e referências (de onde vem a ideia)

> **Regra fixa:** todo app precisa desta seção. O **conceito central** (o método/
> ideia que estrutura o app) **não pode ser achismo**. Esta seção reúne **duas
> origens**:
>
> 1. **Links pesquisados pela IA** — ao receber o tema, a IA **pesquisa
>    referências reais na internet** para aquele domínio (métodos consagrados,
>    autores, obras), escolhe as mais sólidas e **cita a fonte com o link**.
> 2. **Referências que o usuário quer citar** — se a pessoa indicar um método/
>    autor/obra, incluir também (validando e linkando a fonte).
>
> Isso dá credibilidade ao produto e alinha o vocabulário do time. Nada de
> reaproveitar referências de um tema anterior.
>
> **⚠️ Não confundir com inspiração visual.** Aqui é a **base conceitual** (o
> "porquê" do app). A **inspiração de design — paleta, cores e estilo de tela
> baseados em uma marca/entidade/sistema de mercado de referência** — pertence à
> seção **Qualidade visual → Design tokens**, e **não** entra aqui. Preencher
> conforme o tema pesquisado:

- **[Nome do método/conceito]** — [origem: quem propôs, quando] e por que embasa
  o app.
- **[Autor/obra de referência]** — [contribuição] que o projeto adota.
- **[Convenção do projeto]** — nomes/rótulos que são escolha deste projeto (deixar
  claro o que é fonte externa e o que é convenção interna).

## Stack (tecnologia)

> Padrão recomendado do experimento (troque só se o tema exigir):

- **HTML + CSS + JavaScript puros**: `index.html` (telas/estilos) e `logica.js`
  (regras de negócio em **funções puras**) — abre em qualquer navegador, sem
  instalar nada.
- Dados no **localStorage** do navegador (sem servidor, sem banco).
- **Testes com frameworks de mercado**: **Jest** para as regras
  (`logica.test.js`, `npm test`) e **Playwright** para interface/E2E
  (`e2e/app.spec.js`, `npm run test:e2e`), localizando elementos por
  **`data-testid`**.
- **Pirâmide de testes** (Mike Cohn, *Succeeding with Agile*, 2009): a maior
  parte da cobertura fica na **base de testes unitários** (rápidos e baratos,
  sobre as funções puras da `logica.js`) e apenas o essencial no **topo de
  testes E2E** (mais lentos e caros, sobre os fluxos de tela). Priorizar sempre
  empurrar a lógica para funções puras testáveis por unitário, deixando o E2E
  para os caminhos críticos de ponta a ponta.
- **`data-testid` em todos os botões e campos de ação**, para os testes de
  interface não quebrarem quando o visual mudar.
- Cada tela/módulo referencia, em comentário, o arquivo de teste que a cobre.

## Regras de negócio (não quebrar)

> Padrão que se repete na maioria dos apps do experimento — adaptar os nomes ao
> domínio do tema:

- **Entidade principal** com **campos obrigatórios validados**; valores
  derivados são **calculados por função pura**, nunca digitados à mão.
- **Ciclo de status** que **avança na ordem e volta um passo** (nada é beco sem
  saída); transições de estado carimbam/limpam dados quando fizer sentido.
- **Lista organizada** (agrupada/ordenada por um critério de prioridade do tema),
  com indicadores por grupo.
- **Filtros/preferências do usuário são PERSISTIDOS** (localStorage) e seguem
  aplicados ao voltar ao app.
- **Painel/dashboard** com os números-chave do domínio (totais, contagens,
  progresso, destaque do que exige atenção agora).
- **Ações destrutivas só com confirmação.**
- O usuário pode **exportar/limpar** seus dados (o dado é dele — LGPD).

## Como responder aqui (regras automáticas de TODA resposta)

- **Roteiro previsto de prompts logo após o Setup 0**: montar, no `PROMPTS.md`,
  uma **previsão dos prompts** (Prompt 1 → N) adaptada ao tema, cada um com
  **objetivo pequeno**, **texto pronto para colar** e **o que entrega**. É um
  **guia, não um trilho**: a ordem pode mudar conforme as escolhas do usuário, e a
  regra "um objetivo por prompt, com testes junto" continua valendo. Serve para o
  público iniciante enxergar o caminho inteiro sem se perder. O **Prompt 1** do
  roteiro é sempre a **fundamentação (conceito central)**: a IA **pesquisa na
  internet** referências reais para o tema informado (que pode ser qualquer tipo
  de sistema) — somadas às que o usuário quiser citar —, escolhe as mais sólidas,
  documenta **com o link da fonte** e registra os termos no `GLOSSARIO.md` —
  **antes de escrever qualquer código**. (A **inspiração visual** — marca/sistema
  de referência para cores e estilo — é definida junto da primeira tela/design
  tokens, não aqui.)
- **Partes pequenas com testes junto** de cada funcionalidade.
- **Cenários positivos e negativos**, com `(positivo)` / `(negativo)` no nome do
  teste (o que deve funcionar E o que deve ser bloqueado/dar erro).
- **Clean code comentado** nos trechos importantes (o porquê das decisões).
- **Explicar → documentar → perguntar o próximo passo**: ao final de cada
  resposta, explique em linguagem simples, documente a mudança e ofereça 2–3
  opções de próximo passo, aguardando a escolha.
- **Acessibilidade com auditoria de contraste WCAG AA desde a primeira versão**:
  toda cor escolhida já medindo o contraste (mín. AA); **relatório de contraste
  ao vivo no rodapé** por funções puras (`luminancia`, `razaoContraste`,
  `nivelWcag`); teclado, textos alternativos e labels ligados aos campos.
- **Usabilidade sem becos sem saída**: sempre dá para avançar e voltar; ações
  destrutivas confirmam; preferências persistem.
- **Botão "Reiniciar experiência" no header**: zera o fluxo com confirmação.
- **LGPD com dados fictícios**: nunca dados reais de pessoas nem credenciais.
- **Registro de cada avanço**: atualizar `GLOSSARIO.md`, escrever `RESUMAO.md` da
  etapa e registrar o prompt executado (com resultado) no `PROMPTS.md`.

## Qualidade visual (design de TODA interface)

- **Inspiração visual (obrigatória): paleta e estilo baseados em uma marca/
  entidade/sistema de mercado de referência.** É **aqui** que mora a "inspiração"
  do projeto (diferente da fundamentação, que é o conceito). Ao definir o visual,
  a IA **pesquisa/propõe uma referência real** — uma marca, produto ou sistema
  conhecido (ex.: a identidade visual de um app popular do mesmo domínio) — e dela
  derivam as **cores e o tom** do tema. Sempre **declarar qual é a referência** e
  **respeitar o contraste WCAG AA** (a estética nunca fura a acessibilidade). Se o
  usuário indicar a marca/sistema de inspiração, usar a dele.
- **Design tokens**: escala **única** de espaçamento (4/8/12/16/24px), raio,
  tipografia, **cores** e sombras em variáveis CSS, reutilizada em tudo (nada de
  valores soltos) — **derivadas da inspiração visual acima**.
- **Layout com Flexbox/Grid, bem organizado e sem quebra**: componentes
  estruturados com `display: flex` (ou `grid`), alinhados e com espaçamento
  consistente — **principalmente no dashboard/painel principal** de cada sistema,
  que deve usar um grid/flex responsivo (ex.: `flex-wrap`/`auto-fit`) para os
  cartões **nunca estourarem nem se sobreporem** em nenhuma largura.
- **Respiro nas bordas (nada colado)**: botões, campos e inputs **nunca encostam
  na margem** do cartão/tela nem ficam grudados uns nos outros — sempre com o
  espaçamento da escala (padding interno do container e gaps consistentes entre
  controles; mín. `--esp-4`/16px na borda). Ao revisar o screenshot, procurar **de
  propósito** por algum botão/campo "raspando" a beirada ou espremido; se houver,
  aumentar o respiro **antes de encerrar**.
- **Espaçamento garantido por TESTE (não só pelo olho)**: a regra do "nada colado"
  é coberta por uma **função pura de layout** (ex.: `validarEspacamento`, que mede
  a **folga entre as caixas** dos elementos — `getBoundingClientRect` — e exige
  distância **maior que 0,5px**, ignorando pares pai/filho, que se contêm de
  propósito). Ela entra nos **testes de lógica da primeira tela** e roda no **E2E**
  sobre os elementos reais: **elemento colado ou sobreposto reprova o teste**. Essa
  checagem só faz sentido **depois de a inspiração visual estar aplicada** (é aí que
  os elementos ganham posição/tamanho reais), por isso nasce junto da primeira tela.
- **Componentes consistentes**: todos os botões com a mesma altura/padding/
  alinhamento (variam só na cor); um `<button>` e um `<label>` que age como botão
  ficam **pixel-a-pixel idênticos** (mesma classe base).
- **Controles nativos estilizados**: `input`, `date`, `select`, `file`,
  `checkbox` e `radio` com estilo próprio — nunca com a cara padrão do navegador
  destoando do tema.
- **Estados visíveis**: hover, foco, ativo e desabilitado em tudo que é clicável.
- **Responsivo de 360px ao desktop**; largura de leitura confortável.
- **Definição de pronto VISUAL**: ao final de cada tela, **gerar um screenshot** e
  revisar layout (flex/grid), consistência de componentes, alinhamento e
  espaçamento **antes de encerrar** — o "como se parece" com o mesmo rigor do
  "como se comporta".
- **Checagem de regressão em TODO prompt**: **qualquer prompt que altera código**
  (lógica, persistência, tela — inclusive os que **não** têm tela, como o de
  localStorage) **roda a suíte de testes (unitários + E2E) e confirma que nada
  quebrou**, reportando o **placar** ao encerrar. Se algum teste regrediu, reportar
  o que quebrou (com a saída), corrigir e só então encerrar — nunca dar um passo
  por "pronto" com teste vermelho.
- **Prompts de tela também levam print**: os prompts que implementam interface,
  **além** da checagem de regressão acima, **geram o screenshot** e revisam o
  visual. Print e placar andam juntos: a tela só está pronta se **o screenshot está
  bom E nenhum teste regrediu** — nunca entregar um print "bonito" escondendo teste
  vermelho.

## Entregas finais do projeto

- **`README.md`** — visão do app, como rodar, como testar, arquitetura e decisões
  (alguém roda o projeto do zero seguindo só ele).
- **Slides de apresentação** — a história da concepção, do Setup 0 ao app pronto,
  alimentados pelo `PROMPTS.md` e pelo `RESUMAO.md`.
