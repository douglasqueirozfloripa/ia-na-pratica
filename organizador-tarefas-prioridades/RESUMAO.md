# Resumão do projeto — Organizador de Tarefas e Prioridades

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
- Definido o app **Prioriza**: organizador que ordena o que fazer agora por
  **urgência × importância** (Matriz de Eisenhower).
- Criados `CLAUDE.md` (instruções do tema, com fundamentação pesquisada e links),
  `PROMPTS.md` (roteiro Prompt 1 → 12), `GLOSSARIO.md` e `RESUMAO.md` (sementes).

### Decisões e o porquê
| Decisão | Por quê |
|---|---|
| Matriz de Eisenhower como motor de priorização | Método consagrado e simples de entender; prioridade vira cálculo, não achismo |
| Prioridade calculada por função pura | Testável e à prova de erro de digitação |
| Stack HTML/CSS/JS puro + localStorage | Roda no navegador sem instalar nada — didático para iniciantes |
| Inspiração visual será PERGUNTADA no Prompt 3 | A escolha da marca é do usuário, não da IA (correção da 1ª tentativa) |

### Testes
- Nenhum ainda — começam no Prompt 2 (núcleo da lógica).

### Próximo passo
- Executar o **Prompt 1**: fundamentação + registro dos termos no glossário.

### Etapa 1 — Fundamentação (Prompt 1)

### O que foi feito
- Consolidada a base conceitual do app com **fontes reais e links**: Matriz de
  Eisenhower (Eisenhower/Covey), GTD (David Allen) e MoSCoW (Dai Clegg).
- `GLOSSARIO.md` preenchido com 7 termos em linguagem simples (priorizar,
  urgente × importante, Matriz de Eisenhower, os quatro quadrantes, GTD, MoSCoW,
  função pura) — cada um com analogia, o porquê no app e a fonte.
- **Nenhum código ainda** — como manda a regra de começar pelo conceito.

### Decisões e o porquê
| Decisão | Por quê |
|---|---|
| Nomear os quadrantes em português (Faça agora / Agende / Delegue / Elimine) | Deixa o app didático e imediato para o público iniciante |
| MoSCoW como rótulo **opcional** | Evita sobrecarregar o usuário; urgência × importância continua sendo o motor |
| Documentar a fundamentação antes de qualquer código | O conceito central não pode ser achismo — dá credibilidade e alinha o vocabulário |

### Testes
- Nenhum ainda — começam no Prompt 2 (núcleo da lógica).

### Próximo passo
- **Prompt 2**: criar `logica.js` (funções puras de priorização) + `logica.test.js`
  no Jest, com casos positivos e negativos.

### Etapa 2 — Núcleo da lógica (Prompt 2)

### O que foi feito
- `logica.js` com as regras de priorização em **funções puras**:
  `validarTarefa`, `classificarQuadrante`, `pontuarPrioridade`, `decorarTarefa` e
  o auxiliar `ehNotaValida`.
- `logica.test.js` (Jest) e `package.json` com `npm test`.
- **Placar: 17 testes passando** (positivos + negativos).

### Decisões e o porquê
| Decisão | Por quê |
|---|---|
| Escala 1–5 com limiar em 3 | Dá granularidade para ordenar, mas ainda cai no 2x2 da Matriz de Eisenhower |
| Importância pesa o dobro na nota de prioridade | Fiel a Eisenhower: o importante deve subir mesmo sem urgência |
| `validarTarefa` devolve lista de erros em vez de lançar exceção | O mesmo código serve para teste e para a tela mostrar aviso amigável |
| Mesmo arquivo roda no Jest e no navegador (`module.exports`/`window.Logica`) | Sem build, sem framework — fiel à stack do experimento |

### Testes
- 17 unitários (Jest) passando: validação (título vazio, notas fora de 1..5,
  não-inteiro, undefined), os 4 quadrantes, cálculo da prioridade e pureza.

### Próximo passo
- **Prompt 3**: primeira tela (`index.html`). Começa **perguntando a marca de
  inspiração visual**; depois design tokens + rodapé de contraste WCAG AA.

### Etapa 3 — Primeira tela (Prompt 3)

### O que foi feito
- A IA **perguntou a marca de inspiração** (correção da 1ª tentativa). Escolha do
  usuário: **Jenkins**.
- `index.html`: header com o **laço-gravata carmim** do mordomo, cartão do
  formulário (título, urgência, importância — todos com `data-testid`), prévia com
  o **quadrante e a prioridade calculados**, e rodapé com **contraste ao vivo**.
- `app.js`: liga a tela às funções puras (sem regra de negócio na tela).
- `logica.js` ganhou as funções puras de acessibilidade: `luminancia`,
  `razaoContraste`, `nivelWcag`, `hexParaRgb`.
- Screenshots revisados: `prioriza-prompt3.png` (desktop) e
  `prioriza-prompt3-mobile.png` (360px) — layout flex/grid, sem quebra.

### Decisões e o porquê
| Decisão | Por quê |
|---|---|
| Inspiração visual perguntada, não presumida | A escolha da marca é do usuário (correção registrada na memória) |
| Paleta oficial do Jenkins mantida (inclusive o carmim `#D33834`) | Auditoria mostrou que o carmim passa AA (4.79:1) — não precisou adulterar a marca |
| Fundo cinza-azulado `#f4f6f7` + superfícies brancas | Ecoa o "sky blue" do Jenkins mantendo AAA no texto |
| Teste "guarda" reprova token abaixo de AA | Impede regressão de acessibilidade sem depender de olho humano |

### Testes
- 31 unitários (Jest) passando: priorização + contraste WCAG + guarda dos tokens
  da paleta Jenkins. Validação visual via screenshots (desktop e mobile).

### Próximo passo
- **Prompt 4**: persistir as tarefas no `localStorage` (salvar e recarregar),
  com testes positivo (persiste após refresh) e negativo (dado corrompido não
  quebra o app).

### Etapa 4 — Persistência (Prompt 4)

### O que foi feito
- Funções puras de persistência em `logica.js`: `adicionarTarefa`,
  `serializarTarefas` e `lerTarefasDe` (fronteira de segurança: dado corrompido
  vira `[]`, nunca derruba o app).
- Novo `repositorio.js`: fala com o `localStorage` e carimba `id`/data de criação
  (o "mundo externo", separado das funções puras).
- `index.html` + `app.js`: contador "Tarefas salvas: N", salvar ao adicionar e
  recarregar ao abrir.
- Verificado no navegador: 2 tarefas persistem após o reload; storage corrompido
  → contador 0 e zero erros no console. Screenshot: `prioriza-prompt4.png`.

### Decisões e o porquê
| Decisão | Por quê |
|---|---|
| Separar lógica pura (serializar/ler) do repositório (localStorage) | A regra fica testável no Jest; o acesso ao storage/relógio fica isolado |
| `lerTarefasDe` nunca lança e filtra itens inválidos | Um localStorage adulterado não pode quebrar a experiência do usuário |
| `id` e data no repositório, não nas funções puras | Aleatoriedade e relógio são "mundo externo" — fora da pureza |
| Mostrar só um contador (não a lista) | Mantém "um objetivo por prompt": a lista organizada é o Prompt 5 |

### Testes
- 37 unitários (Jest): priorização + contraste + guarda de tokens + persistência
  (round-trip, corrompido, vazio, itens adulterados). Persistência real validada
  no navegador (reload).

### Próximo passo
- **Prompt 5**: lista organizada por quadrante de Eisenhower (Faça agora → Agende
  → Delegue → Elimine), ordenada por prioridade, com contador por grupo.

### Etapa 5 — Lista organizada (Prompt 5)

### O que foi feito
- Funções puras `ordenarPorPrioridade` e `agruparPorQuadrante` no `logica.js`
  (devolvem sempre os 4 grupos na ordem fixa, cada um ordenado por prioridade).
- Seção "Minhas tarefas" no `index.html` + render no `app.js`: cada grupo com
  cor do quadrante, contador e cartões de tarefa (título, urgência × importância,
  nota de prioridade). Estado vazio amigável.
- Verificado no navegador com 6 tarefas: agrupamento e ordenação corretos.
  Screenshot: `prioriza-prompt5.png`.

### Decisões e o porquê
| Decisão | Por quê |
|---|---|
| Recalcular quadrante/nota no agrupamento (não usar o campo salvo) | Fonte única = o cálculo; imune a dado adulterado no localStorage |
| Sempre devolver os 4 grupos, mesmo vazios | Tela consistente; o usuário aprende os quadrantes mesmo sem tarefas |
| Cor do cartão vem do grupo, não do campo salvo | Coerência visual com a mesma regra de recálculo |

### Testes
- 44 unitários (Jest): + ordenação (desc, pureza, vazio) e agrupamento (4 grupos,
  grupo certo, ordem interna, recálculo à prova de adulteração). Lista validada
  no navegador.

### Próximo passo
- **Prompt 6**: ciclo de status **a fazer → fazendo → concluída**, avançando e
  voltando um passo (sem beco sem saída); concluir carimba a data, reabrir limpa.

### Etapa 6 — Ciclo de status (Prompt 6)

### O que foi feito
- Funções puras no `logica.js`: `avancarStatus`/`voltarStatus` (travam nas pontas,
  sem beco sem saída) e `definirStatus` (carimba a data ao concluir, limpa ao
  reabrir — com o "agora" injetado de fora para manter pureza).
- Cartões da lista com rótulo de status colorido + botões **◀ Voltar / Avançar ▶**
  (desabilitados nas pontas); concluída fica riscada e mostra a data.
- `repositorio.novaTarefa` passou a nascer com `status: 'a-fazer'`.
- Verificado no navegador: concluir carimbou data; reabrir voltou p/ "fazendo" e
  limpou o carimbo; Avançar trava em "concluída". Screenshot: `prioriza-prompt6.png`.

### Decisões e o porquê
| Decisão | Por quê |
|---|---|
| "Agora" (data) injetado em `definirStatus`, não lido dentro | Mantém a função pura e testável (data fixa nos testes) |
| Travar as pontas em vez de bloquear tudo | "Sem beco sem saída": de concluída ainda dá para voltar/reabrir |
| Status desconhecido tratado como "a fazer" | Robustez com dados antigos que não tinham status |

### Testes
- 59 unitários (Jest): + ciclo de status (avança, volta, travas, desconhecido,
  carimbo, reabrir limpa, pureza). Ciclo validado no navegador.

### Próximo passo
- **Prompt 7**: painel "Foco do dia" com cartões (total, em Faça agora, concluídas
  hoje, destaque de atenção) em grid/flex responsivo sem quebra.

### Etapa 7 — Painel "Foco do dia" (Prompt 7)

### O que foi feito
- Função pura `calcularResumo(lista, hojeISO)` + `ehConcluidaHoje` no `logica.js`:
  total, pendentes, fazAgora (pendentes no quadrante crítico), concluídas hoje e
  a tarefa de atenção ("comece por").
- Seção "Foco do dia" no topo com 4 tiles em **grid `auto-fit`**; centralizei as
  atualizações num `atualizarTela()` (contador + painel + lista).
- Verificado no navegador (5 tarefas) e a **360px** (empilha sem quebra).
  Screenshots: `prioriza-prompt7.png` e `prioriza-prompt7-mobile.png`.

### Decisões e o porquê
| Decisão | Por quê |
|---|---|
| "Faça agora" do painel conta só PENDENTES | O painel é sobre ação; o que já foi concluído não pede atenção |
| "Comece por" = maior prioridade pendente | Traduz o conceito do app numa recomendação direta |
| `hojeISO` injetado em `calcularResumo` | Mantém a função pura e testável (data fixa nos testes) |
| Grid `auto-fit`/`minmax` | Cartões nunca estouram — de 360px ao desktop |

### Testes
- 65 unitários (Jest): + resumo do painel (total, fazAgora só pendentes,
  concluídas hoje vs outro dia, atenção, casos vazios). Painel validado no
  navegador (desktop + mobile).

### Próximo passo
- **Prompt 8**: filtros por quadrante e por status + ordenação, com a escolha
  **persistida** no localStorage (segue aplicada ao voltar).

### Etapa 8 — Filtros e preferências (Prompt 8)

### O que foi feito
- Funções puras `filtrarTarefas`, `ordenarTarefas` e `lerPreferencias` no
  `logica.js` (robustas a valor inválido/preferência corrompida).
- `repositorio.js`: `carregarPrefs`/`salvarPrefs` numa gaveta separada
  (`prioriza:prefs`).
- Barra de filtros (Quadrante / Status / Ordenar por) na seção "Minhas tarefas";
  grupos vazios somem quando há filtro ativo.
- Verificado no navegador: filtrar por status funcionou e, **após recarregar, a
  preferência voltou aplicada**. Screenshot: `prioriza-prompt8.png`.

### Decisões e o porquê
| Decisão | Por quê |
|---|---|
| Valor de filtro desconhecido é ignorado (trata como "todos") | Preferência adulterada não pode esconder todas as tarefas |
| Preferências em gaveta separada do localStorage | Não mistura dado do usuário (tarefas) com configuração de tela |
| Esconder grupos vazios só quando há filtro ativo | Sem filtro, os 4 quadrantes ensinam o método; com filtro, foco |

### Testes
- 77 unitários (Jest): + filtro (quadrante, status, combinado, valor inválido),
  ordenação (prioridade/recentes/antigas, pureza) e preferências (padrão, merge,
  corrompido). Persistência da preferência validada no navegador (reload).

### Próximo passo
- **Prompt 9**: excluir tarefa e "Reiniciar experiência", ambos com **confirmação**
  (positivo: confirma e apaga; negativo: cancela e mantém).

### Etapa 9 — Ações destrutivas (Prompt 9)

### O que foi feito
- Função pura `removerTarefa(lista, id)` no `logica.js`.
- Botão **Excluir** em cada cartão (contorno carmim), com confirmação.
- "Reiniciar experiência" agora apaga TODAS as tarefas e volta os filtros ao
  padrão, com confirmação.
- Verificado no navegador: cancelar mantém, confirmar apaga; reiniciar zera tudo.
  Screenshot: `prioriza-prompt9.png`.

### Decisões e o porquê
| Decisão | Por quê |
|---|---|
| Toda ação destrutiva passa por `window.confirm` | Evita perda de dados por clique acidental (usabilidade sem surpresa) |
| Reiniciar também reseta os filtros | "Restaurar de fábrica" completo — bom para recomeçar uma demonstração |
| Regra de remoção pura, confirmação na tela | Lógica testável; a interação (diálogo) fica na camada de UI |

### Testes
- 80 unitários (Jest): + remoção (por id, id inexistente, pureza). Confirmação
  (cancelar/confirmar) validada no navegador nas duas ações.

### Próximo passo
- **Prompt 10**: exportar as tarefas (arquivo) e limpar todos os dados, com dados
  fictícios nos exemplos (LGPD).

### Etapa 10 — Exportar / limpar dados (Prompt 10)

### O que foi feito
- Função pura `montarExportacao(lista, agoraISO)` no `logica.js`.
- Seção "Meus dados (LGPD)": nota de privacidade (dados só no navegador) +
  **Exportar (.json)** (download via Blob, sem servidor) e **Limpar meus dados**
  (confirmação; reaproveita `zerarDados`, compartilhado com "Reiniciar").
- Verificado no navegador: export com conteúdo correto; limpar cancela/confirma.
  Screenshot: `prioriza-prompt10.png`.

### Decisões e o porquê
| Decisão | Por quê |
|---|---|
| Exportar/limpar como controle explícito do usuário | LGPD: o dado é dele — pode levar e apagar |
| Pacote de exportação montado por função pura | Testável; a tela só faz o download |
| Reutilizar `zerarDados` em "Limpar" e "Reiniciar" | Uma única regra de limpeza, sem duplicar comportamento |
| Exemplos com dados fictícios (tarefas de CI) | Nunca expor dados reais de pessoas |

### Testes
- 82 unitários (Jest): + exportação (conteúdo/total/data, lista vazia). Export e
  limpeza validados no navegador (conteúdo do arquivo e confirmação).

### Próximo passo
- **Prompt 11**: revisar acessibilidade (teclado, foco, labels, alt), confirmar
  contraste AA e escrever os testes E2E (Playwright) do fluxo criar → priorizar →
  concluir.

### Etapa 11 — Acessibilidade + E2E (Prompt 11)

### O que foi feito
- Acessibilidade: `aria-label` (com o título da tarefa) nos botões repetidos,
  foco visível em campos/botões, labels ligados por `for/id`, logo `aria-hidden`,
  regiões `aria-live` para erros/prévia/contador.
- E2E com Playwright: `playwright.config.js` (servidor estático + `data-testid`) e
  `e2e/app.spec.js` — 4 cenários (fluxo principal, persistência de filtro,
  validação negativa, contraste AA).
- Instalados `@playwright/test` + Chromium; `npm run test:e2e` roda a suíte.

### Decisões e o porquê
| Decisão | Por quê |
|---|---|
| `aria-label` com o título nos botões de status/excluir | Vários "Voltar/Avançar" iguais confundem o leitor de tela |
| E2E localizando por `data-testid` | Não quebra quando o texto/estilo muda |
| Servidor estático dedicado (porta 8199) no config | Não conflita com outros apps rodando na máquina |

### Testes
- **82 unitários (Jest) + 4 E2E (Playwright)** = todos verdes. O E2E exercita o
  app real: criar → priorizar → concluir, filtro persistente, bloqueio sem título
  e contraste sem "Reprovado".

### Próximo passo
- **Prompt 12**: entregas finais — `README.md` (visão, como rodar, como testar,
  arquitetura, decisões) e os slides da história do projeto.

### Etapa 12 — Entregas finais (Prompt 12)

### O que foi feito
- `README.md` completo: visão, conceito com fontes, como rodar, como testar,
  arquitetura (regra pura × mundo externo), acessibilidade, inspiração Jenkins,
  LGPD e estrutura de arquivos.
- `slides.html`: deck autocontido de 12 slides no tema Jenkins (navegação por
  teclado ← →), contando a história do Setup 0 ao app pronto.

### Testes
- Placar final: **82 unitários (Jest) + 4 E2E (Playwright)**, todos verdes;
  contraste WCAG **AA** em todos os pares.

### 🎉 Projeto concluído
Do Setup 0 (tema + regras) ao app pronto: fundamentado (Eisenhower/GTD/MoSCoW),
testado dos dois lados, acessível (AA com relatório ao vivo), responsivo,
com LGPD e documentado (README, PROMPTS, RESUMAO, GLOSSARIO, SLIDES).
