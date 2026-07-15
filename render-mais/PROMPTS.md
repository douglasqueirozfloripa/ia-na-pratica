# Prompts do projeto — Render Mais (ex-"Renda Fixa Conservadora")

> **Diário de prompts.** Este arquivo cresce a cada avanço: você registra o
> prompt enviado, o resultado e o próximo passo. O **Prompt 0** (Setup) e o
> **Prompt 1** (fundamentação) já estão executados abaixo; siga o **roteiro
> previsto** um prompt de cada vez.

## Como conversar com a IA (para iniciantes)

1. **Um objetivo por prompt.** Peça em **partes pequenas** — é mais fácil revisar.
2. **Peça os testes junto** de cada funcionalidade (a IA já faz isso, mas reforce).
3. **Deixe a IA fechar cada resposta** com: explicar → documentar → propor 2–3
   próximos passos. **Você escolhe** o próximo.
4. **Valide o que vê**: peça uma screenshot/rodar o app quando for algo visual.
5. **Não precisa repetir as regras**: a IA lê o `CLAUDE.md` e as segue sozinha.
6. **Na dúvida, pergunte "por quê?"** — entender a decisão vale mais do que o código.

## Prompt 0 — Setup ✅ executado

```
Tema: Simulador de carteira de renda fixa conservadora baseada no CDI. Com base
no instrucoes-do-projeto-template.md, preencha o arquivo de instruções para este
tema (o que é o app, fundamentação com fontes, stack, regras de negócio, regras
automáticas) e monte o roteiro de prompts no PROMPTS.md.
```

**Resultado:** criados `CLAUDE.md` (instruções do tema, com a fundamentação
pesquisada — Teoria Moderna do Portfólio/Markowitz 1952, Suitability/Resolução
CVM 30/2021, FGC, CDI/Selic, Tesouro Selic/LFT, IR regressivo — e links),
`GLOSSARIO.md` (Etapa 1 com os termos), e agora `PROMPTS.md` (este roteiro) e
`RESUMAO.md` (semente). Nenhum código ainda. App entendido: **Renda Fixa
Conservadora**, simulador que calcula o **rendimento líquido** de cada aporte
(% do CDI + IR regressivo), mostra a **composição por risco** e mede a
**aderência ao perfil conservador**, sugerindo a proporção-alvo por classe.
**Próximo passo:** executar o **Prompt 2** (núcleo da lógica em funções puras).

## Prompt 1 — Fundamentação (conceito central) ✅ executado

```
Pesquise e consolide a fundamentação do app de renda fixa: Teoria Moderna do
Portfólio (Markowitz), Suitability (Resolução CVM 30), FGC, CDI/Selic, Tesouro
Selic/LFT e IR regressivo. Registre cada termo no GLOSSARIO.md em linguagem
simples, com a fonte linkada. Ainda sem código.
```

**Resultado:** `GLOSSARIO.md` recebeu a "Etapa 1 — Fundamentação" com os termos
(CDI, Selic, % do CDI, IR regressivo, isenção LCI/LCA/poupança, come-cotas, FGC,
Tesouro Selic/LFT, suitability, diversificação/Markowitz, fronteira eficiente,
nível de risco, rendimento real, liquidez) — cada um em linguagem simples, com
analogia, o porquê no app e a fonte linkada. Confirmada a seção de fundamentação
do `CLAUDE.md`. **Nenhum código ainda.**
**Próximo passo:** Prompt 2 — núcleo da lógica em funções puras + testes (Jest).

## Prompt 2 — Núcleo da lógica (funções puras) + testes ✅ executado

```
Crie logica.js com funções puras para renda fixa: rendimentoBruto(valor, pctCDI,
cdiAnual, dias), impostoRegressivo(ganho, dias), rendimentoLiquido(...),
pesoNaCarteira(...), nivelDeRisco(categoria) e validarAporte(...). Escreva
logica.test.js no Jest com casos positivos e negativos. Sem tela ainda.
```

**Resultado:** criados `logica.js` (funções puras `nivelDeRisco`, `ehIsento`,
`aliquotaIR`, `rendimentoBruto`, `impostoRegressivo`, `rendimentoLiquido`,
`pesoNaCarteira`, `validarAporte` + constantes-fonte), `logica.test.js` e
`package.json` (`npm test`). IR regressivo por dias corridos (22,5%→15%), isenção
para LCI/LCA/poupança, rendimento em % do CDI capitalizado. **24 unitários
(positivos e negativos) passando.** Lint/format entram no Prompt 2.5.
**Próximo passo:** Prompt 2.5 (ferramental de qualidade) ou Prompt 3 (primeira tela).

## Prompt 3 — Primeira tela + design tokens + rodapé de contraste ✅ executado

```
Crie index.html com o formulário de novo aporte, design tokens em CSS derivados
de uma inspiração visual (me pergunte qual marca), rodapé que calcula contraste
(luminancia/razaoContraste/nivelWcag) ao vivo e o teste de espaçamento
(validarEspacamento, folga > 0,5px). Gere um screenshot ao final.
```

**Resultado (✅ executado):** inspiração escolhida pelo usuário: **XP
Investimentos** (preto + amarelo). Criados `index.html` (header + formulário +
prévia ao vivo de risco/bruto/IR/líquido + rodapé de contraste), `playwright.config.js`
e `e2e/app.spec.js`. Funções puras de contraste e espaçamento adicionadas ao
`logica.js`. Screenshot em `screenshots/prompt3-primeira-tela.png` (3 pares em
AAA). **Placar: 34 unitários + 6 E2E = 40 passando**; lint limpo.
**Próximo passo:** Prompt 4 — persistência no localStorage.

## Prompt 4 — Persistência no localStorage ✅ executado

```
Faça os aportes serem salvos no localStorage e recarregados ao abrir o app.
Testes: (positivo) aporte persiste após recarregar; (negativo) dado corrompido
não quebra o app.
```

**Resultado (✅ executado):** o formulário agora adiciona aportes à carteira,
persistidos em `localStorage` (`rfc.aportes`) e recarregados ao abrir. Nova seção
"Sua carteira" com contador + lista; "Reiniciar experiência" apaga a carteira.
Funções puras `serializarAportes`/`desserializarAportes` (blindadas) no `logica.js`.
Screenshot em `screenshots/prompt4-persistencia.png`. **Placar: 39 unitários +
8 E2E = 47 passando**; lint limpo.
**Próximo passo:** Prompt 5 — lista organizada por nível de risco.

## Prompt 5 — Lista organizada por nível de risco ✅ executado

```
Mostre os aportes agrupados por nível de risco (muito baixo, baixo, médio), com
contador, valor total e % da carteira por grupo, ordenados por peso. Testes da
ordenação e do agrupamento.
```

**Resultado (✅ executado):** carteira agrupada por risco (muito baixo → baixo →
médio), cada grupo com quantidade, soma e % da carteira; itens ordenados por
valor. Funções puras `totalCarteira`, `ordenarPorValor` e `agruparPorRisco` no
`logica.js`. Screenshot em `screenshots/prompt5-lista-por-risco.png`. **Placar:
45 unitários + 9 E2E = 54 passando**; lint limpo.
**Próximo passo:** Prompt 6 — ciclo de status do aporte.

## Prompt 6 — Ciclo de status do aporte ✅ executado

```
Implemente o ciclo de status Planejado → Aplicado → Resgatável → Resgatado,
avançando e voltando um passo. A transição carimba/limpa datas quando fizer
sentido. Testes das transições válidas e das bloqueadas. (Complemento: carteira
de exemplo espelhando a estrutura dos prints em docs/, com valores fictícios.)
```

**Resultado (✅ executado):** ciclo de status por item com botões Avançar/Voltar
(carimbo de data ao aplicar/resgatar, limpo ao voltar; botões desabilitados nos
extremos). Funções puras `proximoStatus`/`statusAnterior`/`avancarAporte`/
`voltarAporte`. Adicionada a **carteira de exemplo** (estrutura real dos prints
`docs/`, valores fictícios — LGPD) com botão "Carregar carteira de exemplo";
`docs/` no `.gitignore`. Screenshot em `screenshots/prompt6-ciclo-status.png`.
**Placar: 55 unitários + 11 E2E = 66 passando**; lint limpo.
**Próximo passo:** Prompt 7 — dashboard com indicadores.

## Prompt 7 — Dashboard com indicadores ✅ executado

```
Crie um dashboard com os números-chave: patrimônio total, composição por risco,
rendimento líquido projetado, aderência ao perfil conservador e destaque do que
exige atenção (risco médio acima do teto; valor acima do teto do FGC). Cartões em
grid responsivo. Gere um screenshot ao final.
```

**Resultado (✅ executado):** painel no topo com patrimônio total, rendimento
líquido projetado, aderência (teto de risco médio ≤ 15%), barras de composição por
risco e alertas (risco médio / FGC). Funções puras `rendimentoLiquidoCarteira`,
`aderenciaConservador`, `alertasCarteira`. Screenshots em
`screenshots/prompt7-dashboard*.png`. **Placar: 63 unitários + 12 E2E = 75
passando**; lint limpo.
**Próximo passo:** Prompt 8 — filtros/preferências persistidos.

## Prompt 8 — Filtros / preferências persistidos ✅ executado

```
Adicione filtros por categoria, risco e horizonte, mais a escolha do perfil-alvo
(conservador/moderado/agressivo). Persista tudo no localStorage e reaplique ao
reabrir o app. Testes de que o filtro e o perfil persistem e continuam aplicados.
```

**Resultado (✅ executado):** barra de filtros (categoria/risco/horizonte) +
perfil-alvo, persistidos em `rfc.prefs`. Perfil-alvo agora tem teto de risco médio
por nível (15%/30%/60%) e o dashboard reflete o perfil escolhido (rótulo dinâmico).
Funções puras `aderenciaPerfil`, `horizonteDoAporte`, `filtrarAportes`. Screenshot
em `screenshots/prompt8-filtros.png`. **Placar: 72 unitários + 13 E2E = 85
passando**; lint limpo.
**Próximo passo:** rever o roteiro com o novo rumo (simulador de melhoria de
rentabilidade / dicas de rebalanceamento).

## Prompt 9 — Reformulação do conceito + Simulador de melhoria ✅ executado

```
Reformule o conceito do app para "simulador de perfil com foco em aumentar a
renda" (atualize o CLAUDE.md) e construa um simulador de melhoria: dicas de
rebalanceamento (trocar produtos de baixo rendimento como poupança/CDB PRÉ),
ordenadas pelo ganho anual estimado, e a possibilidade de subir de perfil.
Cubra tudo com testes.
```

**Resultado (✅ executado):** `CLAUDE.md` reformulado (pitch/conceito/resultado
com foco em render mais + subir de perfil na fronteira eficiente). Novo cartão
"Como render mais" com dicas ordenadas pelo ganho anual (R$/ano) e nota de
ressalva (liquidez/objetivo/FGC). Funções puras `taxaLiquidaAnualizada`,
`melhorAlvoMelhoria`, `sugestoesRebalanceamento`, `resumoMelhoria`. Screenshots em
`screenshots/prompt9-melhoria*.png`. **Placar: 79 unitários + 15 E2E = 94
passando**; lint limpo.
**Próximo passo:** Prompt 10 — ações destrutivas (remover aporte) + Reiniciar.

## Prompt 10 — Ações destrutivas: remover aporte ✅ executado

```
Implemente remover um aporte individual da carteira, com confirmação (o
"Reiniciar experiência" já zera tudo). Testes: (positivo) confirma e remove;
(negativo) cancela e nada muda.
```

**Resultado (✅ executado):** botão "Remover" (estilo de perigo) por item, com
confirmação; remoção persiste no localStorage. Função pura `removerAporte(lista,
id)` no `logica.js`. Screenshot em `screenshots/prompt10-remover.png`. **Placar:
81 unitários + 16 E2E = 97 passando**; lint limpo.
**Próximo passo:** Prompt 11 — exportar / limpar dados (LGPD).

## Prompt 11 — Exportar / limpar dados (LGPD) ✅ executado

```
Adicione exportar a carteira (JSON) e confirme que o "Reiniciar" limpa todos os
dados. Testes: (positivo) exporta o conteúdo atual; (positivo) reiniciar limpa tudo.
```

**Resultado (✅ executado):** botão "Exportar (JSON)" no header baixa
`carteira-renda-fixa.json` (carteira + prefs); "Reiniciar experiência" cobre o
limpar tudo. Funções puras `montarExportacao`/`exportarJson`. Screenshot em
`screenshots/prompt11-exportar.png`. **Placar: 84 unitários + 18 E2E = 102
passando**; lint limpo.
**Próximo passo:** Prompt 12 — acessibilidade WCAG AA + E2E.

## Prompt 12 — Acessibilidade WCAG AA + E2E ✅ executado

```
Faça uma passada de acessibilidade WCAG AA (skip-link, aria-live, foco, rótulos)
e cubra os fluxos críticos com Playwright. Prove o contraste no rodapé.
```

**Resultado (✅ executado):** skip-link, `aria-live` na prévia/painel, rodapé
auditando 5 pares (todos AA/AAA). E2E: skip-link/rótulos/contraste, teclado até
"Adicionar", fluxo crítico cadastrar→painel→filtrar→exportar. Screenshot em
`screenshots/prompt12-contraste.png`. **Placar: 84 unitários + 21 E2E = 105
passando**; lint limpo.
**Próximo passo:** pivô do conceito + simulador de trocas (pedido do usuário).

## Prompt 13 — Pivô "Render Mais" + carteira revisada + simulador de trocas ✅ executado

```
Mude o conceito: o app agora é para AUMENTAR a rentabilidade (trocas + plano
mensal), não sobre ser conservador. Renomeie a pasta/app para "Render Mais".
Revise os valores do exemplo conforme os docs (total R$ 88.344) e me avise se
faltar alguma fatia. Adicione um botão no fim de "Como render mais" para SIMULAR
as trocas e mostrar o antes × depois (rentabilidade e renda/ano) + se aumenta ou
não (resultado + dicas). Cubra de testes.
```

**Resultado (✅ executado):** app renomeado para **Render Mais** (pasta
`render-mais`), conceito/CLAUDE.md/marca reformulados para "aumentar rentabilidade".
Exemplo revisado somando **R$ 88.344** (proporções dos docs). Botão "Simular
trocas" com antes × depois, veredito e lista das trocas (funções puras
`rentabilidadeMediaAnual`/`aplicarMelhorias`/`simularMelhoria`). **Aviso:** os
docs tinham uma fatia de **ações/multimercado** (renda variável) que o app não
modela — fora do exemplo. Screenshot `screenshots/prompt13-simular.png`.
**Placar: 88 unitários + 22 E2E = 110 passando**; lint limpo.
**Próximo passo:** plano mensal de aportes (2ª alavanca) ou entregas finais.

## Prompt 14 — Plano mensal de aportes (juros compostos) ✅ executado

```
Adicione a 2ª alavanca do "Render Mais": um plano mensal de aportes que projeta o
crescimento por juros compostos (total investido × montante final × ganho). Cubra
de testes.
```

**Resultado (✅):** funções puras `taxaMensalDeAnual` e `projetarPlanoMensal`;
card "Plano mensal para crescer" com aporte mensal, prazo (anos) e taxa (a.a.,
pré-preenchida com a rentabilidade média da carteira). **115 testes (92+23).**

## Prompt 15 — Renda variável (ações / multimercado) ✅ executado

```
Inclua a fatia de renda variável (ações/multimercado) que ficou de fora: nova
categoria com risco alto, rendimento pela rentabilidade esperada informada (sem
% do CDI). Ajuste o exemplo. Cubra de testes.
```

**Resultado (✅):** categorias `multimercado` (médio) e `acoes` (alto), nível
"alto" na composição, `rendimentoLiquidoDeAporte`/`ehRendaVariavel`, campo
condicional "rentabilidade esperada" no formulário, e a fatia RV somada ao exemplo
(total mantido R$ 88.344). Aderência passou a considerar médio + alto.
**123 testes (99+24).**

## Prompt 16 — Entregas finais (README + slides + tutorial ao vivo) ✅ executado

```
Escreva o README.md e os slides "Render Mais" (capa com Tema + Inspiração). Além
disso, um tutorial AO VIVO (headed) que executa o fluxo completo de simulações
explicando as funções.
```

**Resultado (✅):** `README.md` (visão, como rodar/testar, arquitetura, tabela de
funções, passo a passo git), `slides.html` (13 slides na paleta XP) e `tutorial.js`
(`npm run tutorial`) — abre o navegador e percorre os 9 passos narrando cada função
pura. Rodado com sucesso ponta a ponta.

## Prompt 17 — Plano de Testes ✅ executado

```
Monte um Plano de Testes em português com os próximos testes unitários e de
interface (cenários positivos e negativos), priorizados por risco.
```

**Resultado (✅):** `PLANO-DE-TESTES.md` com 12 casos priorizados (ALTA/MÉDIA/
BAIXA), cada um com cenário positivo e negativo — do IR sobre ações e come-cotas
(alta) a responsividade 360px e teclado (baixa). Fecha o roteiro didático (1→13).

## Prompt 20 — Dividendos / renda passiva ✅ executado

```
Traga dividendos para o app: campo de DY esperado nas ações, um card de renda
passiva (por ano/mês + por ativo) e alertas de DY alto demais (yield trap) e de
concentração. Cubra de testes.
```

**Resultado (✅):** funções `rendaDividendosAnual`/`rendaPassivaCarteira`; card
"Renda passiva de dividendos" (anual/mensal/por ativo); campo **DY esperado** só
para ações; alertas **dy-alto** (> 15%) e **concentracao** (> 30% num aporte).
Screenshot `screenshots/prompt20-dividendos.png`. **138 testes (111+27)**; lint limpo.

## Prompt 21 — Meta de renda passiva + E2E das visões de risco ✅ executado

```
Adicione a meta de renda passiva (quero R$ X/mês → quanto investir/quanto falta).
E faça um E2E completo simulando visões de baixo/médio/alto risco para aumentar a
rentabilidade da carteira de ~R$ 88 mil.
```

**Resultado (✅):** função `metaRendaPassiva` + seção "Meta de renda passiva" no
card de dividendos (ex.: R$ 1.000/mês a 6% ⇒ R$ 200 mil, faltam ~R$ 199,9 mil).
Novo `e2e/simulacao-riscos.spec.js` com 5 testes: comparação numérica das 3 visões
(baixo/médio/alto) via `window.Logica` + fluxo de cada visão na tela + a meta.
Screenshot `screenshots/prompt20-dividendos.png`. **146 testes (114+32)**; lint limpo.

## Prompt 22 — Meta → plano (quanto aportar por mês) ✅ executado

```
Ligue a meta de renda passiva ao plano mensal: dado o capital que falta e um
prazo, calcule quanto aportar por mês para chegar lá. Cubra de testes.
```

**Resultado (✅):** função pura `aporteMensalParaMeta` (inverso de
`projetarPlanoMensal`, com teste de round-trip); a seção da meta ganhou o campo
"Chegar lá em (anos)" e mostra o aporte mensal necessário (ex.: ~R$ 200 mil em 10
anos ≈ R$ 967/mês, rendendo a taxa do plano). **149 testes (117+32)**; lint limpo.

## Prompt 23 — Simulador de cenários por npm script ✅ executado

```
Faça diferentes scripts que simulam situações de troca das aplicações default dos
88 mil e coloque no package.json, para eu rodar o cenário que quero aprender.
```

**Resultado (✅):** `simular.js` (headed, sobe o próprio servidor) com 7 cenários
narrados sobre a carteira default de R$ 88 mil: **baixo · medio · alto ·
dividendos · plano · troca-poupanca · tudo**. Atalhos no `package.json`
(`cenario:*`) + `test:e2e:riscos`. Cada cenário narra a função pura por trás.
Ex.: troca-poupanca mostra rendimento R$ 19.377 → R$ 20.830. Documentado no README.

## Prompt 24 — Painel de siglas + cenários de risco (FGC/concentração/yield-trap) ✅ executado

```
Adicione as legendas das siglas (no glossário e num painel lateral que abre/fecha)
e mais cenários de simulação (FGC, concentração, yield-trap). Depois commit + push.
```

**Resultado (✅):** painel lateral **"Siglas"** (botão no header, abre/fecha,
acessível: aria-expanded, foco, Escape) com 17 legendas do sistema; mesma
referência no `GLOSSARIO.md`. Três cenários novos no `simular.js` — **fgc**,
**concentracao**, **yield-trap** — com atalhos no `package.json`. **150 testes
(117+33)**; lint limpo. Screenshot `screenshots/prompt24-siglas.png`.

## Prompt de qualidade de código (rode cedo — logo após o núcleo da lógica)

> Este é o **passo 2.5** do roteiro. Rode assim que existir o primeiro código
> (`logica.js`), para o padrão valer em todas as etapas seguintes.

```
Configure o ferramental de qualidade de código deste projeto, com três scripts
no package.json:
- "lint" rodando ESLint sobre os .js (logica, testes e e2e);
- "format" rodando Prettier com --write no padrão do projeto;
- "prepare" ativando o Husky.
Crie o hook de pre-commit do Husky para rodar lint + format (Prettier) antes de
CADA commit, em QUALQUER branch. Defina também .gitignore, .eslintignore e
.prettierignore (ignorando node_modules, test-results, playwright-report,
.DS_Store etc.). Ao final, rode lint e format, confirme que a suíte continua
verde e me diga o placar.
```

**Resultado (✅ executado):** `npm install` trouxe ESLint/Prettier/Husky/Jest/
Playwright; criados `.eslintrc.json`, `.prettierrc.json`, `.husky/pre-commit`
(lint + format) e os `.gitignore`/`.eslintignore`/`.prettierignore`. `npm run
lint` **sem erros**, `npm run format` **sem mudanças**, **24 unitários passando**.
O Husky de subpasta avisa ".git can't be found" (a pasta vive dentro do repo
`ia-na-pratica`); o hook ativa quando o projeto vira repo próprio.
**Próximo passo:** Prompt 3 — primeira tela + design tokens + rodapé de contraste.

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

> **Guia, não trilho.** Adaptado ao tema de renda fixa. A ordem pode mudar
> conforme suas escolhas — a IA sempre fecha cada resposta com 2–3 próximos
> passos e **você decide**. Vale sempre "um objetivo por prompt, com testes
> junto". Todo prompt que altera código **roda a suíte (unitários + E2E) e
> reporta o placar**; a partir do 2.5, também **`npm run lint` + `npm run
> format`**; os prompts de tela (3 e 7) **geram screenshot** junto do placar.

### Prompt 2 — Núcleo da lógica (funções puras) + testes
**[Objetivo]** As regras de rendimento e risco viram funções puras testadas, sem tela.
```
Crie logica.js com funções puras para renda fixa: rendimentoBruto(valor, pctCDI,
cdiAnual, dias), impostoRegressivo(ganho, dias) seguindo a tabela 22,5%→20%→
17,5%→15% (LCI/LCA e poupança isentas), rendimentoLiquido(...), pesoNaCarteira(...)
e nivelDeRisco(categoria) → muito baixo/baixo/médio, e validarAporte(...). Escreva
logica.test.js no Jest com casos positivos e negativos (ex.: valor zero/negativo é
rejeitado; produto isento não desconta IR). Sem tela ainda.
```
**[Entrega]** `logica.js`, `logica.test.js` e `package.json` (`npm test`), com testes positivos e negativos passando.

### Prompt 2.5 — Ferramental de qualidade de código
**[Objetivo]** ESLint + Prettier + Husky pre-commit valendo em todas as etapas seguintes.
```
(Use o "Prompt de qualidade de código" acima.)
```
**[Entrega]** Scripts `lint`/`format`/`prepare` no `package.json`, hook de pre-commit do Husky e `.gitignore`/`.eslintignore`/`.prettierignore`; suíte verde.

### Prompt 3 — Primeira tela + design tokens + rodapé de contraste
**[Objetivo]** O formulário de aporte ganha vida, com paleta derivada da inspiração visual.
```
Crie index.html com o formulário de novo aporte (produto, categoria, valor,
indexador/% do CDI, datas de aplicação e vencimento/liquidez), design tokens em
CSS e um rodapé que calcula contraste (luminancia/razaoContraste/nivelWcag)
mostrando o nível WCAG ao vivo. Antes de escolher as cores, me pergunte qual
marca/app de investimentos usar como inspiração visual. Inclua o teste de
espaçamento (validarEspacamento, folga > 0,5px) e gere um screenshot ao final.
```
**[Entrega]** `index.html` com formulário + prévia ao vivo do rendimento líquido, rodapé de contraste WCAG, `validarEspacamento` nos testes, screenshot e placar.

### Prompt 4 — Persistência no localStorage
**[Objetivo]** Os aportes sobrevivem ao recarregar o app.
```
Faça os aportes serem salvos no localStorage e recarregados ao abrir o app.
Testes: (positivo) aporte persiste após recarregar; (negativo) dado corrompido
não quebra o app.
```
**[Entrega]** `serializarAportes`/`desserializarAportes` (leitura blindada), contador de aportes salvos, testes positivos/negativos, placar reportado.

### Prompt 5 — Lista organizada por nível de risco
**[Objetivo]** Os aportes aparecem agrupados por risco (e categoria), com totais por grupo.
```
Mostre os aportes agrupados por nível de risco (muito baixo, baixo, médio) e por
categoria, com contador, valor total e % da carteira por grupo, ordenados por
peso. Testes da ordenação e do agrupamento.
```
**[Entrega]** Funções puras `ordenarPorPeso`/`agruparPorRisco`, seção da lista com cabeçalho de indicadores, screenshot e placar.

### Prompt 6 — Ciclo de status do aporte (avança / volta um passo)
**[Objetivo]** Cada aporte percorre Planejado → Aplicado → Resgatável → Resgatado, sem beco sem saída.
```
Implemente o ciclo de status Planejado → Aplicado → Resgatável → Resgatado,
avançando e voltando um passo. A transição carimba/limpa datas quando fizer
sentido (ex.: data de aplicação ao virar Aplicado). Testes das transições
válidas e das bloqueadas.
```
**[Entrega]** Funções puras de transição (avança/volta), carimbo de datas, testes positivos/negativos, placar reportado.

### Prompt 7 — Dashboard com indicadores
**[Objetivo]** Um painel responde "como está a carteira" de relance.
```
Crie um dashboard com os números-chave: patrimônio total, composição por risco,
rendimento líquido projetado, aderência ao perfil conservador e destaque do que
exige atenção (ex.: fatia em risco médio acima do teto, ou valor acima do teto do
FGC por instituição). Cartões em grid responsivo (auto-fit, sem estourar/sobrepor).
Gere um screenshot ao final.
```
**[Entrega]** Seção de dashboard com cartões-indicadores, função de aderência ao perfil, grid responsivo, screenshot e placar.

### Prompt 8 — Filtros / preferências persistidos
**[Objetivo]** Filtros e o perfil-alvo ficam salvos entre sessões.
```
Adicione filtros por categoria, risco e horizonte, mais a escolha do perfil-alvo
(conservador). Persista tudo no localStorage e reaplique ao reabrir o app. Testes
de que o filtro persiste e continua aplicado.
```
**[Entrega]** Controles de filtro + perfil-alvo persistidos, testes de persistência, placar reportado.

### Prompt 9 — Ações destrutivas + "Reiniciar experiência"
**[Objetivo]** Remover aporte e zerar a carteira, sempre com confirmação.
```
Implemente remover um aporte e o botão "Reiniciar experiência" no header, ambos
com confirmação. Testes: (positivo) confirma e remove; (negativo) cancela e nada
muda.
```
**[Entrega]** Remoção e reinício com confirmação, testes positivos/negativos, placar reportado.

### Prompt 10 — Exportar / limpar dados (LGPD)
**[Objetivo]** O dado é do usuário: dá para exportar e apagar tudo.
```
Adicione exportar a carteira (JSON) e limpar todos os dados, com confirmação.
Testes: (positivo) exporta o conteúdo atual; (negativo) limpar exige confirmação.
```
**[Entrega]** Exportar/limpar com confirmação, testes, placar reportado.

### Prompt 11 — Acessibilidade WCAG AA + E2E (Playwright)
**[Objetivo]** Teclado, labels e contraste auditados de ponta a ponta.
```
Faça uma passada de acessibilidade WCAG AA (foco visível, navegação por teclado,
labels ligados aos campos, textos alternativos) e cubra os fluxos críticos com
Playwright (cadastrar aporte, ver dashboard, filtrar, reiniciar). Reporte o placar.
```
**[Entrega]** Ajustes de acessibilidade + `e2e/app.spec.js` cobrindo os fluxos críticos, placar reportado.

### Prompt 12 — Entregas finais (README + slides)
**[Objetivo]** Alguém roda o projeto do zero e a história fica contada.
```
Escreva o README.md (visão, como rodar, como testar, arquitetura, decisões e o
passo a passo para subir o repositório: git init → commit → npm install (ativa o
Husky) → criar repo remoto → push). Gere os slides a partir do PROMPTS.md e do
RESUMAO.md, abrindo na capa com Tema + Inspiração visual, com slide dedicado à
inspiração e um slide de qualidade de código.
```
**[Entrega]** `README.md` completo e slides de apresentação alinhados ao padrão dos outros projetos.

### Prompt 13 — Plano de Testes (próximos testes)
**[Objetivo]** Mapear, em português, os próximos testes unitários e de interface.
```
Monte um Plano de Testes em português listando os próximos testes unitários e de
interface que fariam sentido para evoluir o app (cenários positivos e negativos),
priorizados por risco.
```
**[Entrega]** Documento de Plano de Testes com os próximos casos priorizados.

## Status do roteiro

- [x] **Prompt 0** — Setup (CLAUDE.md + este roteiro).
- [x] **Prompt 1** — Fundamentação (conceito central) + glossário.
- [x] **Prompt 2** — Núcleo da lógica (funções puras) + testes. **24 passando.**
- [x] **Prompt 2.5** — Ferramental de qualidade (ESLint + Prettier + Husky). **Lint limpo, 24 testes OK.**
- [x] **Prompt 3** — Primeira tela + design tokens + rodapé de contraste. **40 testes (34+6), AAA.**
- [x] **Prompt 4** — Persistência no localStorage. **47 testes (39+8).**
- [x] **Prompt 5** — Lista por nível de risco. **54 testes (45+9).**
- [x] **Prompt 6** — Ciclo de status do aporte (+ carteira de exemplo). **66 testes (55+11).**
- [x] **Prompt 7** — Dashboard com indicadores. **75 testes (63+12).**
- [x] **Prompt 8** — Filtros / preferências persistidos (+ perfil-alvo real). **85 testes (72+13).**
- [x] **Prompt 9** — Reformulação do conceito + Simulador de melhoria ("como render mais"). **94 testes (79+15).**
- [x] **Prompt 10** — Ações destrutivas (remover aporte) + "Reiniciar experiência". **97 testes (81+16).**
- [x] **Prompt 11** — Exportar / limpar dados (LGPD). **102 testes (84+18).**
- [x] **Prompt 12** — Acessibilidade WCAG AA + E2E (Playwright). **105 testes (84+21).**
- [x] **Prompt 13** — Pivô "Render Mais" + carteira revisada + simulador de trocas. **110 testes (88+22).**
- [x] **Prompt 14** — Plano mensal de aportes (juros compostos). **115 testes (92+23).**
- [x] **Prompt 15** — Renda variável (ações/multimercado, risco alto). **123 testes (99+24).**
- [x] **Prompt 16** — Entregas finais: README + slides + **tutorial ao vivo** (`tutorial.js`).
- [x] **Prompt 17** — Plano de Testes (`PLANO-DE-TESTES.md`, 12 casos priorizados por risco).
- [x] **Prompt 18** — Fim da monocultura "tudo vira LCI/LCA": menu de alvos realista (Tesouro IPCA+, CDB 118%, LCI/LCA 95%, **debênture incentivada**), blindagem da reserva e piso de ganho. Análise em `docs/analise-lci-lca.md`. **153 testes (120+33).**

> **Nota (2º pivô no Prompt 13):** o app deixou de ser "conservador" e virou
> **Render Mais** (foco em aumentar a rentabilidade). Pasta renomeada para
> `render-mais`. Ainda falta a 2ª alavanca (plano mensal) e as entregas finais.

> **Nota (virada de rumo no Prompt 9):** o app passou a focar em **aumentar a renda /
> subir de perfil**; o "simulador de melhoria" entrou como Prompt 9 e empurrou os
> itens seguintes (ações destrutivas, exportar/limpar, acessibilidade, entregas)
> um número para frente. O roteiro segue sendo guia, não trilho.
