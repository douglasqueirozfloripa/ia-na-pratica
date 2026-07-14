# Plano de testes — próximos passos (Prioriza)

> **Passo 13 do roteiro ("Plan Test").** Planeja, em português, os testes das
> próximas etapas **antes** de escrever o código. Cada teste nomeia `(positivo)`
> (o que deve funcionar) ou `(negativo)` (o que deve ser bloqueado/dar erro).
> Unitários no **Jest** (`logica.test.js`), interface no **Playwright**
> (`e2e/app.spec.js`, elementos por `data-testid`). Todo passo fecha com
> `npm run lint`, `npm run format` e a suíte verde (o pre-commit do Husky repete
> lint + format + testes).

**Estado atual:** projeto **concluído** — 82 unitários (Jest) + 4 E2E (Playwright)
verdes. As funções de negócio já existem (`calcularResumo`, `filtrarTarefas`,
`lerPreferencias`, `removerTarefa`, `montarExportacao`, `avancarStatus`/
`voltarStatus`, `classificarQuadrante`, `pontuarPrioridade`…). Por isso este plano
tem duas frentes: **(A) aprofundar a cobertura** do que já existe e **(B) próximas
features candidatas** (sugestões), cada uma com o esboço dos testes.

---

## A) Aprofundar a cobertura do que já existe

Os 4 E2E cobrem: criar→priorizar→concluir, persistência de filtro, título vazio
bloqueado e auditoria de contraste. Lacunas a fechar:

### Interface (Playwright) — fluxos críticos ainda sem E2E

- `(positivo)` **ciclo de status voltando um passo** (`voltarStatus`): a fazer → fazendo → concluída e **volta**; reabrir **limpa a data de conclusão**.
- `(positivo)` **excluir tarefa confirmando** remove da tela e do localStorage; `(negativo)` **cancelando** mantém.
- `(positivo)` **"Reiniciar experiência" confirmando** zera tudo; `(negativo)` **cancelando** mantém.
- `(positivo)` **exportar (.json)** dispara o download / monta a exportação com os dados atuais.
- `(positivo)` **fluxo só com teclado**: criar uma tarefa navegando por Tab/Enter.
- `(positivo→negativo)` **painel "Foco do dia"**: os números batem com as tarefas; **não estoura em 360px** (`validarEspacamento` sobre os cartões).

### Unitário (Jest) — casos de borda das funções existentes

- `calcularResumo` `(negativo/borda)` lista **vazia** → todos os contadores 0, sem quebrar.
- `ehConcluidaHoje` `(positivo)` na **virada do dia** (data injetada de fora): conclusão de ontem **não** conta como hoje.
- `pontuarPrioridade` `(positivo)` **empate** de urgência×importância mantém ordem estável em `ordenarPorPrioridade`.
- `filtrarTarefas` `(positivo)` **combinação** quadrante + status; `(negativo/borda)` filtro sem correspondência → vazio.
- `lerPreferencias` `(negativo)` preferência **corrompida** no localStorage cai no padrão (leitura blindada).

---

## B) Próximas features candidatas (sugestões, com esboço de testes)

> Ideias naturais de evolução — cada uma entra como um novo prompt, com os testes
> junto. Escolher com o usuário antes de implementar.

### B1 — Prazo (data-limite) e destaque de atrasadas

- Unitário: nova função pura `estaAtrasada(tarefa, agora)` (data injetada de fora, como no ciclo de status).
  - `(positivo)` tarefa com prazo vencido e não concluída → atrasada.
  - `(negativo)` sem prazo, ou concluída, ou prazo futuro → não atrasada.
  - `(borda)` prazo == agora → regra explícita (não atrasada).
- Interface: `(positivo)` tarefa atrasada ganha destaque visível; contraste do destaque **≥ AA**.

### B2 — Editar tarefa (título / urgência / importância)

- Unitário: reaproveita `validarTarefa` e `classificarQuadrante`.
  - `(positivo)` mudar urgência/importância **recalcula o quadrante** (função pura, nunca digitado).
  - `(negativo)` edição que zera o título é rejeitada (mesma regra da criação).
- Interface: `(positivo)` editar e ver a tarefa **mudar de quadrante** na lista.

### B3 — Busca por texto no título

- Unitário: estender `filtrarTarefas` (ou `buscarTarefas(tarefas, termo)`).
  - `(positivo)` casa sem diferenciar acento/maiúscula; `(negativo/borda)` termo vazio devolve tudo.
- Interface: `(positivo)` digitar filtra a lista ao vivo.

### B4 — Importar dados (.json) — contraparte do exportar (LGPD)

- Unitário: `lerImportacao(json)` (blindada, como `lerTarefasDe`).
  - `(positivo)` reimporta um arquivo gerado por `montarExportacao`.
  - `(negativo)` JSON inválido/estrutura errada é **rejeitado** sem quebrar o app.
- Interface: `(positivo)` importar arquivo repõe as tarefas; `(negativo)` arquivo inválido mostra erro amigável.

---

## Regressão e acessibilidade (a cada passo)

- Rodar **toda a suíte** (Jest + Playwright) e reportar o placar; nada vermelho.
- `npm run lint` limpo e `npm run format` aplicado antes de encerrar.
- Telas novas: screenshot revisado (360px ao desktop, sem quebra) e nenhum par
  "Reprovado" no rodapé de contraste ao vivo.
