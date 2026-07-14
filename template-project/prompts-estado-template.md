# Prompts do projeto — [TEMA DO PROJETO]

> **Modelo "estado zero" (semente).** Este arquivo é o ponto de partida do diário
> de prompts. Durante o projeto ele **cresce**: a cada avanço, você registra aqui
> o prompt enviado, o resultado e os próximos passos. Comece pelo **Prompt 0**
> abaixo; os demais vão sendo adicionados na ordem em que forem executados.

## Como conversar com a IA (para iniciantes)

Poucas regras deixam a conversa produtiva:

1. **Um objetivo por prompt.** Peça em **partes pequenas** — é mais fácil revisar
   e corrigir do que um "faça tudo".
2. **Peça os testes junto** de cada funcionalidade (a IA já faz isso, mas reforce).
3. **Deixe a IA fechar cada resposta** com: explicar em linguagem simples →
   documentar → propor 2–3 próximos passos. **Você escolhe** o próximo.
4. **Valide o que vê**: peça uma screenshot/rodar o app quando for algo visual.
5. **Não precisa repetir as regras**: a IA lê o arquivo de instruções
   (`instrucoes-do-projeto…` / `.github/copilot-instructions.md`) e as segue
   automaticamente em toda resposta.
6. **Na dúvida, pergunte "por quê?"** — entender a decisão vale mais do que só
   receber o código.

## Prompt 0 — Setup (comece por aqui)

> Cole o texto abaixo trocando os `[campos]`. Ele instrui a IA a montar o arquivo
> de instruções do seu tema a partir do modelo estado zero.

```
Estou começando um novo projeto: [descreva o tema do app em 1–2 frases].
Criei a pasta "[nome-da-pasta]" no computador e ela já está aberta nesta
ferramenta. Com base no instrucoes-do-projeto-template.md, preencha o
arquivo de instruções para este tema: o que é o app, a FUNDAMENTAÇÃO e
referências do conceito central, a stack, as regras de negócio e as regras
automáticas de toda resposta (testes dos dois lados, clean code comentado,
acessibilidade WCAG AA com relatório de contraste ao vivo, qualidade visual
com layout em Flexbox/Grid sem quebra, usabilidade sem becos, LGPD com dados
fictícios e registro em GLOSSARIO.md, RESUMAO.md e PROMPTS.md). Depois, monte
no PROMPTS.md a previsão dos prompts (roteiro Prompt 1 → N adaptado ao tema),
cada um com objetivo, texto pronto para colar e o que entrega. Confirme que
passará a seguir essas regras em TODAS as respostas e diga, em uma frase, o
que entendeu do app.
```

**Resultado:** _aguardando execução._

## Prompt de qualidade de código (rode cedo — logo após o núcleo da lógica)

> Este é o **passo 2.5** do roteiro. Rode assim que existir o primeiro código
> (`logica.js`), para que o padrão valha em **todas as etapas seguintes**. Cole o
> texto abaixo:

```
Configure o ferramental de qualidade de código deste projeto, com três scripts
no package.json:
- "lint" rodando ESLint sobre os .js (logica, testes e e2e);
- "format" rodando Prettier com --write no padrão do projeto;
- "prepare" ativando o Husky.
Crie o hook de pre-commit do Husky para rodar lint + format (Prettier) antes de
CADA commit, em QUALQUER branch — código com erro de lint ou fora do padrão não
deve entrar no histórico. Defina também os arquivos de exclusão .gitignore,
.eslintignore e .prettierignore (ignorando node_modules, test-results,
playwright-report, .DS_Store etc.). Ao final, rode lint e format, confirme que a
suíte de testes continua verde e me diga o placar.
```

**Resultado:** _aguardando execução._

## Como registrar cada prompt (convenção)

A cada avanço, adicione um bloco assim (o mais recente por último):

```
## Prompt N — [título curto do que foi pedido] ✅ executado

​```
[o texto exato do prompt que você enviou]
​```

**Resultado:** [o que a IA entregou, em 2–4 linhas: arquivos, decisões, testes].
**Próximo passo:** [a opção escolhida entre as que a IA propôs].
```

## Roteiro previsto de prompts (mapa do caminho)

> **Regra do estado zero:** logo após o Setup 0, a IA preenche aqui uma
> **previsão dos prompts** (Prompt 1 → N) adaptada ao tema do projeto. Este
> projeto é **didático** — ter o caminho inteiro à vista tira o "e agora?" de cada
> passo. **É guia, não trilho:** a ordem pode mudar conforme as escolhas do
> usuário (a IA sempre fecha cada resposta com 2–3 próximos passos e **você
> decide**), e vale sempre "um objetivo por prompt, com testes junto".
>
> **Convenção de cada item do roteiro** — para cada prompt previsto, escrever:
>
> ```
> ### Prompt N — [título curto]
> **[Objetivo]** [o que passa a existir, em uma frase]
> ​```
> [texto pronto para colar, curto e sem repetir as regras do projeto]
> ​```
> **[Entrega]** [arquivos/comportamento + testes que ficam prontos]
> ```
>
> **Todo prompt fecha confirmando que nada quebrou:** qualquer item do roteiro que
> altera código (inclusive os **sem tela**, como o **4 persistência**) termina
> **rodando a suíte de testes (unitários + E2E) e reportando o placar** e, depois
> que o ferramental (2.5) existir, **passando `npm run lint` e `npm run format`**
> antes de encerrar — o mesmo par que o **pre-commit do Husky** repete a cada
> commit, em qualquer branch. Os itens
> que mexem na **interface** (ex.: **3 primeira tela** e **7 dashboard**), **além
> disso**, **geram o screenshot** — print e placar vêm juntos, e a tela só é
> "pronta" se o screenshot está bom e nenhum teste regrediu (ver "Checagem de
> regressão em TODO prompt" e "Definição de pronto VISUAL" no arquivo de instruções).
>
> Sequência típica (adaptar os nomes ao tema): **1 fundamentação** (documentar,
> com fontes/links, de onde vem o **conceito central** — pesquisa da IA + as
> referências que o usuário queira citar — antes de qualquer código) → **2** núcleo
> da lógica em funções puras + testes → **2.5 ferramental de qualidade de código**
> (ESLint + Prettier + Husky pre-commit; os 3 scripts no `package.json` — `lint`,
> `format`, `prepare` — e os `.gitignore`/`.eslintignore`/`.prettierignore`;
> **entra cedo**, logo que existe código, para valer em todas as etapas seguintes)
> → **3** primeira tela (formulário + **design
> tokens derivados da inspiração visual: marca/sistema de mercado de referência** +
> rodapé de contraste + **teste de espaçamento dos elementos: folga > 0,5px, sem
> colar/sobrepor** — ver "Espaçamento garantido por teste" no arquivo de
> instruções) → **4** persistência no
> localStorage → **5** lista organizada por prioridade → **6** ciclo de status
> (avança/volta) → **7** dashboard com indicadores → **8** filtros/preferências
> persistidos → **9** ações destrutivas com confirmação + "Reiniciar experiência"
> → **10** exportar/limpar dados (LGPD) → **11** acessibilidade WCAG AA + E2E
> (Playwright) → **12** entregas finais (README + slides).
> Plan Test → **13** em português para planejar os próximos testes unitários ou de interface

> **Primeiro prompt do roteiro é sempre a fundamentação (conceito central):** todo
> app tem a seção obrigatória de FUNDAMENTAÇÃO (ver arquivo de instruções). Como o
> tema é informado pelo usuário e pode ser **qualquer tipo de sistema**, no
> **Prompt 1** a IA **pesquisa na internet** referências reais para aquele tema —
> somadas às que o usuário quiser citar —, escolhe as mais sólidas, documenta
> **com o link da fonte** e registra os termos no `GLOSSARIO.md` — sem escrever
> código ainda e sem reaproveitar referências de temas anteriores. A **inspiração
> visual** (marca/sistema de mercado que guia paleta, cores e estilo de tela) é uma
> coisa **diferente** e entra junto da primeira tela/design tokens.

## Status do roteiro (a preencher)

- [ ] Executar o **Prompt 0** (setup do arquivo de instruções + este roteiro).
- [ ] **Prompt 1** … **Prompt N** conforme a previsão acima, um de cada vez.
- [ ] **Ferramental de qualidade (2.5)**: ESLint + Prettier + Husky pre-commit
      (scripts `lint`/`format`/`prepare` no `package.json`) e os arquivos de
      exclusão `.gitignore`/`.eslintignore`/`.prettierignore` — rodado cedo.
- [ ] Entregas finais: **README.md** e **slides** (alimentados por este
      `PROMPTS.md` e pelo `RESUMAO.md`). Os **slides abrem apresentando, na capa,
      o TEMA e a INSPIRAÇÃO visual**, com um **slide dedicado à inspiração** — mesma
      lógica de abertura em todos os projetos. O **README traz o passo a passo para
      subir o repositório** (git init → commit → `npm install` (ativa o Husky) →
      criar repo remoto → push) — os slides ganham um **slide de qualidade de
      código** (lint + format + pre-commit).
