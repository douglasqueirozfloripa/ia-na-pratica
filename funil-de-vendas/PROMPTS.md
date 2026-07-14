# Prompts do projeto — Funil de Venda

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
Tema: Funil de venda. Com base no instrucoes-do-projeto-estado-zero.md, preencha
o arquivo de instruções para este tema (o que é o app, fundamentação com fontes,
stack, regras de negócio, regras automáticas) e monte o roteiro de prompts no
PROMPTS.md.
```

**Resultado:** criados `CLAUDE.md` (instruções do tema, com a fundamentação
pesquisada — modelo AIDA/Elias St. Elmo Lewis, BANT/IBM, pipeline ponderado — e
links), `PROMPTS.md` (este roteiro), `GLOSSARIO.md` e `RESUMAO.md` (sementes).
Nenhum código ainda. App entendido: **Funil**, gestor de oportunidades que mostra
em que etapa do funil cada negócio está e ordena o foco por **valor ponderado**
(valor × probabilidade da etapa).
**Próximo passo:** executar o **Prompt 1** (fundamentação + glossário).

## Prompt 1 — Fundamentação (conceito central) ✅ executado

```
Pesquise e consolide a fundamentação do app: modelo AIDA (origem do funil),
qualificação BANT e valor ponderado do pipeline (taxa de conversão). Registre
cada termo no GLOSSARIO.md em linguagem simples, com a fonte linkada. Ainda sem
código.
```

**Resultado:** `GLOSSARIO.md` recebeu a "Etapa 1 — Fundamentação" com 10 termos
(funil de vendas, modelo AIDA, etapa, Lead, qualificação BANT, probabilidade de
fechamento, taxa de conversão, valor ponderado, ganho/perdido, função pura) —
cada um em linguagem simples, com analogia, o porquê no app e a fonte linkada
(AIDA/Elias St. Elmo Lewis, BANT/IBM, pipeline ponderado). Confirmada a
fundamentação do `CLAUDE.md`. **Nenhum código ainda.**
**Próximo passo:** Prompt 2 — núcleo da lógica em funções puras + testes (Jest).

## Prompt 2 — Núcleo da lógica (funções puras) + testes ✅ executado

```
Crie logica.js com funções puras: probabilidadeDaEtapa(etapa),
pontuarQualificacao(bant), valorPonderado(valor, etapa, bant) e
validarNegocio(...). Escreva logica.test.js no Jest com casos positivos e
negativos (ex.: negócio com valor zero ou negativo é rejeitado). Sem tela ainda.
```

**Resultado:** criados `logica.js` (regras em funções puras: `probabilidadeDaEtapa`,
`pontuarQualificacao`, `probabilidadeDeFechamento`, `valorPonderado`,
`validarNegocio`), `logica.test.js` e `package.json` (`npm test`). Régua de
chances Lead 10% → … → Fechado 100%, com +5% por critério BANT. **16 testes
(positivos e negativos) passando.**
**Próximo passo:** Prompt 3 — primeira tela + design tokens + rodapé de contraste.

## Prompt 3 — Primeira tela + design tokens + rodapé de contraste ✅ executado

```
Crie index.html com o formulário de novo negócio (nome/contato, valor, etapa,
qualificação BANT), design tokens em CSS derivados de uma referência visual real
(declare qual) e um rodapé que calcula contraste (luminancia/razaoContraste/
nivelWcag) mostrando o nível WCAG ao vivo. Gere um screenshot ao final.
```

**Resultado:** criado `index.html` (header com "Reiniciar experiência",
formulário, prévia ao vivo de probabilidade/valor ponderado e rodapé de contraste
WCAG). Inspiração visual declarada: **Pipedrive** (verde). Funções puras de
contraste adicionadas ao `logica.js` (agora também usável no navegador via
`window.Logica`). Screenshot em `screenshots/prompt3-primeira-tela.png`. Inclui
**teste de espaçamento** (`validarEspacamento`, folga > 0,5px) que pegou e levou à
correção de uma quebra (botão colado na fileira BANT). Placar: **28 unitários +
7 E2E = 35 testes passando**; paleta toda AA/AAA.
**Próximo passo:** Prompt 4 — persistência no localStorage.

## Prompt 4 — Persistência no localStorage ✅ executado

```
Faça os negócios serem salvos no localStorage e recarregados ao abrir o app.
Testes: (positivo) negócio persiste após recarregar; (negativo) dado corrompido
não quebra o app.
```

**Resultado:** negócios salvam e recarregam do `localStorage`; contador visível de
negócios salvos. Funções puras `serializarNegocios`/`desserializarNegocios`
(leitura blindada contra dado corrompido) no `logica.js`. **Placar: 33 unitários +
9 E2E = 42 passando.** A regra "regressão em todo prompt" pegou um E2E antigo
(texto de sucesso mudou) — corrigido antes de encerrar.
**Próximo passo:** Prompt 5 — lista organizada por etapa do funil.

## Prompt 5 — Lista organizada por etapa do funil ✅ executado

```
Mostre os negócios agrupados por etapa do funil (Lead, Qualificação, Proposta,
Negociação, Fechado), ordenados por valor ponderado, com contador e soma de valor
por grupo. Testes da ordenação e do agrupamento.
```

**Resultado:** nova seção "Negócios por etapa do funil" com grupos na ordem
oficial, cabeçalho "contador · soma de valor" e itens ordenados por valor
ponderado. Funções puras `ordenarPorValorPonderado` e `agruparPorEtapa`; nome
escapado contra injeção. Screenshot em `screenshots/prompt5-lista-por-etapa.png`.
**Placar: 37 unitários + 10 E2E = 47 passando.**
**Próximo passo:** Prompt 6 — ciclo de etapas (avançar/voltar) + desfecho.

## Prompt 6 — Ciclo de etapas (avança / volta um passo) ✅ executado

```
Implemente o ciclo de etapas Lead → Qualificação → Proposta → Negociação →
Fechado, avançando e voltando um passo (sem beco sem saída). Fechar pede o
desfecho (Ganho/Perdido) e carimba a data; reabrir limpa. Testes positivos e
negativos das transições.
```

**Resultado:** botões de avançar/voltar por negócio (Lead não volta, Fechado não
avança); fechar exige desfecho e carimba data; reabrir limpa. Desfecho manda no
cálculo (Ganho 100% / Perdido 0%). Funções puras `avancarNegocio`/`voltarNegocio`
etc. Screenshot em `screenshots/prompt6-ciclo-etapas.png`. **Placar: 46 unitários
+ 13 E2E = 59 passando.**
**Próximo passo:** Prompt 7 — painel "Visão do funil" (dashboard).

## Prompt 10 — Exportar / limpar dados (LGPD) ✅ executado

```
Permita exportar as tarefas (arquivo) e limpar todos os dados. Use dados
fictícios nos exemplos. Testes de exportação e de limpeza.
```

> Nota: por decisão do usuário, pulamos para este prompt tratando **7 (dashboard),
> 8 (filtros) e 9 (reiniciar/confirmar)** como features futuras.

**Resultado:** barra "Exportar (.json)" (baixa os negócios) e "Limpar tudo" (só
com confirmação), com nota de LGPD. Funções puras `montarExportacao`/`exportarJson`.
Screenshot em `screenshots/prompt10-exportar-limpar.png`. **Placar: 49 unitários +
16 E2E = 65 passando.**
**Próximo passo:** features futuras (7 dashboard, 8 filtros, 9 reiniciar, 11 a11y,
12 README/slides).

## Prompt 11 — Acessibilidade WCAG AA + E2E ✅ executado

```
Revise acessibilidade (teclado, foco visível, labels ligados, alt), confirme
contraste AA em todas as cores e escreva os testes E2E (Playwright) do fluxo
principal: criar negócio → avançar etapas → fechar como Ganho.
```

**Resultado:** consolidada a acessibilidade que já vinha desde o Prompt 3
(contraste AA/AAA, labels, foco); contador ganhou `aria-live`. Novos E2E: fluxo
completo (criar→avançar→fechar Ganho), criação só por teclado e auditoria de nomes
acessíveis/região nomeada. **Placar: 49 unitários + 19 E2E = 68 passando.**
**Próximo passo:** Prompt 12 (README + slides) ou features futuras (7, 8, 9).

## Prompt 12 — Entregas finais (README + slides) ✅ executado

```
Gere o README.md (visão, como rodar, como testar, arquitetura, decisões) e os
slides da história do projeto, alimentados por PROMPTS.md e RESUMAO.md.
```

**Resultado:** criados `README.md` (visão, fundamentação com fontes, como rodar/
testar, arquitetura, decisões, estado do roteiro) e `slides.html` (deck
autossuficiente de 10 slides, navegável por teclado/cliques). Suíte reexecutada
sem regressão: **49 unitários + 19 E2E = 68 passando**.
**Próximo passo:** essencial fechado; features futuras 7/8/9 quando o usuário quiser.

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
**[Objetivo]** Documentar, com fontes e links, de onde vem o funil de vendas —
modelo AIDA, qualificação BANT e pipeline ponderado — e registrar os termos no
glossário, **antes de qualquer código**.
```
Pesquise e consolide a fundamentação do app: modelo AIDA (origem do funil),
qualificação BANT e valor ponderado do pipeline (taxa de conversão). Registre
cada termo no GLOSSARIO.md em linguagem simples, com a fonte linkada. Ainda sem
código.
```
**[Entrega]** Seção de fundamentação confirmada no `CLAUDE.md` + `GLOSSARIO.md`
com os termos (funil/AIDA, etapas, Lead, qualificação BANT, probabilidade/taxa de
conversão, valor ponderado, função pura).

### Prompt 2 — Núcleo da lógica (funções puras) + testes
**[Objetivo]** Criar `logica.js` com as regras do funil como funções puras.
```
Crie logica.js com funções puras: probabilidadeDaEtapa(etapa),
pontuarQualificacao(bant), valorPonderado(valor, etapa, bant) e
validarNegocio(...). Escreva logica.test.js no Jest com casos positivos e
negativos (ex.: negócio com valor zero ou negativo é rejeitado). Sem tela ainda.
```
**[Entrega]** `logica.js` + `logica.test.js` (Jest) verdes; `package.json` com
`npm test`.

### Prompt 3 — Primeira tela + design tokens + rodapé de contraste
**[Objetivo]** `index.html` com formulário de novo negócio, design tokens
derivados da **inspiração visual** (declarar a marca de referência) e relatório
de contraste WCAG AA ao vivo.
```
Crie index.html com o formulário de novo negócio (nome/contato, valor, etapa,
qualificação BANT), design tokens em CSS derivados de uma referência visual real
(declare qual) e um rodapé que calcula contraste (luminancia/razaoContraste/
nivelWcag) mostrando o nível WCAG ao vivo. Gere um screenshot ao final e rode os
testes para confirmar que nada quebrou.
```
**[Entrega]** Primeira tela estilizada + tokens CSS + rodapé de contraste +
screenshot + **placar dos testes sem regressão**; teste E2E básico do formulário.

### Prompt 4 — Persistência no localStorage
**[Objetivo]** Salvar e recarregar os negócios no navegador.
```
Faça os negócios serem salvos no localStorage e recarregados ao abrir o app.
Testes: (positivo) negócio persiste após recarregar; (negativo) dado corrompido
não quebra o app.
```
**[Entrega]** Camada de persistência + testes; dados sobrevivem ao refresh +
**placar da suíte sem regressão** (mesmo sem tela nova).

### Prompt 5 — Lista organizada por etapa do funil
**[Objetivo]** Exibir os negócios agrupados pelas etapas do funil, com contador e
soma de valor por grupo.
```
Mostre os negócios agrupados por etapa do funil (Lead, Qualificação, Proposta,
Negociação, Fechado), ordenados por valor ponderado, com contador e soma de valor
por grupo. Testes da ordenação e do agrupamento.
```
**[Entrega]** Lista agrupada/ordenada + indicadores por etapa + testes.

### Prompt 6 — Ciclo de etapas (avança / volta um passo)
**[Objetivo]** Mover o negócio por **Lead → Qualificação → Proposta → Negociação
→ Fechado** e voltar um passo.
```
Implemente o ciclo de etapas Lead → Qualificação → Proposta → Negociação →
Fechado, avançando e voltando um passo (sem beco sem saída). Fechar pede o
desfecho (Ganho/Perdido) e carimba a data; reabrir limpa. Testes positivos e
negativos das transições.
```
**[Entrega]** Botões de avanço/retorno + desfecho Ganho/Perdido + carimbo +
testes de transição.

### Prompt 7 — Painel "Visão do funil" (dashboard)
**[Objetivo]** Cartões com os números-chave, em grid/flex responsivo sem quebra.
```
Crie o painel "Visão do funil" com cartões: total de negócios, valor total no
funil, valor ponderado previsto, taxa de conversão (ganhos ÷ fechados) e o
destaque de atenção. Grid/flex responsivo (flex-wrap/auto-fit) que não estoura em
nenhuma largura. Screenshot ao final e rode os testes para confirmar que nada
quebrou.
```
**[Entrega]** Dashboard responsivo + testes dos números + screenshot + **placar
dos testes sem regressão**.

### Prompt 8 — Filtros/preferências persistidos
**[Objetivo]** Filtrar por etapa/status e ordenar, com a escolha persistida.
```
Adicione filtros por etapa e por status (aberto/ganho/perdido) e uma ordenação
(valor, probabilidade), persistindo a escolha no localStorage (segue aplicada ao
voltar). Testes de filtro e de persistência da preferência.
```
**[Entrega]** Filtros persistentes + testes.

### Prompt 9 — Ações destrutivas com confirmação + "Reiniciar experiência"
**[Objetivo]** Excluir negócio e reiniciar tudo, sempre com confirmação.
```
Adicione excluir negócio e o botão "Reiniciar experiência" no header, ambos com
confirmação. Testes: (positivo) confirma e apaga; (negativo) cancela e mantém.
```
**[Entrega]** Exclusão/reset confirmados + testes.

### Prompt 10 — Exportar / limpar dados (LGPD)
**[Objetivo]** O usuário leva ou apaga os próprios dados (contatos são sensíveis).
```
Permita exportar os negócios (arquivo) e limpar todos os dados. Use dados
fictícios de contato nos exemplos. Testes de exportação e de limpeza.
```
**[Entrega]** Exportar/limpar + testes; nota de LGPD.

### Prompt 11 — Acessibilidade WCAG AA + E2E (Playwright)
**[Objetivo]** Fechar teclado, foco, labels e contraste, com E2E cobrindo o fluxo.
```
Revise acessibilidade (teclado, foco visível, labels ligados, alt), confirme
contraste AA em todas as cores e escreva os testes E2E (Playwright) do fluxo
principal: criar negócio → avançar etapas → fechar como Ganho.
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
- [x] **Prompt 2** — núcleo da lógica (funções puras) + testes.
- [x] **Prompt 3** — primeira tela + design tokens + rodapé de contraste.
- [x] **Prompt 4** — persistência no localStorage.
- [x] **Prompt 5** — lista organizada por etapa do funil.
- [x] **Prompt 6** — ciclo de etapas (avança/volta) + desfecho.
- [x] **Prompt 10** — exportar / limpar dados (LGPD).
- [x] **Prompt 11** — acessibilidade WCAG AA + E2E ampliado.
- [x] **Prompt 12** — entregas finais (README + slides).
- [ ] **Features futuras:** Prompt 7 (dashboard), 8 (filtros), 9 (reiniciar/confirmar).
- [ ] Entregas finais: **README.md** e **slides**.
