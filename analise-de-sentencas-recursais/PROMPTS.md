# Prompts do projeto — Análise de Sentenças/Decisões (fases recursais)

> **Diário de prompts.** Este arquivo cresce a cada avanço: você registra o
> prompt enviado, o resultado e o próximo passo. Comece pelo **Prompt 0** (já
> executado abaixo) e siga o **roteiro previsto** um prompt de cada vez.

## Como conversar com a IA (para iniciantes)

1. **Um objetivo por prompt.** Peça em **partes pequenas**.
2. **Peça os testes junto** de cada funcionalidade.
3. **Deixe a IA fechar cada resposta** com: explicar → documentar → propor 2–3
   próximos passos. **Você escolhe** o próximo.
4. **Valide o que vê**: peça uma screenshot/rodar o app quando for algo visual.
5. **Não precisa repetir as regras**: a IA lê o `CLAUDE.md` e as segue sozinha.
6. **Na dúvida, pergunte "por quê?"**.

## Prompt 0 — Setup ✅ executado

```
Tema: Análise de sentenças/decisões (fases recursais).
Ramo: concessionária de energia elétrica (Eletroca).
Contexto: artigo do Jusbrasil sobre as espécies de sentença.
Com base no instrucoes-do-projeto-template.md, preencha o arquivo de instruções
para este tema (o que é o app, fundamentação com fontes, stack, regras de
negócio, regras automáticas) e monte o roteiro de prompts no PROMPTS.md.
```

**Resultado:** criados `CLAUDE.md` (instruções do tema, com a fundamentação
esboçada — CPC arts. 203/485/487/994, classificação ternária de Liebman e o
sistema recursal — a ser consolidada com links no Prompt 1), `PROMPTS.md` (este
roteiro), `GLOSSARIO.md` e `RESUMAO.md` (sementes). Nenhum código ainda. Regra
reforçada: **a inspiração visual (marca) será PERGUNTADA ao usuário no Prompt 3**,
não escolhida pela IA. App entendido: **Instância**, que **classifica a espécie**
de cada sentença (com/sem mérito; carga eficacial) e a **acompanha pelas fases
recursais** (1º grau → apelação → instância superior → trânsito em julgado),
dizendo por qual **agir primeiro** conforme a exposição e o prazo.
**Próximo passo:** executar o **Prompt 1** (fundamentação + glossário).

## Prompt 1 — Fundamentação (conceito central) ✅ executado

```
Pesquise e consolide a fundamentação do app: as espécies de sentença no CPC
(terminativa, art. 485, x definitiva, art. 487; conceito de sentença no art. 203),
a classificação pela carga de eficácia (declaratória/constitutiva/condenatória —
classificação ternária de Liebman; cite a quinária como nota) e o sistema
recursal / fases recursais (apelação, RESp/STJ, RE/STF, embargos, trânsito em
julgado). Registre cada termo no GLOSSARIO.md em linguagem simples, com a fonte
linkada. Ainda sem código.
```

**Resultado:** `GLOSSARIO.md` recebeu a "Etapa 1 — Fundamentação" com os termos
**sentença** (CPC art. 203), **mérito**, **sentença terminativa** (art. 485) ×
**definitiva** (art. 487), **carga de eficácia** (declaratória/constitutiva/
condenatória — ternária de Liebman) + nota da **quinária** (Pontes de Miranda:
mandamental/executiva), **fases recursais** (apelação, RESp/STJ, RE/STF, embargos
— CPC art. 994), **trânsito em julgado** e **função pura** — cada um em linguagem
simples, com analogia, o porquê no app e a **fonte linkada** (Planalto/CPC,
Jusbrasil, Âmbito Jurídico, MPCE). A fundamentação do `CLAUDE.md` foi consolidada
com os mesmos links. **Nenhum código ainda.**
_Refino a pedido do usuário:_ lido o **artigo do Jusbrasil** anexado (é de ótica
**penal**), incorporamos dele a **classificação por órgão julgador** (subjetivamente
simples/plúrima/complexa — casa com a fase recursal) e registramos a grade penal
como **nota comparativa**. O eixo do app foi fixado na **ótica cível do
consumidor**: acrescentadas as fontes **CDC (Lei 8.078/1990)** e **REN ANEEL nº
1.000/2021** (direitos do consumidor de energia). `classificarEspecie` passou a
receber também o **órgão julgador**.
**Próximo passo:** Prompt 2 — núcleo da lógica em funções puras + testes (Jest).

## Prompt 2 — Núcleo da lógica (funções puras) + testes ✅ executado

```
Crie logica.js com funções puras: classificarEspecie(resolveuMerito,
cargaEficacia, orgaoJulgador) devolvendo terminativa/definitiva + o tipo pela
carga + a espécie por órgão (simples/plúrima/complexa); pontuarPrioridade(
valorEmRisco, resultado, diasParaPrazo); e validarDecisao(...). Escreva
logica.test.js no Jest com casos positivos e negativos (ex.: decisão sem
identificador é rejeitada; sem mérito nunca vira definitiva). Sem tela ainda.
```

**Resultado:** criados `logica.js` (funções puras `validarDecisao`,
`classificarEspecie`, `pontuarPrioridade` + auxiliares `ehTextoPreenchido`,
`faixaValor`, `faixaPrazo` e os domínios `TIPOS_LIDE`/`CARGAS`/`RESULTADOS`/
`ORGAOS_JULGADORES`/`FASES`) e `logica.test.js`. `package.json` com `npm test`,
`jest.config.js` e `.gitignore`. Regras duras cobertas: **sem mérito nunca vira
definitiva e não tem carga**; carga só exigida quando há mérito; entradas
inválidas de `classificarEspecie`/`pontuarPrioridade` lançam erro. Placar:
**26 testes passando** (positivos + negativos). Nenhuma tela ainda.
**Próximo passo:** Prompt 2.5 — ferramental de qualidade (ESLint + Prettier +
Husky), para valer em todas as etapas seguintes.

## Prompt 2.5 — Ferramental de qualidade de código ✅ executado

```
Configure o ferramental de qualidade: scripts "lint" (ESLint sobre os .js),
"format" (Prettier --write) e "prepare" (Husky) no package.json; hook de
pre-commit rodando lint + format em qualquer branch; e os arquivos .gitignore,
.eslintignore e .prettierignore (ignorando node_modules, test-results,
playwright-report, .DS_Store). Ao final, rode lint e format e confirme a suíte
verde.
```

**Resultado:** `package.json` ganhou os scripts `lint`/`format`/`prepare` e as
devDeps ESLint 8 + Prettier 3 + Husky 9. Criados `.eslintrc.json` (base
`eslint:recommended`, env browser/node/jest), `.prettierrc.json` (aspas simples,
2 espaços, `printWidth` 100), `.eslintignore`/`.prettierignore` (Markdown e HTML
formatados à mão ficam fora) e `.husky/pre-commit` (lint + format + test).
`npm run lint` **limpo**; `npm run format` aplicado (reflow de `logica.js` e
`logica.test.js`); suíte **26 testes verdes** após a formatação.
_Nota honesta:_ como o `.git` está na pasta-raiz do experimento (repo único, não
uma por projeto), o **Husky v9 não fixa o hook** nesta subpasta (sai sem erro, por
design) — mesmo caso dos projetos irmãos. O `.husky/pre-commit` fica como
referência; na prática rodamos lint/format/test a cada etapa.
**Próximo passo:** Prompt 3 — primeira tela; **começa perguntando a marca de
inspiração visual**, depois design tokens + rodapé de contraste.

## Prompt 3 — Primeira tela + design tokens + rodapé de contraste ✅ executado

```
Antes de criar a tela, me pergunte qual marca usar como inspiração visual.
Depois crie index.html com o formulário de nova decisão, design tokens derivados
dessa marca (declare qual), a prévia da espécie classificada e um rodapé que
calcula contraste ao vivo. Inclua o teste de espaçamento. Screenshot ao final.
```

**Resultado:** a IA **perguntou a marca** → escolha do usuário: **Jusbrasil**.
Criados `index.html` (header navy, formulário de nova decisão com `data-testid`,
prévia ao vivo da espécie + prioridade, rodapé de contraste) e `app.js` (cola
tela↔lógica, sem regra de negócio). Tokens derivados da paleta **Jusbrasil**
(azul `#0B57D0`, navy `#0A3D91`, verde `#00875A`…), todos verificados em AA.
Novas funções puras na `logica.js`: `rotuloEspecie`, contraste
(`hexParaRgb`/`luminancia`/`razaoContraste`/`nivelWcag`) e **`validarEspacamento`**
(folga > 0,5px, ignora pai/filho). Screenshots `instancia-prompt3-desktop.png` e
`instancia-prompt3-mobile.png` (360px sem quebra). **Bug pego e corrigido:** o
botão "Reiniciar experiência" ficava invisível (texto navy sobre header navy) —
passou a ter contorno/texto brancos (AAA). Placar: **37 testes** (inclui a guarda
que reprova qualquer token abaixo de AA e os casos de `validarEspacamento`).
**Próximo passo:** Prompt 4 — persistência no localStorage.

## Prompt 4 — Persistência no localStorage ✅ executado

```
Faça as decisões serem salvas no localStorage e recarregadas ao abrir o app.
Testes: (positivo) decisão persiste após recarregar; (negativo) dado corrompido
não quebra o app.
```

**Resultado:** funções puras de persistência na `logica.js` (`adicionarDecisao`,
`serializarDecisoes`, `lerDecisoesDe` — esta tolera dado corrompido e devolve `[]`,
descartando itens que não parecem decisão). Novo `repositorio.js` (acesso ao
localStorage + id/data/fase inicial). `index.html` ganhou o contador "Decisões
salvas: N" e `app.js` passou a **salvar ao classificar** (só se válida) e recarregar.
_Refino de UX:_ a prévia só mostra erros depois que o usuário mexe no formulário —
form recém-salvo não aparece "cheio de erros". **Verificado no navegador:** 2
decisões sobreviveram ao reload (contador = 2, id e `faseRecursal` carimbados) e
storage corrompido não quebrou (contador voltou a 0, app vivo). Screenshot:
`instancia-prompt4.png`. Placar: **42 testes**.
**Próximo passo:** Prompt 5 — lista organizada por fase recursal.

## Prompt 5 — Lista organizada por fase recursal ✅ executado

```
Mostre as decisões agrupadas por fase recursal (1º grau, Apelação, Instância
superior, Transitado em julgado), ordenadas pela prioridade de atuação, com
contador por grupo. Testes da ordenação e do agrupamento.
```

**Resultado:** funções puras na `logica.js` — `diasEntre` (dias até o prazo, com
"hoje" injetado), `prioridadeDaDecisao` (recalcula, ignora campo adulterado),
`ordenarPorPrioridade` (estável, não muta) e `agruparPorFase` (4 fases na ordem
fixa, cada uma ordenada + total); `FASE_ROTULO` adicionado. Nova seção "Decisões
por fase recursal" no `index.html` + render no `app.js` (cartão por decisão com
número, tipo de lide, espécie recalculada, resultado, valor em R$ e prioridade;
fase vazia mostra aviso). **Verificado no navegador** com 5 decisões fictícias
espalhadas pelas fases: agrupamento e ordenação corretos (Apelação: 45 antes de 6;
1º grau: 33 antes de 3), contador por grupo certo e "Instância superior" vazia com
aviso. Screenshot: `instancia-prompt5.png`. Placar: **49 testes**.
**Próximo passo:** Prompt 6 — ciclo de fases recursais (avança/volta um passo).

## Prompt 6 — Ciclo de fases recursais (avança / volta um passo) ✅ executado

```
Implemente o ciclo de fases recursais avançando e voltando um passo (sem beco sem
saída). Transitar em julgado carimba a data; reabrir/voltar limpa. Testes
positivos e negativos das transições.
```

**Resultado:** funções puras `avancarFase`/`voltarFase` (travam nas pontas),
`indiceFase` e `definirFase` (carimba `dataTransito` ao transitar; limpa ao sair)
na `logica.js`. Cada cartão da lista ganhou "Fase: …" + botões **Voltar/Avançar**
(desabilitados nas pontas, com `aria-label` do processo) e selo "✓ Transitado em
…". Verificado no navegador: avancei 0001 (1º grau → apelação) e ela mudou de
grupo; transitada mostra o carimbo; Avançar trava no trânsito. Placar (com o
Prompt 7): **61 testes**.
**Próximo passo:** Prompt 7 — painel do contencioso (feito em conjunto).

## Prompt 7 — Painel do contencioso (dashboard) ✅ executado

```
Crie o "Painel do contencioso" com cartões: total de decisões, quantas com prazo
recursal correndo (atenção), quantas transitadas em julgado, exposição financeira
total e o destaque "aja por esta primeiro". Grid/flex responsivo que não estoura.
Screenshot ao final.
```

**Resultado:** função pura `calcularResumo(lista, hojeISO)` na `logica.js` (total,
prazoCorrendo, transitados, exposicaoAtiva — exclui transitadas —, e destaque da
maior prioridade ativa). Seção "Painel do contencioso" no topo com 4 tiles em grid
`auto-fit` (tile de prazo fica em **atenção** quando > 0) + linha "Aja por esta
primeiro". Verificado no navegador com 4 decisões: Total 4, Prazo correndo 2,
Transitadas 1, Exposição **R$ 163.000** (exclui a transitada), destaque 0003
(prioridade 45). Responsivo sem quebra. Screenshot: `instancia-prompt6-7.png`.
Placar: **61 testes**.
**Próximo passo:** Prompt 8 — filtros/preferências persistidos.

## Prompt 8 — Filtros/preferências persistidos ✅ executado

```
Adicione filtros por fase, por espécie e por resultado, persistindo a escolha no
localStorage (segue aplicada ao voltar). Testes de filtro e de persistência da
preferência.
```

**Resultado:** funções puras `PREFS_PADRAO`, `lerPreferencias` (blindada:
corrompido/desconhecido volta ao padrão) e `filtrarDecisoes` (fase + espécie/mérito
+ resultado) na `logica.js`. `repositorio.js` ganhou `carregarPrefs`/`salvarPrefs`
(gaveta `instancia:prefs`). Barra "Filtros da lista" (fieldset) na seção da lista;
`app.js` salva a preferência a cada mudança e restaura no load. **Verificado no
navegador:** filtro por Apelação mostrou só 0003/0004 e, **após recarregar, voltou
aplicado** (select + lista); painel segue sobre o total. Placar (com o Prompt 9):
**70 testes**.
**Próximo passo:** Prompt 9 — ações destrutivas (feito em conjunto).

## Prompt 9 — Ações destrutivas com confirmação + "Reiniciar experiência" ✅ executado

```
Adicione excluir decisão e o botão "Reiniciar experiência" no header, ambos com
confirmação. Testes: (positivo) confirma e apaga; (negativo) cancela e mantém.
```

**Resultado:** função pura `removerDecisao(lista, id)` na `logica.js`. Cada cartão
ganhou **Excluir** (contorno vermelho, `window.confirm`); "Reiniciar experiência"
passou a apagar TODAS as decisões e voltar os filtros ao padrão (`limparTudo` no
`repositorio.js`), também com confirmação. **Verificado no navegador:** excluir
cancelado manteve (4→4), confirmado apagou (4→3); reiniciar zerou tudo (decisões
`[]`, prefs `null`, painel 0, selects no padrão). Screenshot: `instancia-prompt8-9.png`.
Placar: **70 testes**.
**Próximo passo:** Prompt 10 — exportar / limpar dados (LGPD).

## Ajustes de modelo/UI (a pedido do usuário) ✅ executado

```
Vi alguns erros de interface com valores grandes. A exposição em disputa deve
zerar quando todas as decisões transitarem. Separar valor da causa, do valor
final condenatório (a pagar) por decisão. E mostrar o percentual de defendidos
(improcedentes).
```

**Resultado:** o campo `valorEmRisco` virou **`valorCausa`** e entrou o
**`valorCondenacao`** (valor a pagar por decisão; opcional, 0 quando a empresa não
foi condenada) — na entidade, no formulário, na validação, nos cartões (mostram
"Causa: R$…" e, se houver, "A pagar: R$…" em vermelho). `calcularResumo` ganhou
**`totalCondenado`** (soma do a pagar), **`percentDefendidos`** (% de improcedentes)
e a **exposição em disputa** passou a somar só o valor da causa das **ativas** —
zera quando todas transitam. Painel agora tem 6 tiles. **Bug de valores grandes
corrigido** (tiles/cartões com `overflow-wrap` e número tabular; nada estoura).
Verificado no navegador com valor de R$ 1.234.567. Placar: **77 testes**.

## Prompt 10 — Exportar / limpar dados (LGPD) ✅ executado

```
Permita exportar as decisões (arquivo .json) e limpar todos os dados. Use dados
fictícios nos exemplos. Testes de exportação e de limpeza.
```

**Resultado:** função pura `montarExportacao(lista, agoraISO)` na `logica.js`. Nova
seção "Meus dados (LGPD)" com nota de privacidade (dados só no navegador) + botões
**Exportar (baixar .json)** e **Limpar meus dados** (com confirmação; limpa só as
decisões, mantém prefs). Verificado no navegador: export gera o JSON correto (app,
geradoEm, total, decisões). Placar: **77 testes**.
**Próximo passo:** Prompt 11 — acessibilidade WCAG AA + E2E (Playwright).

## Prompt 11 — Acessibilidade WCAG AA + E2E (Playwright) ✅ executado

```
Revise acessibilidade (teclado, foco visível, labels ligados, alt), confirme
contraste AA em todas as cores e escreva os testes E2E (Playwright) do fluxo
principal: cadastrar → classificar → avançar de fase → transitar em julgado.
```

**Resultado:** revisão de acessibilidade — labels ligados por `for/id`, radios em
`fieldset/legend`, filtros em `fieldset`, `aria-label` nos botões repetidos
(Voltar/Avançar/Excluir), foco visível, regiões `aria-live` (prévia, contador,
painel) e `§` do logo `aria-hidden`. Criados `playwright.config.js` e
`e2e/app.spec.js`. `package.json` com `test:e2e`; `@playwright/test` instalado.
Placar: **77 unitários (Jest) + 5 E2E (Playwright) = todos verdes** (fluxo
principal, filtro persistente, validação negativa, excluir e contraste sem
"Reprovado"). Screenshot: `instancia-prompt10-11.png`.
**Próximo passo:** Prompt 12 — entregas finais (README + slides).

## Prompt 12 — Entregas finais (README + slides) ✅ executado

```
Gere o README.md (visão, como rodar, como testar, arquitetura, decisões, passo a
passo para subir o repositório) e os slides da história do projeto, alimentados
por PROMPTS.md e RESUMAO.md. A capa apresenta o tema e a inspiração visual.
```

**Resultado:** `README.md` completo (visão, conceito com fontes, como rodar/testar,
qualidade de código, subir o repositório, arquitetura pura×externo,
acessibilidade, inspiração Jusbrasil, LGPD, estrutura de arquivos) e `slides.html`
— deck autocontido de **13 slides** no tema Jusbrasil (navegação por teclado),
contando a história do Setup 0 ao app pronto. Capa abre com **"Tema: Análise de
sentenças/decisões (fases recursais) · Inspiração visual: Jusbrasil"**. Capa
conferida por screenshot (`instancia-slides-capa.png`).
**Próximo passo:** Prompt 13 — Plan Test (`PLANO-DE-TESTES.md`).

## Prompt 13 — Plan Test (planejar os próximos testes) ✅ executado

```
Monte um PLANO-DE-TESTES.md: aprofundar a cobertura do que já existe (lacunas de
unitário e E2E) e esboçar os testes das próximas features candidatas. Cada teste
nomeia (positivo) ou (negativo). Nada de código ainda.
```

**Resultado:** `PLANO-DE-TESTES.md` com **(A) cobertura a reforçar** (voltar fase,
filtros combinados, exportar/limpar/reiniciar no E2E, bordas de `diasEntre`/
`filtrarDecisoes`/`lerDecisoesDe`) e **(B) features candidatas** com esboço de
testes (editar decisão, alerta de prazo, busca, importar `.json`, datas em UTC).
🎉 **Projeto concluído: 77 unitários + 5 E2E, WCAG AA.**

## Reforço — bastante testes de componente (a pedido do usuário) ✅ executado

```
Faça bastante testes de componente para cobrir os cenários possíveis de decisões
e os indicadores do painel.
```

**Resultado:** leva ampla, data-driven. Unitários (`logica.test.js`): todas as
combinações de `classificarEspecie` (3 cargas × 3 órgãos + sem mérito), cada campo
obrigatório isolado, cada tipo de lide e cada resultado, bordas exatas de
`faixaValor`/`faixaPrazo`, valores exatos de `pontuarPrioridade`, ciclo completo
pelas `FASES` e **muitos cenários do painel** (`calcularResumo`: exposição só das
ativas, **zera** quando tudo transita, total condenado, **% defendidos** com
arredondamento, prazo correndo × vencido, destaque, itens nulos). Componente
(Playwright, `e2e/painel.spec.js`): painel reage a cada cenário (total,
transitadas, exposição zerando, % defendidos, total a pagar, tile de atenção,
destaque) e o cartão mostra espécie/“Causa:”/“A pagar:” conforme o caso. Placar:
**146 unitários + 13 E2E = todos verdes**.
_Nota:_ o `test:e2e` está com `--headed` (mostra o navegador na sua máquina); em
ambiente **sem display** use `npx playwright test` (headless).

## Como registrar cada prompt (convenção)

```
## Prompt N — [título curto] ✅ executado

​```
[o texto exato do prompt enviado]
​```

**Resultado:** [o que a IA entregou, em 2–4 linhas: arquivos, decisões, testes].
**Próximo passo:** [a opção escolhida].
```

---

## Roteiro previsto de prompts (mapa do caminho)

> **Guia, não trilho.** A ordem pode mudar conforme suas escolhas; vale sempre
> "um objetivo por prompt, com testes junto". Cada item traz **objetivo**,
> **texto pronto para colar** e **o que entrega**. Todo prompt que mexe em código
> fecha **rodando a suíte (unitários + E2E) e reportando o placar**; depois do
> passo 2.5, também **`npm run lint` + `npm run format`**. Prompts de tela, além
> disso, **geram screenshot**.

### Prompt 1 — Fundamentação (conceito central)
**[Objetivo]** Documentar, com fontes e links, de onde vem a classificação das
sentenças e o sistema recursal — **antes de qualquer código** — e registrar os
termos no glossário.
```
Pesquise e consolide a fundamentação do app: as espécies de sentença no CPC
(terminativa, art. 485, x definitiva, art. 487; conceito de sentença no art. 203),
a classificação pela carga de eficácia (declaratória/constitutiva/condenatória —
classificação ternária de Liebman; cite a quinária como nota) e o sistema
recursal / fases recursais (apelação, RESp/STJ, RE/STF, embargos, trânsito em
julgado). Registre cada termo no GLOSSARIO.md em linguagem simples, com a fonte
linkada. Ainda sem código.
```
**[Entrega]** Fundamentação confirmada no `CLAUDE.md` + `GLOSSARIO.md` com os
termos (sentença, terminativa/definitiva, carga eficacial, fases recursais,
trânsito em julgado, função pura).

### Prompt 2 — Núcleo da lógica (funções puras) + testes
**[Objetivo]** Criar `logica.js` com as regras de classificação e priorização
como funções puras.
```
Crie logica.js com funções puras: classificarEspecie(resolveuMerito,
cargaEficacia, orgaoJulgador) devolvendo terminativa/definitiva + o tipo pela
carga + a espécie por órgão (simples/plúrima/complexa); pontuarPrioridade(
valorEmRisco, resultado, diasParaPrazo); e validarDecisao(...). Escreva
logica.test.js no Jest com casos positivos e negativos (ex.: decisão sem
identificador é rejeitada; sem mérito nunca vira definitiva). Sem tela ainda.
```
**[Entrega]** `logica.js` + `logica.test.js` (Jest) verdes; `package.json` com
`npm test`.

### Prompt 2.5 — Ferramental de qualidade de código
**[Objetivo]** ESLint + Prettier + Husky (pre-commit) valendo desde cedo.
```
Configure o ferramental de qualidade: scripts "lint" (ESLint sobre os .js),
"format" (Prettier --write) e "prepare" (Husky) no package.json; hook de
pre-commit rodando lint + format em qualquer branch; e os arquivos .gitignore,
.eslintignore e .prettierignore (ignorando node_modules, test-results,
playwright-report, .DS_Store). Ao final, rode lint e format e confirme a suíte
verde.
```
**[Entrega]** Scripts + hook + arquivos de exclusão; suíte verde e código no
padrão.

### Prompt 3 — Primeira tela + design tokens + rodapé de contraste
**[Objetivo]** `index.html` com o formulário de nova decisão, design tokens e
rodapé de contraste WCAG AA ao vivo.
> **Antes de definir as cores, a IA PERGUNTA ao usuário qual marca/sistema usar
> como inspiração visual** (ver `CLAUDE.md`). A referência escolhida é declarada
> no código e ajustada, se preciso, para passar no contraste AA.
```
Antes de criar a tela, me pergunte qual marca usar como inspiração visual.
Depois crie index.html com o formulário de nova decisão (identificador, órgão,
resolveu mérito?, carga, resultado, valor em risco, prazo), design tokens em CSS
derivados dessa marca (declare qual), a prévia da espécie classificada e um
rodapé que calcula contraste ao vivo (luminancia/razaoContraste/nivelWcag).
Inclua o teste de espaçamento (validarEspacamento). Screenshot ao final.
```
**[Entrega]** Primeira tela estilizada com a marca escolhida + tokens CSS +
prévia da espécie + rodapé de contraste + teste de espaçamento + screenshot.

### Prompt 4 — Persistência no localStorage
**[Objetivo]** Salvar e recarregar as decisões no navegador.
```
Faça as decisões serem salvas no localStorage e recarregadas ao abrir o app.
Testes: (positivo) decisão persiste após recarregar; (negativo) dado corrompido
não quebra o app.
```
**[Entrega]** Camada de persistência + testes; dados sobrevivem ao refresh.

### Prompt 5 — Lista organizada por fase recursal
**[Objetivo]** Exibir as decisões agrupadas por fase, ordenadas por prioridade,
com contador por grupo.
```
Mostre as decisões agrupadas por fase recursal (1º grau, Apelação, Instância
superior, Transitado em julgado), ordenadas pela prioridade de atuação, com
contador por grupo. Testes da ordenação e do agrupamento.
```
**[Entrega]** Lista agrupada/ordenada + indicadores + testes.

### Prompt 6 — Ciclo de fases recursais (avança / volta um passo)
**[Objetivo]** Mover a decisão por **1º grau → Apelação → Instância superior →
Transitado em julgado** e voltar um passo.
```
Implemente o ciclo de fases recursais avançando e voltando um passo (sem beco sem
saída). Transitar em julgado carimba a data; reabrir/voltar limpa. Testes
positivos e negativos das transições (não avança além do trânsito; não volta
antes do 1º grau).
```
**[Entrega]** Botões de fase + carimbo de trânsito em julgado + testes de
transição.

### Prompt 7 — Painel do contencioso (dashboard)
**[Objetivo]** Cartões com os números-chave, em grid/flex responsivo sem quebra.
```
Crie o "Painel do contencioso" com cartões: total de decisões, quantas com prazo
recursal correndo (atenção), quantas transitadas em julgado, exposição financeira
total e o destaque "aja por esta primeiro". Grid/flex responsivo (flex-wrap/
auto-fit) que não estoura em nenhuma largura. Screenshot ao final.
```
**[Entrega]** Dashboard responsivo + testes dos números + screenshot.

### Prompt 8 — Filtros/preferências persistidos
**[Objetivo]** Filtrar por fase/espécie/resultado e ordenar, com a escolha
persistida.
```
Adicione filtros por fase, por espécie e por resultado e uma ordenação,
persistindo a escolha no localStorage (segue aplicada ao voltar). Testes de
filtro e de persistência da preferência.
```
**[Entrega]** Filtros persistentes + testes.

### Prompt 9 — Ações destrutivas com confirmação + "Reiniciar experiência"
**[Objetivo]** Excluir decisão e reiniciar tudo, sempre com confirmação.
```
Adicione excluir decisão e o botão "Reiniciar experiência" no header, ambos com
confirmação. Testes: (positivo) confirma e apaga; (negativo) cancela e mantém.
```
**[Entrega]** Exclusão/reset confirmados + testes.

### Prompt 10 — Exportar / limpar dados (LGPD)
**[Objetivo]** O usuário leva ou apaga os próprios dados (todos fictícios).
```
Permita exportar as decisões (arquivo .json) e limpar todos os dados. Use dados
fictícios nos exemplos (nada de processo/partes reais). Testes de exportação e de
limpeza.
```
**[Entrega]** Exportar/limpar + testes; nota de LGPD.

### Prompt 11 — Acessibilidade WCAG AA + E2E (Playwright)
**[Objetivo]** Fechar teclado, foco, labels e contraste, com E2E cobrindo o
fluxo.
```
Revise acessibilidade (teclado, foco visível, labels ligados, alt), confirme
contraste AA em todas as cores e escreva os testes E2E (Playwright) do fluxo
principal: cadastrar decisão → classificar espécie → avançar de fase →
transitar em julgado.
```
**[Entrega]** Ajustes de acessibilidade + suíte E2E verde.

### Prompt 12 — Entregas finais (README + slides)
**[Objetivo]** Fechar o projeto com documentação e apresentação.
```
Gere o README.md (visão, como rodar, como testar, arquitetura, decisões, passo a
passo para subir o repositório) e os slides da história do projeto, alimentados
por PROMPTS.md e RESUMAO.md. A capa apresenta o tema e a inspiração visual.
```
**[Entrega]** `README.md` + slides finais.

### Prompt 13 — Plan Test (planejar os próximos testes)
**[Objetivo]** Planejar, em português, os próximos testes (unitários/interface)
antes de escrever código, nomeando `(positivo)`/`(negativo)`.
```
Monte um PLANO-DE-TESTES.md: aprofundar a cobertura do que já existe (lacunas de
unitário e E2E) e esboçar os testes das próximas features candidatas. Cada teste
nomeia (positivo) ou (negativo). Nada de código ainda.
```
**[Entrega]** `PLANO-DE-TESTES.md` com as próximas frentes de teste.

## Status do roteiro

- [x] **Prompt 0** — setup do `CLAUDE.md` + este roteiro (+ `GLOSSARIO.md`/`RESUMAO.md` semente).
- [x] **Prompt 1** — fundamentação + glossário (Etapa 1 no `GLOSSARIO.md`, com fontes linkadas). Sem código.
- [x] **Prompt 2** — núcleo da lógica em funções puras + testes (**26 verdes**).
- [x] **Prompt 2.5** — ferramental de qualidade (ESLint + Prettier + Husky); lint limpo, format aplicado, 26 verdes.
- [x] **Prompt 3** — primeira tela (inspiração **Jusbrasil**) + design tokens + contraste + `validarEspacamento` (**37 verdes**; 360px sem quebra).
- [x] **Prompt 4** — persistência no localStorage (**42 verdes**; persistência e dado corrompido verificados no navegador).
- [x] **Prompt 5** — lista organizada por fase recursal (**49 verdes**; agrupamento/ordenação verificados no navegador).
- [x] **Prompt 6** — ciclo de fases recursais (avança/volta; carimbo de trânsito) (**61 verdes**; ciclo verificado no navegador).
- [x] **Prompt 7** — Painel do contencioso (dashboard) responsivo (**61 verdes**; números verificados no navegador).
- [x] **Prompt 8** — filtros por fase/espécie/resultado, persistidos (**70 verdes**; persistência verificada no navegador).
- [x] **Prompt 9** — excluir + reiniciar, ambos com confirmação (**70 verdes**; ambos os caminhos verificados no navegador).
- [x] **Prompt 10** — exportar (.json) + limpar dados (LGPD) (**77 verdes**; export verificado no navegador).
- [x] **Prompt 11** — acessibilidade WCAG AA + E2E Playwright (**77 unitários + 5 E2E** verdes).
- [x] **Prompt 12** — entregas finais: `README.md` + `slides.html`. 🎉 **Projeto concluído.**
- [x] **Prompt 13** — Plan Test (`PLANO-DE-TESTES.md`).
