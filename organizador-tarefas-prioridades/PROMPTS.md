# Prompts do projeto — Organizador de Tarefas e Prioridades

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
Tema: Organizador de tarefas e Prioridades. Com base no
instrucoes-do-projeto-estado-zero.md, preencha o arquivo de instruções para
este tema (o que é o app, fundamentação com fontes, stack, regras de negócio,
regras automáticas) e monte o roteiro de prompts no PROMPTS.md.
```

**Resultado:** criados `CLAUDE.md` (instruções do tema, com a fundamentação
pesquisada — Eisenhower/Covey, GTD de David Allen, MoSCoW de Dai Clegg — e
links), `PROMPTS.md` (este roteiro), `GLOSSARIO.md` e `RESUMAO.md` (sementes).
Nenhum código ainda. Regra reforçada: **a inspiração visual (marca) será
PERGUNTADA ao usuário no Prompt 3**, não escolhida pela IA. App entendido:
**Prioriza**, organizador que ordena o que fazer agora por urgência ×
importância (Matriz de Eisenhower).
**Próximo passo:** executar o **Prompt 1** (fundamentação + glossário).

## Prompt 1 — Fundamentação (conceito central) ✅ executado

```
Pesquise e consolide a fundamentação do app: Matriz de Eisenhower
(urgente × importante), GTD (captura) e MoSCoW. Registre cada termo no
GLOSSARIO.md em linguagem simples, com a fonte linkada. Ainda sem código.
```

**Resultado:** `GLOSSARIO.md` recebeu a "Etapa 1 — Fundamentação" com os termos
priorizar, urgente × importante, Matriz de Eisenhower, os quatro quadrantes
(Faça agora / Agende / Delegue / Elimine), GTD, MoSCoW e função pura — cada um em
linguagem simples, com analogia, o porquê no app e a fonte linkada. **Nenhum
código ainda.**
**Próximo passo:** Prompt 2 — núcleo da lógica em funções puras + testes (Jest).

## Prompt 2 — Núcleo da lógica (funções puras) + testes ✅ executado

```
Crie logica.js com funções puras: classificarQuadrante(urgencia, importancia),
pontuarPrioridade(...) e validarTarefa(...). Escreva logica.test.js no Jest com
casos positivos e negativos (ex.: tarefa sem título é rejeitada). Sem tela ainda.
```

**Resultado:** criados `logica.js` (funções puras: `validarTarefa`,
`classificarQuadrante`, `pontuarPrioridade`, `decorarTarefa`, `ehNotaValida`) e
`logica.test.js`. `package.json` com `npm test`. Placar: **17 testes passando**
(positivos + negativos, incl. tarefa sem título rejeitada, notas fora de 1..5 e
pureza preservada). Nenhuma tela ainda.
**Próximo passo:** Prompt 3 — primeira tela; **começa perguntando a marca de
inspiração visual**, depois design tokens + rodapé de contraste.

## Prompt 3 — Primeira tela + design tokens + rodapé de contraste ✅ executado

```
Antes de criar a tela, me pergunte qual marca usar como inspiração visual.
Depois crie index.html com o formulário de nova tarefa, design tokens derivados
dessa marca e um rodapé que calcula contraste ao vivo. Screenshot ao final.
```

**Resultado:** a IA **perguntou a marca** → escolha do usuário: **Jenkins**.
Criados `index.html` (header com laço-gravata do mordomo, formulário com
`data-testid`, prévia do cálculo, rodapé de contraste) e `app.js`. Tokens
derivados da **paleta oficial do Jenkins** (Worn Navy `#335061`, Medium Carmine
`#D33834`, Bismark `#48728B`…); o carmim oficial passa AA (4.79:1), então foi
mantido. Funções puras de contraste (`luminancia`, `razaoContraste`, `nivelWcag`)
adicionadas ao `logica.js`. Screenshots: `prioriza-prompt3.png` e
`prioriza-prompt3-mobile.png` (360px sem quebra). Placar: **31 testes** (inclui
guarda que reprova qualquer token abaixo do AA).
**Próximo passo:** Prompt 4 — persistência no localStorage.

## Prompt 4 — Persistência no localStorage ✅ executado

```
Faça as tarefas serem salvas no localStorage e recarregadas ao abrir o app.
Testes: (positivo) tarefa persiste após recarregar; (negativo) dado corrompido
não quebra o app.
```

**Resultado:** funções puras de persistência no `logica.js` (`adicionarTarefa`,
`serializarTarefas`, `lerTarefasDe` — esta tolera dado corrompido e devolve `[]`).
Novo `repositorio.js` (acesso ao localStorage + id/data). `index.html` ganhou o
contador "Tarefas salvas: N" e `app.js` passou a salvar/recarregar. Verificado no
navegador: 2 tarefas sobrevivem ao reload (contador = 2, quadrantes/prioridades
corretos) e storage corrompido não gera erro (contador volta a 0). Screenshot:
`prioriza-prompt4.png`. Placar: **37 testes**.
**Próximo passo:** Prompt 5 — lista organizada por quadrante.

## Prompt 5 — Lista organizada por prioridade ✅ executado

```
Mostre as tarefas agrupadas por quadrante de Eisenhower (Faça agora, Agende,
Delegue, Elimine), ordenadas por prioridade, com contador por grupo. Testes da
ordenação e do agrupamento.
```

**Resultado:** funções puras `ordenarPorPrioridade` e `agruparPorQuadrante` no
`logica.js` (recalculam quadrante/nota — ignoram campo salvo adulterado). Nova
seção "Minhas tarefas" no `index.html` + render no `app.js`: 4 grupos na ordem
fixa, cada um com cor do quadrante, contador e cartões ordenados por prioridade.
Verificado no navegador com 6 tarefas: agrupamento e ordenação corretos (Agende
11 antes de 10; Delegue 9 antes de 8). Screenshot: `prioriza-prompt5.png`.
Placar: **44 testes**.
_Extra (a pedido do usuário):_ cross-check do contraste contra uma implementação
independente e a fórmula WCAG 2.1 (a mesma do Adobe Color Contrast Analyzer) —
deram idênticos. Valores de referência fixados em teste. Placar: **51 testes**.
**Próximo passo:** Prompt 6 — ciclo de status (a fazer → fazendo → concluída).

## Prompt 6 — Ciclo de status (avança / volta um passo) ✅ executado

```
Implemente o ciclo de status a fazer → fazendo → concluída, avançando e voltando
um passo (sem beco sem saída). Concluir carimba a data; reabrir limpa. Testes
positivos e negativos das transições.
```

**Resultado:** funções puras `avancarStatus`, `voltarStatus` (travam nas pontas)
e `definirStatus` (carimba/limpa a data, com o "agora" injetado) no `logica.js`.
Cartões da lista ganharam rótulo de status + botões Voltar/Avançar; concluída fica
riscada com a data. Verificado no navegador: avançar até concluir carimbou a data;
reabrir voltou para "fazendo" e limpou o carimbo; Avançar trava em "concluída".
Screenshot: `prioriza-prompt6.png`. Placar: **59 testes**.
**Próximo passo:** Prompt 7 — painel "Foco do dia" (dashboard).

## Prompt 7 — Painel "Foco do dia" (dashboard) ✅ executado

```
Crie o painel "Foco do dia" com cartões: total de tarefas, quantas em Faça agora,
concluídas hoje e o destaque de atenção. Grid/flex responsivo (flex-wrap/auto-fit)
que não estoura em nenhuma largura. Screenshot ao final.
```

**Resultado:** função pura `calcularResumo(lista, hojeISO)` no `logica.js` (total,
pendentes, fazAgora, concluidasHoje, atencao) + `ehConcluidaHoje`. Seção "Foco do
dia" no topo com 4 tiles em grid `auto-fit`. Verificado no navegador com 5 tarefas:
Total 5, Faça agora pendentes 1 (destaque), Concluídas hoje 1, "Comece por:
Corrigir build". Responsivo confirmado a 360px (empilha, sem quebra). Screenshots:
`prioriza-prompt7.png` e `prioriza-prompt7-mobile.png`. Placar: **65 testes**.
**Próximo passo:** Prompt 8 — filtros/preferências persistidos.

## Prompt 8 — Filtros/preferências persistidos ✅ executado

```
Adicione filtros por quadrante e por status e uma ordenação, persistindo a
escolha no localStorage (segue aplicada ao voltar). Testes de filtro e de
persistência da preferência.
```

**Resultado:** funções puras `filtrarTarefas`, `ordenarTarefas` e `lerPreferencias`
no `logica.js` (valor de filtro desconhecido é ignorado; preferência corrompida
volta ao padrão). `repositorio.js` ganhou `carregarPrefs`/`salvarPrefs` (gaveta
`prioriza:prefs`). Barra de filtros (Quadrante / Status / Ordenar por) na seção
"Minhas tarefas". Verificado no navegador: filtro por status mostrou só a tarefa
certa e, **após recarregar, o filtro voltou aplicado** (select e lista). Screenshot:
`prioriza-prompt8.png`. Placar: **77 testes**.
**Próximo passo:** Prompt 9 — ações destrutivas com confirmação + "Reiniciar experiência".

## Prompt 9 — Ações destrutivas com confirmação + "Reiniciar experiência" ✅ executado

```
Adicione excluir tarefa e o botão "Reiniciar experiência" no header, ambos com
confirmação. Testes: (positivo) confirma e apaga; (negativo) cancela e mantém.
```

**Resultado:** função pura `removerTarefa(lista, id)` no `logica.js`. Cada cartão
ganhou botão **Excluir** (contorno carmim); "Reiniciar experiência" passou a apagar
TODAS as tarefas e voltar os filtros ao padrão — ambos com `window.confirm`.
Verificado no navegador: excluir cancelado manteve (2→2), confirmado apagou
(2→1); reiniciar confirmado zerou tudo (tarefas `[]`, prefs padrão, painel 0).
Screenshot: `prioriza-prompt9.png`. Placar: **80 testes**.
**Próximo passo:** Prompt 10 — exportar / limpar dados (LGPD).

## Prompt 10 — Exportar / limpar dados (LGPD) ✅ executado

```
Permita exportar as tarefas (arquivo) e limpar todos os dados. Use dados
fictícios nos exemplos. Testes de exportação e de limpeza.
```

**Resultado:** função pura `montarExportacao(lista, agoraISO)` no `logica.js`.
Nova seção "Meus dados (LGPD)" com nota de privacidade (dados só no navegador) +
botões **Exportar (baixar .json)** e **Limpar meus dados** (com confirmação).
Verificado no navegador: o export gerou o JSON correto (app, total, tarefas,
data); limpar cancelado manteve (2), confirmado apagou (0). Screenshot:
`prioriza-prompt10.png`. Placar: **82 testes**.
**Próximo passo:** Prompt 11 — acessibilidade WCAG AA + E2E (Playwright).

## Prompt 11 — Acessibilidade WCAG AA + E2E (Playwright) ✅ executado

```
Revise acessibilidade (teclado, foco visível, labels ligados, alt), confirme
contraste AA em todas as cores e escreva os testes E2E (Playwright) do fluxo
principal: criar → priorizar → concluir.
```

**Resultado:** revisão de acessibilidade — `aria-label` com o título da tarefa nos
botões repetidos (Voltar/Avançar/Excluir), foco visível em campos/botões, labels
ligados por `for/id`, SVG do logo `aria-hidden`, regiões `aria-live`. Criados
`playwright.config.js` e `e2e/app.spec.js` (fluxo criar→priorizar→concluir,
persistência de filtro, validação negativa e contraste sem "Reprovado"). Placar:
**82 unitários (Jest) + 4 E2E (Playwright) = todos verdes**.
**Próximo passo:** Prompt 12 — entregas finais (README + slides).

## Prompt 12 — Entregas finais (README + slides) ✅ executado

```
Gere o README.md (visão, como rodar, como testar, arquitetura, decisões) e os
slides da história do projeto, alimentados por PROMPTS.md e RESUMAO.md.
```

**Resultado:** `README.md` completo (visão, conceito com fontes, como rodar, como
testar, arquitetura pura×externo, acessibilidade, inspiração Jenkins, LGPD,
estrutura de arquivos) e `SLIDES.html` — deck autocontido de 12 slides no tema
Jenkins (navegação por teclado), contando a história do Setup 0 ao app pronto.
Capa conferida por screenshot (`prioriza-slides-capa.png`). **Projeto concluído:
82 unitários + 4 E2E, WCAG AA.**

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
> **texto pronto para colar** e **o que entrega**.

### Prompt 1 — Fundamentação (conceito central)
**[Objetivo]** Documentar, com fontes e links, de onde vem a priorização —
Matriz de Eisenhower, GTD e MoSCoW — e registrar os termos no glossário, **antes
de qualquer código**.
```
Pesquise e consolide a fundamentação do app: Matriz de Eisenhower
(urgente × importante), GTD (captura) e MoSCoW. Registre cada termo no
GLOSSARIO.md em linguagem simples, com a fonte linkada. Ainda sem código.
```
**[Entrega]** Seção de fundamentação confirmada no `CLAUDE.md` + `GLOSSARIO.md`
com os termos (Eisenhower, quadrantes, urgente/importante, GTD, MoSCoW).

### Prompt 2 — Núcleo da lógica (funções puras) + testes
**[Objetivo]** Criar `logica.js` com as regras de priorização como funções puras.
```
Crie logica.js com funções puras: classificarQuadrante(urgencia, importancia),
pontuarPrioridade(...) e validarTarefa(...). Escreva logica.test.js no Jest com
casos positivos e negativos (ex.: tarefa sem título é rejeitada). Sem tela ainda.
```
**[Entrega]** `logica.js` + `logica.test.js` (Jest) verdes; `package.json` com
`npm test`.

### Prompt 3 — Primeira tela + design tokens + rodapé de contraste
**[Objetivo]** `index.html` com formulário de nova tarefa, design tokens e rodapé
de contraste WCAG AA ao vivo.
> **Antes de definir as cores, a IA PERGUNTA ao usuário qual marca/sistema usar
> como inspiração visual** (ver `CLAUDE.md`). A referência escolhida é declarada
> no código e ajustada, se preciso, para passar no contraste AA.
```
Antes de criar a tela, me pergunte qual marca usar como inspiração visual.
Depois crie index.html com o formulário de nova tarefa, design tokens em CSS
derivados dessa marca (declare qual) e um rodapé que calcula contraste ao vivo
(luminancia/razaoContraste/nivelWcag) mostrando o nível WCAG. Screenshot ao final.
```
**[Entrega]** Primeira tela estilizada com a marca escolhida + tokens CSS +
rodapé de contraste + screenshot.

### Prompt 4 — Persistência no localStorage
**[Objetivo]** Salvar e recarregar as tarefas no navegador.
```
Faça as tarefas serem salvas no localStorage e recarregadas ao abrir o app.
Testes: (positivo) tarefa persiste após recarregar; (negativo) dado corrompido
não quebra o app.
```
**[Entrega]** Camada de persistência + testes; dados sobrevivem ao refresh.

### Prompt 5 — Lista organizada por prioridade
**[Objetivo]** Exibir as tarefas agrupadas pelos quatro quadrantes, com contador
por grupo.
```
Mostre as tarefas agrupadas por quadrante de Eisenhower (Faça agora, Agende,
Delegue, Elimine), ordenadas por prioridade, com contador por grupo. Testes da
ordenação e do agrupamento.
```
**[Entrega]** Lista agrupada/ordenada + indicadores + testes.

### Prompt 6 — Ciclo de status (avança / volta um passo)
**[Objetivo]** Mover a tarefa por **a fazer → fazendo → concluída** e voltar um
passo.
```
Implemente o ciclo de status a fazer → fazendo → concluída, avançando e voltando
um passo (sem beco sem saída). Concluir carimba a data; reabrir limpa. Testes
positivos e negativos das transições.
```
**[Entrega]** Botões de status + carimbo de conclusão + testes de transição.

### Prompt 7 — Painel "Foco do dia" (dashboard)
**[Objetivo]** Cartões com os números-chave, em grid/flex responsivo sem quebra.
```
Crie o painel "Foco do dia" com cartões: total de tarefas, quantas em Faça agora,
concluídas hoje e o destaque de atenção. Grid/flex responsivo (flex-wrap/auto-fit)
que não estoura em nenhuma largura. Screenshot ao final.
```
**[Entrega]** Dashboard responsivo + testes dos números + screenshot.

### Prompt 8 — Filtros/preferências persistidos
**[Objetivo]** Filtrar por quadrante/status e ordenar, com a escolha persistida.
```
Adicione filtros por quadrante e por status e uma ordenação, persistindo a
escolha no localStorage (segue aplicada ao voltar). Testes de filtro e de
persistência da preferência.
```
**[Entrega]** Filtros persistentes + testes.

### Prompt 9 — Ações destrutivas com confirmação + "Reiniciar experiência"
**[Objetivo]** Excluir tarefa e reiniciar tudo, sempre com confirmação.
```
Adicione excluir tarefa e o botão "Reiniciar experiência" no header, ambos com
confirmação. Testes: (positivo) confirma e apaga; (negativo) cancela e mantém.
```
**[Entrega]** Exclusão/reset confirmados + testes.

### Prompt 10 — Exportar / limpar dados (LGPD)
**[Objetivo]** O usuário leva ou apaga os próprios dados.
```
Permita exportar as tarefas (arquivo) e limpar todos os dados. Use dados
fictícios nos exemplos. Testes de exportação e de limpeza.
```
**[Entrega]** Exportar/limpar + testes; nota de LGPD.

### Prompt 11 — Acessibilidade WCAG AA + E2E (Playwright)
**[Objetivo]** Fechar teclado, foco, labels e contraste, com E2E cobrindo o fluxo.
```
Revise acessibilidade (teclado, foco visível, labels ligados, alt), confirme
contraste AA em todas as cores e escreva os testes E2E (Playwright) do fluxo
principal: criar → priorizar → concluir.
```
**[Entrega]** Ajustes de acessibilidade + suíte E2E verde.

### Prompt 12 — Entregas finais (README + slides)
**[Objetivo]** Fechar o projeto com documentação e apresentação.
```
Gere o README.md (visão, como rodar, como testar, arquitetura, decisões) e os
slides da história do projeto, alimentados por PROMPTS.md e RESUMAO.md.
```
**[Entrega]** `README.md` + slides finais.

## Status do roteiro

- [x] **Prompt 0** — setup do `CLAUDE.md` + este roteiro.
- [x] **Prompt 1** — fundamentação + glossário.
- [x] **Prompt 2** — núcleo da lógica em funções puras + testes (17 verdes).
- [x] **Prompt 3** — primeira tela (inspiração Jenkins) + design tokens + contraste (31 verdes).
- [x] **Prompt 4** — persistência no localStorage (37 verdes; persistência e dado corrompido verificados no navegador).
- [x] **Prompt 5** — lista organizada por quadrante, ordenada por prioridade, com contador por grupo (44 verdes).
- [x] **Prompt 6** — ciclo de status (avança/volta, carimbo de conclusão) (59 verdes; ciclo verificado no navegador).
- [x] **Prompt 7** — painel "Foco do dia" (dashboard) responsivo (65 verdes; 360px sem quebra).
- [x] **Prompt 8** — filtros por quadrante/status + ordenação, persistidos (77 verdes; persistência verificada no navegador).
- [x] **Prompt 9** — excluir + reiniciar, ambos com confirmação (80 verdes; ambos os caminhos verificados no navegador).
- [x] **Prompt 10** — exportar (.json) + limpar dados (LGPD) (82 verdes; export e limpeza verificados no navegador).
- [x] **Prompt 11** — acessibilidade WCAG AA + E2E Playwright (82 unitários + 4 E2E verdes).
- [x] **Prompt 12** — entregas finais: `README.md` + `SLIDES.html`. 🎉 **Projeto concluído.**
- [x] Entregas finais: **README.md** e **SLIDES.html**.
