# Funil — gestor de oportunidades de venda

**Funil** é um app que, em vez de só listar contatos, mostra **em que etapa do
funil** cada negócio está e **qual focar primeiro** — calculando a
**probabilidade de fechamento** e o **valor ponderado** (valor × probabilidade)
de cada oportunidade.

> Projeto didático do experimento **IA na Prática**: construído em passos
> pequenos, cada um com testes dos dois lados (positivo e negativo), clean code
> comentado, acessibilidade WCAG AA e registro do caminho em `GLOSSARIO.md`,
> `RESUMAO.md` e `PROMPTS.md`.

## O conceito (por que o app existe)

O motor é o **funil de vendas** (metáfora que vem do modelo **AIDA**): muitos
entram no topo largo (Leads) e poucos chegam ao bico fino (Fechado). Cada negócio
percorre **etapas em ordem** e a cada etapa corresponde uma **probabilidade**:

| Etapa | Probabilidade-base |
|---|---|
| Lead | 10% |
| Qualificação | 25% |
| Proposta | 50% |
| Negociação | 75% |
| Fechado | 100% (Ganho) / 0% (Perdido) |

A **qualificação BANT** (Orçamento, Autoridade, Necessidade, Prazo) ajusta a
chance em **+5% por critério** atendido. A **probabilidade e o valor ponderado são
calculados por função pura** — nunca digitados à mão.

### Fundamentação (com fontes)

- **Modelo AIDA / origem do funil** — Elias St. Elmo Lewis (1898); sigla por
  C. P. Russell (1921); ligação ao funil em *Bond Salesmanship*, W. Townsend (1924).
  [ProvenModels](https://www.provenmodels.com/547/aidasales-funnel/elias-st.-elmo-lewis) ·
  [MasterClass](https://www.masterclass.com/articles/aida-model-explained)
- **BANT** — framework de qualificação da IBM (anos 1950).
  [HubSpot](https://blog.hubspot.com/sales/bant) ·
  [Lucidchart](https://lucid.co/blog/what-is-BANT-and-how-can-it-streamline-lead-qualification)
- **Pipeline ponderado / taxa de conversão** — prática de CRM (valor × probabilidade).
  [HubSpot](https://blog.hubspot.com/sales/sales-pipeline)

## Como rodar

Não precisa instalar nada para **usar** o app:

1. Abra o arquivo `index.html` no navegador (duplo clique).
   - Se o navegador bloquear scripts locais, sirva a pasta:
     `python3 -m http.server 8137` e acesse `http://localhost:8137/index.html`.

Os dados ficam no **localStorage** do próprio navegador (sem servidor, sem banco).

## Como testar

Precisa de **Node.js** (testado no v20).

```bash
npm install                      # instala Jest e Playwright
npm test                         # testes unitários (Jest) das funções puras
npx playwright install chromium  # baixa o navegador de teste (só na 1ª vez)
npm run test:e2e                 # testes de interface (Playwright)
```

**Placar atual: 49 unitários (Jest) + 19 E2E (Playwright) = 68 testes**, com
cenários **positivos** (o que deve funcionar) e **negativos** (o que deve ser
bloqueado/dar erro).

## Arquitetura

Stack **HTML + CSS + JavaScript puros** — sem framework, sem build.

| Arquivo | Papel |
|---|---|
| `index.html` | Telas e estilos (design tokens em CSS) + a "cola" que liga a tela às funções puras |
| `logica.js` | **Regras de negócio em funções puras** — roda no Jest (Node) e no navegador (`window.Logica`) |
| `logica.test.js` | Testes unitários (Jest) |
| `e2e/app.spec.js` | Testes de interface (Playwright) |
| `screenshots/` | Prints revisados a cada tela |

**Separação-chave:** toda regra é **função pura** (mesma entrada → mesma saída,
sem efeito colateral). Efeitos colaterais (localStorage, download, data/hora)
ficam só na tela. Por isso a lógica é testável sem navegador. Principais funções:

- Cálculo: `probabilidadeDaEtapa`, `pontuarQualificacao`, `probabilidadeDeFechamento`,
  `valorPonderado`, `validarNegocio`.
- Negócio (com desfecho): `probabilidadeDoNegocio`, `valorPonderadoDoNegocio`.
- Ciclo de etapas: `proximaEtapa`, `etapaAnterior`, `avancarNegocio`, `voltarNegocio`.
- Lista: `ordenarPorValorPonderado`, `agruparPorEtapa`.
- Persistência: `serializarNegocios`, `desserializarNegocios`.
- Exportação (LGPD): `montarExportacao`, `exportarJson`.
- Acessibilidade/qualidade: `luminancia`, `razaoContraste`, `nivelWcag`,
  `caixaContem`, `distanciaEntreCaixas`, `validarEspacamento`.

## Qualidade e acessibilidade

- **Contraste WCAG AA/AAA** medido **ao vivo** no rodapé (funções puras testadas);
  a paleta foi verificada **antes** de virar CSS.
- **Teclado, foco visível, labels e regiões nomeadas** — cobertos por E2E.
- **Teste de espaçamento** (`validarEspacamento`): reprova botão/campo colado ou
  sobreposto (folga exigida > 0,5px) — pegou uma quebra real durante o projeto.
- **Inspiração visual** declarada: **Jira** (Atlassian, azul), sempre respeitando o
  contraste.

## Decisões (e o porquê)

| Decisão | Por quê |
|---|---|
| Funil de vendas (AIDA) como motor | Metáfora consagrada; torna visível onde cada negócio está |
| Probabilidade e valor ponderado por função pura | Vira cálculo, não achismo — testável e à prova de erro |
| Ordenar por **valor ponderado** (não valor bruto) | Foca no que é realista fechar grande |
| Ganho = 100% / Perdido = 0% | O valor previsto do funil reflete o que de fato fechou |
| Data de fechamento passada de fora | Mantém a transição pura e testável |
| Regras puras + efeitos só na tela | A lógica é testada sem depender do navegador |

## Estado do roteiro

Concluídos: **0** setup · **1** fundamentação · **2** lógica · **3** primeira tela
· **4** persistência · **5** lista por etapa · **6** ciclo de etapas · **10**
exportar/limpar · **11** acessibilidade + E2E.

Features futuras: **7** painel "Visão do funil" (dashboard) · **8** filtros
persistidos · **9** reiniciar/excluir com confirmação.

A história completa, prompt a prompt, está em [`PROMPTS.md`](PROMPTS.md) e
[`RESUMAO.md`](RESUMAO.md); o vocabulário em [`GLOSSARIO.md`](GLOSSARIO.md). Os
slides da apresentação estão em [`slides.html`](slides.html).
