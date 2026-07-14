# Plano de testes — próximos passos (Funil)

> **Passo 13 do roteiro ("Plan Test").** Planeja, em português, os testes das
> próximas etapas **antes** de escrever o código — fiel ao "testes junto". Cada
> teste nomeia `(positivo)` (o que deve funcionar) ou `(negativo)` (o que deve ser
> bloqueado/dar erro). Unitários no **Jest** (`logica.test.js`), interface no
> **Playwright** (`e2e/app.spec.js`, elementos por `data-testid`). Todo passo fecha
> com `npm run lint`, `npm run format` e a suíte verde (o pre-commit do Husky
> repete lint + format + testes).

**Estado atual:** 49 unitários (Jest) + 19 E2E (Playwright) = 68 verdes.
**Pendentes:** Prompt 7 (dashboard), 8 (filtros/ordenação), 9 (reiniciar/excluir).

---

## Prompt 7 — Painel "Visão do funil" (dashboard)

**Objetivo:** cartões com total de negócios, **valor total** no funil, **valor
ponderado previsto**, **taxa de conversão** (ganhos ÷ fechados) e o **negócio em
destaque** (maior valor ponderado entre os abertos).

### Unitário (Jest) — nova função pura `resumoDoFunil(negocios)`

- `(positivo)` soma o **valor total** de todos os negócios.
- `(positivo)` soma o **valor ponderado** usando `valorPonderadoDoNegocio` (respeita desfecho Ganho/Perdido).
- `(positivo)` **taxa de conversão** = ganhos ÷ (ganhos + perdidos); ex.: 2 ganhos e 2 perdidos → 0,5.
- `(positivo)` **destaque** = negócio aberto de maior valor ponderado.
- `(negativo/borda)` lista **vazia** → total 0, ponderado 0, taxa 0 (sem divisão por zero), destaque `null`.
- `(negativo/borda)` só negócios **abertos** (nenhum fechado) → taxa de conversão 0 (ou "—"), sem quebrar.
- `(positivo)` **função pura**: não altera a lista recebida.

### Interface (Playwright)

- `(positivo)` painel aparece com os números batendo com os negócios semeados.
- `(positivo)` ao **fechar como Ganho**, taxa de conversão e valor ponderado **atualizam**.
- `(negativo→positivo)` o dashboard **não estoura em 360px** (`validarEspacamento` sobre os cartões; grid `auto-fit`).
- `(positivo)` rodapé de contraste continua **sem par "Reprovado"** com o painel na tela.

---

## Prompt 8 — Filtros e ordenação persistidos

**Objetivo:** filtrar por **etapa** e por **status** (aberto/ganho/perdido) e
escolher a **ordenação**; a escolha é **persistida** no localStorage e volta
aplicada.

### Unitário (Jest) — `filtrarNegocios(negocios, filtros)` + `serializarPreferencias`/`lerPreferencias`

- `(positivo)` filtra por etapa (só "proposta" volta os de proposta).
- `(positivo)` filtra por status (só ganhos / só perdidos / só abertos).
- `(positivo)` combina etapa + status (interseção).
- `(positivo)` sem filtro (tudo) devolve a lista inteira; **não muta** a original.
- `(negativo/borda)` filtro que não casa com nada → lista vazia (sem erro).
- `(positivo)` `serializarPreferencias`/`lerPreferencias` guardam e releem a escolha.
- `(negativo)` preferência **corrompida** no localStorage cai no padrão (leitura blindada, como `desserializarNegocios`).

### Interface (Playwright)

- `(positivo)` aplicar um filtro reduz a lista visível ao esperado.
- `(positivo)` **recarregar a página mantém** o filtro/ordenação (persistência).
- `(positivo)` "limpar filtros" volta a mostrar tudo.

---

## Prompt 9 — Ações destrutivas com confirmação + "Reiniciar experiência"

**Objetivo:** **excluir** um negócio e **reiniciar** tudo, ambos **só com
confirmação**.

### Unitário (Jest) — `removerNegocio(negocios, id)`

- `(positivo)` remove o negócio do id informado e mantém os demais.
- `(positivo)` **função pura**: devolve nova lista, não altera a original.
- `(negativo/borda)` id inexistente → lista inalterada (sem erro).

### Interface (Playwright)

- `(positivo)` excluir **confirmando** remove o negócio da tela e do localStorage.
- `(negativo)` excluir **cancelando** mantém o negócio.
- `(positivo)` "Reiniciar experiência" **confirmando** zera a lista; **cancelando** mantém.

---

## Regressão e acessibilidade (a cada um dos passos acima)

- Rodar **toda a suíte** (Jest + Playwright) e reportar o placar; nada de teste vermelho.
- `npm run lint` limpo e `npm run format` aplicado antes de encerrar.
- Screenshot revisado (dashboard e filtros são telas) — layout sem quebra de 360px ao desktop.
- Nenhum par de cores "Reprovado" no rodapé de contraste ao vivo.
