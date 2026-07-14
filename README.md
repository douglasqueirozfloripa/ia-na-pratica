# IA na Prática

Material do experimento **IA na Prática**: como construir aplicativos reais
_com_ IA — em **passos pequenos**, cada um com **testes dos dois lados**
(positivo e negativo), **clean code comentado**, **acessibilidade WCAG AA**,
**qualidade de código automatizada** (lint + formatação + hook de commit) e o
caminho todo **documentado**.

Este repositório reúne **um modelo de partida** e **dois experimentos** que
nasceram desse modelo.

## Estrutura

| Pasta | O que é |
|---|---|
| [`template-project/`](template-project/) | **O modelo "estado zero"** — o ponto de partida e o **contexto** que guia a criação de qualquer projeto novo. |
| [`funil-de-vendas/`](funil-de-vendas/) | **Experimento 1** — gestor de oportunidades de venda (funil AIDA + BANT). Inspiração visual: **Jira**. |
| [`organizador-tarefas-prioridades/`](organizador-tarefas-prioridades/) | **Experimento 2** — organizador que prioriza tarefas (Matriz de Eisenhower). Inspiração visual: **Jenkins**. |

## `template-project/` — o modelo (comece por aqui)

É a **semente** do método. Não é um app: é o conjunto de instruções e diários que
a IA preenche ao criar um projeto novo. Contém:

- **`instrucoes-do-projeto-template.md`** — as **regras que a IA segue em toda
  resposta**: fundamentação com fontes, stack, testes junto, acessibilidade WCAG
  AA, qualidade de código (ESLint + Prettier + Husky), `.gitignore`, e a
  definição de "pronto" (visual e de testes).
- **`prompts-estado-template.md`** — o **roteiro de prompts** (Prompt 0 → N) com
  a ordem lógica das etapas, incluindo o **passo 2.5 de ferramental de qualidade**
  e o passo a passo para **subir o repositório**.
- **`glossario-template.md`** e **`resumao-estado-template.md`** — as sementes do
  **glossário** (vocabulário em linguagem simples) e do **resumão** (o "memorial"
  que alimenta README e slides).
- **`slides-template.html`** — modelo de **slides** já com o layout preferido
  (texto à esquerda, deck escuro) e **tokens de cor parametrizados** pela
  inspiração visual escolhida.

> Todo projeto novo do experimento parte deste modelo — por isso os dois apps
> abaixo compartilham a mesma espinha (mesma stack, mesmas regras, mesmo jeito de
> abrir os slides apresentando **Tema + Inspiração**).

## Os dois experimentos

Ambos são apps **HTML + CSS + JavaScript puros** (sem build), com dados no
`localStorage`, testados com **Jest** (unitário) e **Playwright** (E2E), e com o
mesmo ferramental de qualidade. Cada um tem o próprio `README.md` com **como
rodar, como testar e o passo a passo para subir o repositório**:

- **[Funil de Vendas](funil-de-vendas/README.md)** — mostra em que etapa do funil
  cada negócio está e **qual focar primeiro**, por valor ponderado.
- **[Prioriza](organizador-tarefas-prioridades/README.md)** — cruza **urgência ×
  importância** e responde **"comece por esta"**.

Cada projeto guarda a história completa, prompt a prompt, em `PROMPTS.md` e
`RESUMAO.md`, o vocabulário em `GLOSSARIO.md` e a apresentação em `slides.html`.

## Qualidade de código (nos dois experimentos)

Três scripts no `package.json` de cada projeto:

```bash
npm run lint      # ESLint: erros e maus hábitos no JavaScript
npm run format    # Prettier: formata num padrão único
npm run prepare   # ativa o Husky (roda sozinho no npm install)
```

O **Husky** roda `lint` + `format` (e os testes) no **pre-commit**, em qualquer
branch — nada fora do padrão entra no histórico. HTML e Markdown ficam fora do
Prettier (são formatados à mão para preservar layout dos slides e dos diários).
