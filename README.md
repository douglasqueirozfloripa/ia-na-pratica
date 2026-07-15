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
| [`.claude/skills/estado-zero/`](.claude/skills/estado-zero/SKILL.md) | **A skill que dá o pontapé** — automatiza o Setup 0 a partir do `template-project/`. |

## Skill `estado-zero` — como começar um projeto novo

Para o método não depender de a IA "lembrar" de ler o template, o gatilho de um
projeto novo virou uma **skill do Claude Code**:
[`.claude/skills/estado-zero/SKILL.md`](.claude/skills/estado-zero/SKILL.md).

**Como usar** — duas formas, ambas iniciam o mesmo **Setup 0**:

1. **Gatilho `Tema:`** — comece a mensagem com a palavra `Tema:` seguida do
   assunto do app. A skill dispara sozinha (a descrição dela reconhece o gatilho):

   ```
   Tema: um simulador de carteira de renda fixa de baixo risco baseado no CDI,
   cobrindo Tesouro, CDB, Letras, Fundos e poupança.
   ```

2. **Invocação explícita** — digite `/estado-zero` no Claude Code.

**O que a skill faz** (o ritual de abertura do experimento):

1. Lê o `template-project/` como fonte da verdade das regras.
2. Confirma com você o **conceito**, o **nome da pasta** e os **dados de exemplo**
   (fictícios — LGPD).
3. Cria a pasta do projeto e gera `CLAUDE.md`, `PROMPTS.md`, `GLOSSARIO.md` e
   `RESUMAO.md` já preenchidos para o tema.
4. Faz a **fundamentação** (Prompt 1): pesquisa referências reais **com links** —
   antes de qualquer código.
5. Monta o **roteiro previsto** (Prompt 1 → 13) no `PROMPTS.md`.
6. Confirma que seguirá as regras em toda resposta e propõe o próximo passo.

> A **inspiração visual** (marca/sistema de referência para a paleta) é definida
> junto da primeira tela — e a skill **pergunta qual marca inspirar** em vez de
> escolher sozinha.

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
