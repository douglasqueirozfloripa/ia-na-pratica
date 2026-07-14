# Resumão do projeto — Análise de Sentenças/Decisões (fases recursais)

> **Semente (estado zero).** Este arquivo é preenchido **ao longo da
> experiência**: a cada etapa concluída, a IA escreve aqui um resumo do que foi
> construído, as decisões tomadas e os aprendizados. É o "memorial" do projeto —
> junto com o `PROMPTS.md`, alimenta o README e os slides finais.

## Como registrar cada etapa (convenção)

```
## Etapa N — [título da etapa]

### O que foi feito
- [em linguagem simples, o que passou a existir/funcionar]

### Decisões e o porquê
| Decisão | Por quê |
|---|---|
| [o que se decidiu] | [a razão — o trade-off que motivou] |

### Aprendizado (opcional)
- [o que essa etapa ensinou / o que evitar da próxima vez]

### Testes
- [o que foi coberto e o placar atual, ex.: X unitários + Y E2E = Z passando]
- [depois do passo 2.5, também o estado do lint/format]

### Próximo passo
- [a opção escolhida para seguir]
```

## Etapas (a preencher)

## Etapa 0 — Setup

### O que foi feito
- Criada a pasta do projeto e o **`CLAUDE.md`** (instruções do tema): app
  **Instância**, que classifica a **espécie** de cada sentença (terminativa ×
  definitiva; carga declaratória/constitutiva/condenatória) e a acompanha pelas
  **fases recursais** (1º grau → apelação → instância superior → trânsito em
  julgado), no contexto da concessionária **Eletroca**.
- Montado o **`PROMPTS.md`** com o Prompt 0 registrado e o **roteiro Prompt 1 → 13**
  adaptado ao tema.
- Semeados **`GLOSSARIO.md`** e este **`RESUMAO.md`**.

### Decisões e o porquê
| Decisão | Por quê |
|---|---|
| Espécie e prioridade **calculadas por função pura** | Classificação jurídica não pode ser digitada "no chute"; deriva dos fatos do caso e fica testável. |
| Ciclo de status = **fases recursais** (avança/volta um passo) | Espelha o trâmite real do processo sem virar beco sem saída. |
| Inspiração visual **perguntada no Prompt 3** | É decisão do usuário; a IA não escolhe a marca sozinha. |
| Dados **sempre fictícios** | Contencioso lida com dado sensível — LGPD desde o exemplo. |

### Testes
- Nenhum ainda — o primeiro código (e os testes) chega no **Prompt 2**.

### Próximo passo
- Executar o **Prompt 1** (fundamentação + glossário, com fontes linkadas).

## Etapa 1 — Fundamentação

### O que foi feito
- Pesquisadas e consolidadas as **fontes reais** do conceito central, com link, e
  registrados os termos no **`GLOSSARIO.md`** (Etapa 1), em linguagem simples e com
  analogias: **sentença** (CPC art. 203), **mérito**, **terminativa × definitiva**
  (arts. 485/487), **carga de eficácia** (declaratória/constitutiva/condenatória —
  **classificação ternária** de Liebman) + nota da **quinária** (Pontes de
  Miranda), **fases recursais** (apelação, RESp/STJ, RE/STF, embargos — art. 994),
  **trânsito em julgado** e **função pura**.
- A seção de fundamentação do **`CLAUDE.md`** foi consolidada com os mesmos links.
- **Refino (a pedido do usuário):** lido o **artigo do Jusbrasil** anexado (ótica
  **penal**) — incorporada dele a **classificação por órgão julgador**
  (simples/plúrima/complexa) e a grade penal ficou como **nota comparativa**. O
  eixo foi fixado na **ótica cível do consumidor**, com as fontes **CDC** e **REN
  ANEEL 1.000/2021** acrescentadas.

### Decisões e o porquê
| Decisão | Por quê |
|---|---|
| Adotar a **classificação ternária** (e citar a quinária só como nota) | Mantém o app didático; as três cargas cobrem o contencioso da concessionária sem perder rigor. |
| Ancorar tudo no **texto do CPC (Planalto)** + doutrina | Dá credibilidade e evita "achismo"; a lei é a fonte primária, a doutrina explica. |
| Eixo **cível do consumidor** (CDC + ANEEL), grade penal do artigo só como nota | O artigo indicado é penal, mas a Eletroca litiga em **relação de consumo** — o app precisa refletir o contencioso real. |
| Incorporar a **espécie por órgão** (simples/plúrima/complexa) | É neutra e didática, e **casa com a fase recursal** (1º grau = singular; acórdão = colegiado). |
| Modelar a entidade **`Decisão`** com `tipoLide` de **6 tipos** (CDC/ANEEL) | A tela e o painel precisam do "assunto" do caso; 6 tipos cobrem o grosso do contencioso da distribuidora sem inflar. |

### Testes
- Nenhum ainda — o primeiro código (e os testes) chega no **Prompt 2**.

### Próximo passo
- **Prompt 2** — núcleo da lógica em funções puras
  (`classificarEspecie(resolveuMerito, cargaEficacia, orgaoJulgador)`,
  `pontuarPrioridade`, `validarDecisao`) + testes no Jest.

## Etapa 2 — Núcleo da lógica (funções puras) + testes

### O que foi feito
- Criado o **`logica.js`** com as três funções centrais, todas **puras**:
  - `validarDecisao(decisao)` → `{ valida, erros }` (não lança; a tela decide).
  - `classificarEspecie(resolveuMerito, cargaEficacia, orgaoJulgador)` → espécie
    por **mérito** (terminativa/definitiva), **carga** (só se houve mérito) e
    **órgão** (simples/plúrima/complexa).
  - `pontuarPrioridade(valorEmRisco, resultado, diasParaPrazo)` → nota de atuação.
- Auxiliares puros `faixaValor`/`faixaPrazo` e os **domínios** em constantes
  (`TIPOS_LIDE`, `CARGAS`, `RESULTADOS`, `ORGAOS_JULGADORES`, `FASES`) — tela e
  testes reusam os mesmos valores.
- `package.json` (`npm test`), `jest.config.js` e `.gitignore`.

### Decisões e o porquê
| Decisão | Por quê |
|---|---|
| `validarDecisao` **não lança** erro (devolve `{valida, erros}`) | A tela mostra os erros de forma amigável; validar não é caminho de exceção. |
| `classificarEspecie` **lança** em entrada inválida | É cálculo derivado: quem chama deve validar antes; erro cedo evita classificação silenciosamente errada. |
| Prioridade por **faixas** (valor/prazo), não pelo número cru | Fica estável e fácil de conferir por teste; evita "número mágico" difícil de justificar. |
| Regra dura **sem mérito ⇒ sem carga e nunca definitiva** | Coerência jurídica: carga de eficácia é da sentença que julga o pedido (art. 487). |

### Testes
- **26 unitários (Jest) passando** — positivos e negativos (processo sem número,
  tipoLide fora da lista, com mérito sem carga, órgão inválido, valor negativo,
  "sem mérito nunca é definitiva", monotonia da prioridade…).
- Lint/format: ainda **não** (entram no Prompt 2.5).

### Próximo passo
- **Prompt 2.5** — ferramental de qualidade (ESLint + Prettier + Husky
  pre-commit) para valer em todas as etapas seguintes.

## Etapa 2.5 — Ferramental de qualidade de código

### O que foi feito
- Scripts `lint` (ESLint), `format` (Prettier `--write`) e `prepare` (Husky) no
  `package.json`, com as devDeps ESLint 8 / Prettier 3 / Husky 9.
- Configs: `.eslintrc.json` (`eslint:recommended`), `.prettierrc.json` (aspas
  simples, 2 espaços, `printWidth` 100), `.eslintignore`, `.prettierignore`
  (Markdown/HTML ficam fora do formatador) e `.husky/pre-commit`
  (lint + format + test).

### Decisões e o porquê
| Decisão | Por quê |
|---|---|
| Manter Markdown/HTML **fora** do Prettier | Diários e slides têm quebras/alinhamento feitos à mão; o reflow atrapalharia (mesma escolha dos projetos irmãos). |
| Aceitar que o **Husky não fixa o hook** neste layout | O `.git` é da pasta-raiz do experimento (repo único); o hook fica como referência e rodamos lint/format/test manualmente a cada etapa. |

### Testes
- **26 unitários (Jest) verdes** após a formatação.
- `npm run lint` **limpo**; código no padrão do Prettier.

### Próximo passo
- **Prompt 3** — primeira tela: a IA **pergunta a marca** de inspiração visual,
  depois monta `index.html` (formulário de nova decisão), design tokens, prévia da
  espécie e rodapé de contraste + teste de espaçamento; screenshot ao final.

## Etapa 3 — Primeira tela + design tokens + rodapé de contraste

### O que foi feito
- **Inspiração visual perguntada** ao usuário → **Jusbrasil**. `index.html` com o
  formulário de **nova decisão** (todos os campos da entidade, com `data-testid`),
  **prévia ao vivo** da espécie (`rotuloEspecie`) e da prioridade, e **rodapé de
  contraste** que mede cada par de tokens pela fórmula WCAG 2.1.
- `app.js` como cola tela↔lógica (sem regra de negócio).
- Novas funções puras na `logica.js`: `rotuloEspecie`, contraste
  (`hexParaRgb`/`luminancia`/`razaoContraste`/`nivelWcag`) e **`validarEspacamento`**.
- Design tokens (espaçamento 4/8/12/16/24, raio, tipografia, cores, sombra) em
  variáveis CSS, derivados da paleta Jusbrasil.

### Decisões e o porquê
| Decisão | Por quê |
|---|---|
| Inspiração **Jusbrasil** | Escolha do usuário; é a fonte do tema (portal jurídico) e a paleta azul/verde passa folgado em AA. |
| Prévia **ao vivo** em vez de só validar no envio | Mostra que espécie/prioridade são **calculadas**, reforçando o conceito. |
| Guarda de contraste **em teste** | Se alguém mexer numa cor e reprovar AA, a suíte quebra — acessibilidade deixa de depender do olho. |

### Aprendizado
- O screenshot **pegou um bug que passaria batido**: botão "Reiniciar" com texto
  navy sobre header navy (invisível). Corrigido para contorno/texto brancos (AAA).
  Print e teste andam juntos — um não substitui o outro.

### Testes
- **37 unitários (Jest) verdes** (novos: `rotuloEspecie`, contraste, guarda de
  tokens AA e `validarEspacamento`). Responsivo conferido a **360px** (sem quebra).
- `npm run lint` limpo; Prettier aplicado.

### Próximo passo
- **Prompt 4** — persistência no localStorage (salvar/recarregar as decisões;
  dado corrompido não quebra o app).

## Etapa 4 — Persistência no localStorage

### O que foi feito
- Funções puras na `logica.js`: `adicionarDecisao` (não muta a lista),
  `serializarDecisoes` e `lerDecisoesDe` — a **fronteira de segurança**: nunca
  lança, devolve `[]` para texto vazio/inválido e descarta itens que não parecem
  decisão.
- Novo `repositorio.js` (o impuro): lê/grava no localStorage e carimba `id`,
  `criadoEm` e `faseRecursal: 'primeiro-grau'`.
- `index.html`: contador **"Decisões salvas: N"**; `app.js` salva ao classificar
  (só se válida) e recarrega o contador ao abrir.
- Refino de UX: erros da prévia só aparecem após o usuário editar (form
  recém-salvo não fica "cheio de erros").

### Decisões e o porquê
| Decisão | Por quê |
|---|---|
| `lerDecisoesDe` nunca lança (devolve `[]`) | Dado corrompido/adulterado no navegador não pode derrubar o app. |
| id/data/fase no `repositorio.js`, não na lógica | Dependem do relógio/aleatoriedade (impuro); a lógica fica pura e testável. |
| Salvar só decisão **válida** | Não sujar a gaveta com registro incompleto; a validação é a mesma da prévia. |

### Testes
- **42 unitários (Jest) verdes** (novos: pureza do `adicionarDecisao`, round-trip
  serializar/ler, JSON corrompido → `[]`, não-array → `[]`, descarte de lixo).
- **Verificado no navegador:** 2 decisões sobrevivem ao reload; storage corrompido
  volta a 0 sem quebrar. `npm run lint` limpo, Prettier aplicado.

### Próximo passo
- **Prompt 5** — lista organizada por fase recursal (agrupada, ordenada por
  prioridade, com contador por grupo).

## Etapa 5 — Lista organizada por fase recursal

### O que foi feito
- Funções puras na `logica.js`: `diasEntre(hojeISO, prazoISO)`,
  `prioridadeDaDecisao` (recalcula — não confia em campo salvo),
  `ordenarPorPrioridade` (estável, não muta) e `agruparPorFase` (as 4 fases na
  ordem fixa, cada grupo ordenado por prioridade e com total). `FASE_ROTULO` para
  os nomes amigáveis.
- Nova seção **"Decisões por fase recursal"** no `index.html`; render no `app.js`
  com um cartão por decisão (número, tipo de lide, espécie recalculada, resultado,
  valor em R$ e prioridade) e aviso quando a fase está vazia.

### Decisões e o porquê
| Decisão | Por quê |
|---|---|
| "Hoje" **injetado** (`hojeISO`) nas funções | Mantém tudo puro/testável; a leitura do relógio real fica só no `app.js`. |
| Recalcular prioridade/espécie na render (não ler campo salvo) | Dado adulterado no localStorage não engana a ordenação nem a classificação. |
| Ordenação **estável** (empate mantém ordem) | Resultado previsível; evita "pular" cartões a cada render. |
| Mostrar as 4 fases sempre (mesmo vazias) | O usuário enxerga o trâmite inteiro; a fase vazia vira convite, não um buraco. |

### Testes
- **49 unitários (Jest) verdes** (novos: `diasEntre`, ordenação por prioridade,
  estabilidade, imutabilidade, agrupamento nas 4 fases com contagem, fase
  desconhecida ignorada, decisão incompleta pontua 0).
- **Verificado no navegador** com 5 decisões fictícias em fases diferentes:
  agrupamento, ordenação e contadores corretos. Lint limpo, Prettier aplicado.

### Próximo passo
- **Prompt 6** — ciclo de fases recursais (avançar/voltar um passo; transitar em
  julgado carimba a data, reabrir limpa).

## Etapa 6 — Ciclo de fases recursais

### O que foi feito
- Funções puras: `avancarFase`/`voltarFase` (travam nas pontas), `indiceFase` e
  `definirFase` (ao transitar carimba `dataTransito` com o "agora" injetado; ao
  sair, limpa).
- Cada cartão ganhou "Fase: …", botões **Voltar/Avançar** (desabilitados nas
  pontas, com `aria-label` do processo) e selo "✓ Transitado em …".

### Decisões e o porquê
| Decisão | Por quê |
|---|---|
| Travar nas pontas (1º grau / transitado) | Sem beco sem saída, e sem "avançar" um caso já encerrado. |
| Carimbar/limpar `dataTransito` no `definirFase` (puro) | A data do trânsito é consequência da fase; concentrar a regra evita estado inconsistente. |

### Testes
- Coberto junto do Prompt 7: **61 verdes** (avança na ordem, trava nas pontas,
  volta um passo, carimba ao transitar, limpa ao reabrir, fase inválida lança).
- Verificado no navegador (0001 migrou de grupo ao avançar; carimbo exibido).

### Próximo passo
- **Prompt 7** — Painel do contencioso (feito em conjunto).

## Etapa 7 — Painel do contencioso (dashboard)

### O que foi feito
- Função pura `calcularResumo(lista, hojeISO)`: total, `prazoCorrendo` (ativas com
  prazo em aberto), `transitados`, `exposicaoAtiva` (soma das **não** transitadas)
  e `destaque` (maior prioridade ativa).
- Seção "Painel do contencioso" no topo com 4 tiles em grid `auto-fit` (o tile de
  prazo fica em **atenção** quando > 0) e a linha "Aja por esta primeiro".

### Decisões e o porquê
| Decisão | Por quê |
|---|---|
| Exposição exclui transitadas | O risco "em disputa" é o que ainda pode mudar; o transitado já é passado. |
| Destaque só entre ativas | Não faz sentido "agir" no que já transitou em julgado. |
| Tiles em grid `auto-fit` | Responsivo de 360px ao desktop sem estourar (pilar visual do projeto). |

### Testes
- **61 unitários (Jest) verdes** (novos: ciclo de fases + `calcularResumo` —
  contagens, exposição excluindo transitado, destaque correto, lista vazia).
- **Verificado no navegador** (4 decisões): Total 4, Prazo correndo 2, Transitadas
  1, Exposição R$ 163.000, destaque 0003. Responsivo sem quebra. Lint/format ok.

### Próximo passo
- **Prompt 8** — filtros/preferências persistidos (por fase, espécie, resultado).

## Etapa 8 — Filtros/preferências persistidos

### O que foi feito
- Funções puras: `PREFS_PADRAO`, `lerPreferencias` (blindada) e `filtrarDecisoes`
  (fase + espécie/mérito + resultado). `repositorio.js`: `carregarPrefs`/
  `salvarPrefs` (gaveta `instancia:prefs`).
- Barra "Filtros da lista" (fieldset com legenda) na seção da lista; a escolha é
  salva a cada mudança e restaurada ao abrir. Dois "vazios": nada salvo × nada
  casa com o filtro.

### Decisões e o porquê
| Decisão | Por quê |
|---|---|
| `lerPreferencias` volta ao padrão em corrompido/desconhecido | Preferência é conveniência; não pode quebrar nem "travar" a lista. |
| Painel sobre o total, lista filtrada | O panorama do contencioso não deve mudar com o filtro de visualização. |
| Filtro por espécie = mérito (definitiva/terminativa) | É o eixo central da classificação e o mais útil para triar. |

### Testes
- Coberto junto do Prompt 9: **70 verdes** (padrão, leitura válida, corrompida,
  valores desconhecidos, combinação de filtros, filtro por mérito).
- Verificado no navegador: filtro por Apelação persistiu após reload.

### Próximo passo
- **Prompt 9** — ações destrutivas (feito em conjunto).

## Etapa 9 — Ações destrutivas com confirmação + "Reiniciar experiência"

### O que foi feito
- Função pura `removerDecisao(lista, id)`. Botão **Excluir** por cartão
  (`window.confirm`); **"Reiniciar experiência"** apaga TODAS as decisões e reseta
  filtros (`limparTudo`), também com confirmação.

### Decisões e o porquê
| Decisão | Por quê |
|---|---|
| Confirmação em toda ação destrutiva | Sem clique acidental apagando trabalho — pilar de usabilidade. |
| `removerDecisao` pura (filtra por id, não muta) | Testável e previsível; o `app.js` só orquestra. |
| Reiniciar limpa decisões **e** prefs | "Voltar ao zero" de verdade, sem deixar filtro fantasma. |

### Testes
- **70 unitários (Jest) verdes** (novos: remove por id sem mutar; id inexistente
  mantém).
- **Verificado no navegador:** excluir cancelar mantém (4→4), confirmar apaga
  (4→3); reiniciar zera tudo (decisões `[]`, prefs `null`, painel 0). Lint/format ok.

### Próximo passo
- **Prompt 10** — exportar / limpar dados (LGPD).

## Etapa 9.5 — Ajustes de modelo/UI (a pedido do usuário)

### O que foi feito
- **Separação de valores por decisão:** `valorEmRisco` → **`valorCausa`** (o que
  está em risco) + novo **`valorCondenacao`** (valor final condenatório / a pagar;
  opcional, 0 quando a empresa não foi condenada). Atualizado na entidade,
  formulário, validação, cartões e `pontuarPrioridade`/`prioridadeDaDecisao`.
- **Painel revisado (6 tiles):** `calcularResumo` ganhou `totalCondenado` (soma do
  a pagar) e `percentDefendidos` (% de improcedentes); a **exposição em disputa**
  agora soma só o `valorCausa` das ativas e **zera quando todas transitam**.
- **Bug de valores grandes corrigido:** tiles e cartões com `overflow-wrap` e
  número tabular — nada estoura o layout (testado com R$ 1.234.567).

### Decisões e o porquê
| Decisão | Por quê |
|---|---|
| Causa × condenação separadas | São coisas diferentes: risco potencial (causa) vs. o que a empresa efetivamente deve pagar. |
| Exposição só das ativas | "Em disputa" é o que ainda pode mudar; transitado já é definitivo. |
| % defendidos | Métrica de sucesso do jurídico (quanto foi julgado improcedente). |

### Testes
- **77 unitários verdes** (novos: valorCondenacao opcional/negativo, exposição
  zera com tudo transitado, totalCondenado, percentDefendidos).

## Etapa 10 — Exportar / limpar dados (LGPD)

### O que foi feito
- Função pura `montarExportacao(lista, agoraISO)` (pacote com app, data, total e
  decisões). Seção "Meus dados (LGPD)": nota de privacidade + **Exportar (.json)**
  e **Limpar meus dados** (confirmação; limpa só as decisões).

### Decisões e o porquê
| Decisão | Por quê |
|---|---|
| Export como `.json` baixável | O dado é do usuário (LGPD) — ele leva embora quando quiser. |
| "Limpar meus dados" mantém as prefs | Apagar conteúdo ≠ resetar o app; reiniciar (header) é que zera tudo. |

### Testes
- **77 unitários verdes** (montarExportacao: pacote correto e lista vazia).
- Export verificado no navegador (JSON com app/geradoEm/total/decisões).

## Etapa 11 — Acessibilidade WCAG AA + E2E (Playwright)

### O que foi feito
- Revisão de acessibilidade: labels por `for/id`, radios/filtros em
  `fieldset/legend`, `aria-label` nos botões repetidos, foco visível, `aria-live`
  (prévia, contador, painel), `§` `aria-hidden`, contraste AA garantido por teste.
- `playwright.config.js` + `e2e/app.spec.js` (webServer estático, `data-testid`).

### Testes
- **77 unitários (Jest) + 5 E2E (Playwright) = todos verdes**. E2E cobre: fluxo
  cadastrar → classificar → avançar → transitar; filtro persistente; validação
  negativa; excluir; e nenhum contraste "Reprovado".
- Lint limpo, Prettier aplicado.

### Próximo passo
- **Prompt 12** — entregas finais (README + slides).

## Etapa 12 — Entregas finais (README + slides)

### O que foi feito
- **`README.md`** completo: visão, conceito com fontes, como rodar/testar,
  qualidade de código, passo a passo para subir o repositório, arquitetura
  (pura × externo), acessibilidade, inspiração Jusbrasil, LGPD e estrutura.
- **`slides.html`**: deck autocontido de 13 slides (tema Jusbrasil, navegação por
  teclado) do Setup 0 ao app pronto. Capa apresenta **tema + inspiração visual**.

### Testes
- Sem código de negócio novo; suíte segue **77 unitários + 5 E2E** verdes.

## Etapa 13 — Plan Test (`PLANO-DE-TESTES.md`)

### O que foi feito
- Plano dos próximos testes: **(A)** cobertura a reforçar (E2E de voltar fase,
  filtros combinados, exportar/limpar/reiniciar; bordas de `diasEntre`,
  `filtrarDecisoes`, `lerDecisoesDe`) e **(B)** features candidatas com esboço de
  testes (editar, alerta de prazo, busca, importar `.json`, datas em UTC).

### Próximo passo
- 🎉 **Projeto concluído** (Setup 0 → 13). Evolução natural: escolher uma feature
  do `PLANO-DE-TESTES.md` (B) ou integrar IA no próprio app.

## Etapa 14 — Reforço de testes de componente (cenários e painel)

### O que foi feito
- **Unitários (data-driven):** todas as combinações de `classificarEspecie`, cada
  campo obrigatório isolado, cada tipo de lide e resultado, bordas exatas de
  `faixaValor`/`faixaPrazo`, valores exatos de `pontuarPrioridade`, ciclo completo
  pelas `FASES` e muitos cenários de `calcularResumo` (exposição só das ativas,
  zerando ao transitar tudo, total condenado, % defendidos com arredondamento,
  prazo correndo × vencido, destaque, itens nulos).
- **Componente (Playwright, `e2e/painel.spec.js`):** o painel reage a cada cenário
  e o cartão mostra espécie/"Causa:"/"A pagar:" conforme o caso.

### Testes
- **146 unitários (Jest) + 13 E2E (Playwright) = todos verdes.**
- `npm run test:e2e` usa `--headed` (mostra o navegador); em ambiente sem display,
  `npx playwright test` roda headless.
