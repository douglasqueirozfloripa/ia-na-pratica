# Resumão do projeto — Funil de Venda

> O "memorial" do projeto: a cada etapa concluída, a IA escreve aqui o que foi
> construído, as decisões e os aprendizados. Junto com o `PROMPTS.md`, alimenta o
> README e os slides finais.

## Como registrar cada etapa (convenção)

```
## Etapa N — [título da etapa]

### O que foi feito
- [em linguagem simples, o que passou a existir/funcionar]

### Decisões e o porquê
| Decisão | Por quê |
|---|---|
| [o que se decidiu] | [a razão — o trade-off] |

### Testes
- [o que foi coberto e o placar, ex.: X unitários + Y E2E = Z passando]

### Próximo passo
- [a opção escolhida para seguir]
```

## Etapas

### Etapa 0 — Setup (Prompt 0)

### O que foi feito
- Definido o app **Funil**: gestor de oportunidades que mostra **em que etapa do
  funil** cada negócio está e ordena o foco por **valor ponderado** (valor ×
  probabilidade da etapa).
- Criados `CLAUDE.md` (instruções do tema, com fundamentação pesquisada e links —
  AIDA/Elias St. Elmo Lewis, BANT/IBM, pipeline ponderado), `PROMPTS.md` (roteiro
  Prompt 1 → 12), `GLOSSARIO.md` e `RESUMAO.md` (sementes).

### Decisões e o porquê
| Decisão | Por quê |
|---|---|
| Funil de vendas (AIDA) como motor | Metáfora consagrada (desde 1898); torna visível onde cada negócio está e o que exige atenção |
| Probabilidade e valor ponderado por função pura | Previsão de receita vira cálculo, não achismo — testável e à prova de erro de digitação |
| Qualificação por BANT | Framework clássico de qualificação (IBM); ajusta a probabilidade com critérios objetivos |
| Stack HTML/CSS/JS puro + localStorage | Roda no navegador sem instalar nada — didático para iniciantes |

### Testes
- Nenhum ainda — começam no Prompt 2 (núcleo da lógica).

### Próximo passo
- Executar o **Prompt 1**: fundamentação (AIDA/funil, BANT, pipeline ponderado) +
  registro dos termos no glossário, sem código ainda.

### Etapa 1 — Fundamentação (Prompt 1)

### O que foi feito
- Consolidada a base conceitual do app com **fontes reais e links**: Modelo AIDA
  (Elias St. Elmo Lewis, 1898; sigla por C. P. Russell, 1921; funil em Townsend,
  1924), qualificação **BANT** (IBM, anos 1950) e **valor ponderado/taxa de
  conversão** do pipeline (prática de CRM).
- `GLOSSARIO.md` preenchido com 10 termos em linguagem simples (funil de vendas,
  modelo AIDA, etapa, Lead, qualificação BANT, probabilidade de fechamento, taxa
  de conversão, valor ponderado, ganho/perdido, função pura) — cada um com
  analogia, o porquê no app e a fonte.
- **Nenhum código ainda** — como manda a regra de começar pelo conceito.

### Decisões e o porquê
| Decisão | Por quê |
|---|---|
| Etapas em português (Lead / Qualificação / Proposta / Negociação / Fechado) | Deixa o funil didático e imediato para o público iniciante |
| BANT como ajuste **da** probabilidade (não etapa à parte) | Mantém o funil simples: a etapa dá a base, a qualificação afina — sem sobrecarregar o usuário |
| Ordenar o foco por **valor ponderado** (valor × probabilidade) | Prioriza o que é realista fechar, não só o de maior valor de fachada |
| Documentar a fundamentação antes de qualquer código | O conceito central não pode ser achismo — dá credibilidade e alinha o vocabulário |

### Testes
- Nenhum ainda — começam no Prompt 2 (núcleo da lógica).

### Próximo passo
- **Prompt 2**: criar `logica.js` (funções puras `probabilidadeDaEtapa`,
  `pontuarQualificacao`, `valorPonderado`, `validarNegocio`) + `logica.test.js`
  no Jest, com casos positivos e negativos.

### Etapa 2 — Núcleo da lógica (Prompt 2)

### O que foi feito
- Criado `logica.js` com as regras do funil em **funções puras**:
  `probabilidadeDaEtapa`, `pontuarQualificacao` (BANT), `probabilidadeDeFechamento`
  (etapa + BANT), `valorPonderado` e `validarNegocio`.
- Definida a régua de chances: **Lead 10% → Qualificação 25% → Proposta 50% →
  Negociação 75% → Fechado 100%**, com **+5% por critério BANT** (teto de 100%).
- Criado `logica.test.js` (Jest) e `package.json` com `npm test`.

### Decisões e o porquê
| Decisão | Por quê |
|---|---|
| Probabilidade-base fixa por etapa + bônus BANT aditivo (5%/critério) | Fórmula simples, previsível e fácil de explicar/testar; a etapa manda, o BANT afina |
| `probabilidadeDaEtapa` e `valorPonderado` **lançam erro** em entrada inválida | Um dado errado aparece já no teste, em vez de virar cálculo silencioso incorreto |
| `validarNegocio` **não lança** — devolve `{ valido, erros }` | A tela precisa de mensagens para mostrar ao usuário, não de uma exceção |
| CommonJS (`module.exports`) | Jest (Node) e a futura tela reusam a MESMA lógica, sem build |

### Testes
- **16 unitários (Jest) passando** — cenários (positivo) e (negativo) de todas as
  funções (etapa desconhecida, BANT ausente, valor ≤ 0, negócio sem nome/etapa).

### Próximo passo
- **Prompt 3**: primeira tela (`index.html`) com formulário de novo negócio,
  design tokens derivados da inspiração visual e rodapé de contraste WCAG AA.

### Etapa 3 — Primeira tela (Prompt 3)

### O que foi feito
- Criado `index.html`: header com "Reiniciar experiência", **formulário de novo
  negócio** (nome, valor, etapa, qualificação BANT), **prévia ao vivo**
  (probabilidade + valor ponderado) e **rodapé de contraste WCAG ao vivo**.
- **Design tokens** em variáveis CSS derivados da inspiração visual declarada
  (**Jira**, azul); controles nativos estilizados; layout em grid responsivo
  sem quebra.
- Adicionadas ao `logica.js` as funções puras de contraste `luminancia`,
  `razaoContraste`, `nivelWcag`; export tornado seguro para navegador
  (`window.Logica`) e Node ao mesmo tempo.
- Screenshot em `screenshots/prompt3-primeira-tela.png`.

### Decisões e o porquê
| Decisão | Por quê |
|---|---|
| Inspiração visual = Jira (azul), declarada na tela | O visual precisa de uma referência real de mercado do domínio; o azul/limpo do Jira combina com gestão de trabalho em fluxo (boards/colunas) |
| Paleta medida ANTES de fixar os tokens (via as próprias funções de contraste) | Garante AA/AAA desde a 1ª versão — a estética não fura a acessibilidade |
| Rodapé lê os tokens REAIS (`getComputedStyle`) e mede ao vivo | Se alguém mudar uma cor, o nível WCAG atualiza sozinho — auditoria de verdade |
| `logica.js` serve navegador e Node com o mesmo arquivo | A tela usa a MESMA lógica testada — nada de regra duplicada |

### Testes
- **28 unitários (Jest)** + **7 E2E (Playwright)** = **35 passando**. E2E cobre:
  carga da tela, prévia ao vivo (50%/60%), sucesso, formulário vazio, valor zero,
  rodapé de contraste (4 selos AA/AAA) e o **espaçamento dos elementos** (folga
  > 0,5px, nada colado/sobreposto).
- **Quebra encontrada e corrigida**: o `<fieldset>` do BANT estava com `margin:0`,
  então o botão "Adicionar ao funil" ficava **colado (0px)** na fileira de
  checkboxes. O teste de espaçamento **reprovou**, o `margin-bottom` foi restaurado
  (`--esp-4`/16px) e o teste passou a verde.

### Aprendizado
- Medir o contraste com a própria função pura, antes de escrever o CSS, evita
  "descobrir" reprovação depois — a paleta já nasce aprovada.
- Transformar "olhômetro" em **teste** (folga > 0,5px entre as caixas) pega quebra
  de layout que passa batido na revisão visual — e a mesma função pura roda no Jest
  (caixas de mentira) e no navegador (caixas reais).

### Próximo passo
- **Prompt 4**: persistir os negócios no `localStorage` (salvar e recarregar ao
  abrir), com testes (positivo: persiste após refresh; negativo: dado corrompido
  não quebra o app).

### Etapa 4 — Persistência no localStorage (Prompt 4)

### O que foi feito
- Negócios agora **salvam no `localStorage`** ao adicionar e **recarregam** ao
  abrir o app. Um **contador** ("N negócios no funil") deixa a persistência visível.
- Funções puras de (de)serialização segura no `logica.js`: `serializarNegocios` e
  `desserializarNegocios` (JSON corrompido/nulo/não-lista vira lista vazia).
- Efeito colateral (acesso ao `localStorage`) isolado na tela; a lógica testável
  ficou pura.

### Decisões e o porquê
| Decisão | Por quê |
|---|---|
| (De)serialização como função pura; localStorage só na tela | Mantém a lógica testável no Jest sem depender do navegador |
| Leitura "blindada" (dado ruim → lista vazia) | Um `localStorage` corrompido não pode derrubar o app |
| Contador visível de negócios salvos | Torna a persistência observável (e testável no E2E) já sem a lista (Prompt 5) |
| `id` via `crypto.randomUUID` (fallback simples) | Identificador estável por negócio, sem depender de biblioteca |

### Testes
- **33 unitários (Jest)** + **9 E2E (Playwright)** = **42 passando**. Novos:
  round-trip da lista, leitura segura de nulo/vazio/JSON corrompido; E2E de
  persistência após refresh e de dado corrompido que não quebra o app.
- **Regressão pega pela regra nova**: ao trocar o texto de sucesso ("salvo no
  funil"), um E2E antigo quebrou — corrigido antes de encerrar (nada de teste
  vermelho passando batido).

### Próximo passo
- **Prompt 5**: lista organizada por etapa do funil (Lead → … → Fechado), ordenada
  por valor ponderado, com contador e soma de valor por grupo.

### Etapa 5 — Lista organizada por etapa (Prompt 5)

### O que foi feito
- Nova seção **"Negócios por etapa do funil"**: grupos na ordem Lead → Qualificação
  → Proposta → Negociação → Fechado, cada um com **contador · soma de valor** no
  cabeçalho, e itens **ordenados por valor ponderado** (mostra nome, valor,
  probabilidade e valor ponderado).
- Funções puras `ordenarPorValorPonderado` e `agruparPorEtapa` no `logica.js`.
- Nome do negócio **escapado** antes de ir para a tela (evita HTML/script injetado).
- Screenshot em `screenshots/prompt5-lista-por-etapa.png`.

### Decisões e o porquê
| Decisão | Por quê |
|---|---|
| Ordenar por valor ponderado (não valor bruto) | Foca no que é realista fechar grande — "Óptica Visão" veio antes da "Clínica Sorriso" mesmo custando menos |
| Mostrar as 5 etapas sempre (mesmo vazias) | O funil inteiro fica visível; etapa vazia comunica "nada aqui ainda" |
| Escapar o nome do usuário (`esc`) | Texto digitado não pode virar HTML/script na tela |
| Lista como função pura + render separado | A regra de agrupar/ordenar é testável no Jest sem tela |

### Testes
- **37 unitários (Jest)** + **10 E2E (Playwright)** = **47 passando**. Novos:
  ordenação por ponderado (e imutabilidade da lista), agrupamento com quantidade/
  soma, lista vazia gera 5 etapas zeradas; E2E do agrupamento na tela.

### Próximo passo
- **Prompt 6**: ciclo de etapas (avançar/voltar um passo) com botões em cada
  negócio; fechar pede desfecho (Ganho/Perdido) e carimba a data.

### Etapa 6 — Ciclo de etapas (Prompt 6)

### O que foi feito
- Cada negócio ganhou botões de **avançar / voltar um passo**. Lead não volta,
  Fechado não avança (**sem beco sem saída**).
- Na **Negociação**, fechar pede o **desfecho**: "Fechar: Ganho" ou "Fechar:
  Perdido" — carimba a **data**; **Reabrir** volta para Negociação e limpa o
  fechamento.
- O **desfecho manda no cálculo**: Ganho = 100% (valor cheio), Perdido = 0%
  (R$ 0,00) — via `probabilidadeDoNegocio`/`valorPonderadoDoNegocio`, que a lista
  e a ordenação agora usam.
- Funções puras: `proximaEtapa`, `etapaAnterior`, `avancarNegocio`, `voltarNegocio`.
- Screenshot em `screenshots/prompt6-ciclo-etapas.png`.

### Decisões e o porquê
| Decisão | Por quê |
|---|---|
| Data de fechamento passada de fora (`agora`) | Mantém a transição pura e testável (a função não "olha o relógio") |
| Transições devolvem cópia (não mutam) | Evita efeito colateral escondido; previsível e testável |
| Desfecho obrigatório ao fechar (lança se faltar) | Um "Fechado" sem Ganho/Perdido não faz sentido no funil |
| Ganho=100% / Perdido=0% no cálculo | O valor ponderado do funil reflete a realidade do que fechou |

### Testes
- **46 unitários (Jest)** + **13 E2E (Playwright)** = **59 passando**. Novos:
  próxima/anterior nas bordas, avançar sem/para fechado, exigência de desfecho,
  reabrir limpando, imutabilidade; E2E de avançar, fechar como Ganho + reabrir, e
  "sem beco sem saída" (Lead sem Voltar, Fechado sem Avançar).

### Próximo passo
- **Prompt 7**: painel "Visão do funil" (dashboard) com total de negócios, valor
  total, valor ponderado previsto, taxa de conversão e o destaque de atenção.

> **Decisão do usuário:** pular para o **Prompt 10** (exportar/limpar — LGPD),
> tratando **7 (dashboard), 8 (filtros) e 9 (reiniciar/confirmar)** como **features
> futuras**.

### Etapa 10 — Exportar / limpar dados (LGPD) (Prompt 10)

### O que foi feito
- Barra de ações no cartão da lista: **Exportar (.json)** (baixa todos os negócios
  em arquivo) e **Limpar tudo** (apaga, **só com confirmação**), com nota de LGPD.
- Funções puras `montarExportacao` e `exportarJson` (conteúdo do arquivo, com data
  e total); o download em si (Blob/link) fica na tela.
- Screenshot em `screenshots/prompt10-exportar-limpar.png`.

### Decisões e o porquê
| Decisão | Por quê |
|---|---|
| Conteúdo da exportação como função pura | Dá para testar o arquivo gerado sem depender do download do navegador |
| "Limpar tudo" só com confirmação | Ação destrutiva — regra do projeto (LGPD/usabilidade) |
| Exportar em JSON com metadados (app, data, total) | Arquivo legível e reimportável no futuro |

### Testes
- **49 unitários (Jest)** + **16 E2E (Playwright)** = **65 passando**. Novos:
  montar/exportar JSON (incl. lista vazia); E2E de download do arquivo, limpar
  confirmando (apaga) e cancelando (mantém).

### Próximo passo (features futuras, quando o usuário quiser)
- **Prompt 7** dashboard, **Prompt 8** filtros persistidos, **Prompt 9**
  reiniciar/excluir com confirmação, **Prompt 12** README + slides.

### Etapa 11 — Acessibilidade + E2E (Prompt 11)

### O que foi feito
- **Consolidação da acessibilidade** (que já vinha desde o Prompt 3): confirmado
  por teste que campos têm **nome acessível**, botões têm texto e a lista é uma
  **região nomeada**; contador ganhou `aria-live` (anúncio a leitores de tela).
- **E2E do fluxo completo** ponta a ponta: criar pelo formulário → avançar
  Lead→Qualificação→Proposta→Negociação → fechar como Ganho (100%).
- **E2E de teclado**: criar um negócio usando só o teclado (Tab + Enter).

### Decisões e o porquê
| Decisão | Por quê |
|---|---|
| Tratar a 11 como consolidação, não do zero | WCAG AA (contraste), labels e E2E já eram regra automática desde o início |
| E2E de fluxo completo além dos unitários de transição | Prova que as partes funcionam juntas, não só isoladas |
| Nomes acessíveis verificados por teste (`toHaveAccessibleName`) | Acessibilidade deixa de depender de inspeção manual |

### Testes
- **49 unitários (Jest)** + **19 E2E (Playwright)** = **68 passando**. Novos E2E:
  fluxo completo, criação por teclado e auditoria de nomes acessíveis/região.

### Próximo passo
- **Prompt 12** (entregas finais: README + slides) — ou retomar as features
  futuras (7 dashboard, 8 filtros, 9 reiniciar/confirmar).

### Etapa 12 — Entregas finais (Prompt 12)

### O que foi feito
- **`README.md`**: visão, conceito + fundamentação (com fontes), como rodar, como
  testar, arquitetura (funções puras × efeitos na tela), decisões e estado do roteiro.
- **`slides.html`**: deck autossuficiente (12 slides) contando a história do Setup
  0 ao app pronto — abre apresentando Tema + Inspiração, segue "O problema → O
  conceito" e traz um slide dedicado à inspiração; navega por ← → / cliques /
  pontos, na identidade azul (Jira).
- Screenshots dos slides em `screenshots/prompt12-slides-*.png`.

### Decisões e o porquê
| Decisão | Por quê |
|---|---|
| Slides como `slides.html` local (não ferramenta externa) | Coerente com a stack (roda no navegador, sem dependência) |
| README com "como rodar" e "como testar" separados | Quem só quer usar não precisa de Node; quem testa tem o passo a passo |
| Alimentar README/slides do PROMPTS.md e RESUMAO.md | A história já estava registrada — as entregas só a consolidam |

### Testes
- Sem novos testes (entrega de documentação); suíte reexecutada por regra de
  regressão: **49 unitários + 19 E2E = 68 passando**.

### Próximo passo
- Projeto essencial **fechado**. Features futuras, quando quiser: **7** dashboard,
  **8** filtros persistidos, **9** reiniciar/excluir com confirmação.
