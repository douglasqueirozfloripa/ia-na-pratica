# Plano de testes — próximos passos (Instância)

> **Passo 13 do roteiro ("Plan Test").** Planeja, em português, os testes das
> próximas etapas **antes** de escrever o código. Cada teste nomeia `(positivo)`
> (o que deve funcionar) ou `(negativo)` (o que deve ser bloqueado/dar erro).
> Unitários no **Jest** (`logica.test.js`), interface no **Playwright**
> (`e2e/app.spec.js`, elementos por `data-testid`). Todo passo fecha com
> `npm run lint`, `npm run format` e a suíte verde.

**Estado atual:** projeto **concluído** — 146 unitários (Jest) + 13 E2E (Playwright)
verdes (inclui a leva de testes de componente por cenário de decisão e por
indicador do painel). As funções de negócio já existem (`validarDecisao`, `classificarEspecie`,
`pontuarPrioridade`, `ordenarPorPrioridade`, `agruparPorFase`, `avancarFase`/
`voltarFase`/`definirFase`, `calcularResumo`, `filtrarDecisoes`, `removerDecisao`,
`montarExportacao`, contraste, `validarEspacamento`…). Este plano tem duas frentes:
**(A) aprofundar a cobertura** do que já existe e **(B) próximas features
candidatas**, cada uma com o esboço dos testes.

---

## A) Aprofundar a cobertura do que já existe

### Interface (Playwright) — fluxos críticos ainda sem E2E

- `(positivo)` **voltar uma fase** (`voltarFase`): avançar até instância superior e
  **voltar** para apelação; voltar do transitado **limpa o carimbo**.
- `(positivo)` **filtro por espécie e por fase combinados** reduzem a lista ao vivo;
  `(negativo/borda)` combinação sem correspondência mostra "Nenhuma decisão
  corresponde aos filtros atuais.".
- `(positivo)` **exportar (.json)** dispara o download / monta a exportação com os
  dados atuais.
- `(positivo)` **"Limpar meus dados" confirmando** zera a lista; `(negativo)`
  **cancelando** mantém.
- `(positivo)` **"Reiniciar experiência"** apaga decisões **e** reseta os filtros.
- `(positivo→negativo)` **painel "Painel do contencioso"**: os números batem com as
  decisões; **não estoura em 360px** (`validarEspacamento` sobre os tiles).
- `(positivo)` **fluxo só com teclado**: cadastrar uma decisão navegando por Tab/Enter.

### Unitário (Jest) — casos de borda das funções existentes

- `calcularResumo` `(negativo/borda)` lista **vazia** → todos os contadores 0 e
  destaque null (já coberto); acrescentar **todas transitadas** → `exposicaoAtiva` 0
  e `destaque` null.
- `diasEntre` `(borda)` **virada do dia** e fuso: prazo de hoje → 0; ontem → -1.
- `pontuarPrioridade` `(positivo)` **empate** mantém ordem estável em
  `ordenarPorPrioridade` (reforçar com 3+ itens).
- `filtrarDecisoes` `(negativo/borda)` `prefs` **undefined** → devolve tudo (usa o
  padrão).
- `lerDecisoesDe`/`lerPreferencias` `(negativo)` dado **parcialmente** corrompido
  (array com itens válidos e inválidos misturados) → mantém só os válidos.
- `montarExportacao` `(positivo)` o pacote **reimporta** para a mesma lista (prepara
  a feature B4).

---

## B) Próximas features candidatas (sugestões, com esboço de testes)

> Ideias naturais de evolução — cada uma entra como um novo prompt, com os testes
> junto. Escolher com o usuário antes de implementar.

### B1 — Editar decisão (resultado / valores / carga)

- Unitário: reaproveita `validarDecisao` e `classificarEspecie`.
  - `(positivo)` mudar carga/mérito **recalcula a espécie** (função pura).
  - `(negativo)` edição que zera o número do processo é rejeitada.
- Interface: `(positivo)` editar e ver a decisão **mudar de espécie/prioridade** na lista.

### B2 — Alerta de prazo vencido / a vencer

- Unitário: nova função pura `situacaoPrazo(decisao, hoje)`.
  - `(positivo)` prazo vencido e ativa → "vencido"; a vencer em ≤ 3 dias → "urgente".
  - `(negativo)` transitada ou sem prazo → "sem prazo".
- Interface: `(positivo)` cartão com prazo vencido ganha destaque; contraste ≥ AA.

### B3 — Busca por número do processo / órgão

- Unitário: estender `filtrarDecisoes` (ou `buscarDecisoes(lista, termo)`).
  - `(positivo)` casa sem diferenciar acento/maiúscula; `(negativo/borda)` termo
    vazio devolve tudo.
- Interface: `(positivo)` digitar filtra a lista ao vivo.

### B4 — Importar dados (.json) — contraparte do exportar (LGPD)

- Unitário: `lerImportacao(json)` (blindada, como `lerDecisoesDe`).
  - `(positivo)` reimporta um arquivo gerado por `montarExportacao`.
  - `(negativo)` JSON inválido/estrutura errada é **rejeitado** sem quebrar o app.
- Interface: `(positivo)` importar arquivo repõe as decisões; `(negativo)` arquivo
  inválido mostra erro amigável.

### B5 — Formatar datas em UTC (carimbo do trânsito)

- Unitário: `(positivo)` uma data ISO à meia-noite UTC exibe o **mesmo dia** em
  qualquer fuso (hoje o carimbo pode exibir o dia anterior por causa do fuso local).

---

## Regressão e acessibilidade (a cada passo)

- Rodar **toda a suíte** (Jest + Playwright) e reportar o placar; nada vermelho.
- `npm run lint` limpo e `npm run format` aplicado antes de encerrar.
- Telas novas: screenshot revisado (360px ao desktop, sem quebra) e nenhum par
  "Reprovado" no rodapé de contraste ao vivo.
