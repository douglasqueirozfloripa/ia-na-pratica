# Resumão do projeto — Render Mais (ex-"Renda Fixa Conservadora")

> O "memorial" do projeto: a cada etapa concluída, a IA escreve aqui o que foi
> construído, as decisões e os aprendizados. Junto com o `PROMPTS.md`, alimenta o
> README e os slides finais.

## Como registrar cada etapa (convenção)

```
## Etapa N — [título da etapa]

### O que foi feito
- [em linguagem simples, o que passou a existir/funcionar]

### Decisões e o porquê
| Decisão | Por quê |
|---|---|
| [o que se decidiu] | [a razão — o trade-off] |

### Testes
- [o que foi coberto e o placar, ex.: X unitários + Y E2E = Z passando]

### Próximo passo
- [a opção escolhida para seguir]
```

## Etapas

### Etapa 0 — Setup (Prompt 0)

### O que foi feito
- Definido o app **Renda Fixa Conservadora**: simulador que, a partir dos aportes
  cadastrados, calcula o **rendimento líquido** de cada posição (% do CDI + IR
  regressivo), mostra a **composição da carteira por nível de risco** e responde
  se ela está **aderente ao perfil conservador**, sugerindo a proporção-alvo por
  classe.
- Criados `CLAUDE.md` (instruções do tema, com a fundamentação pesquisada e links),
  `GLOSSARIO.md` (Etapa 1 com os termos), `PROMPTS.md` (roteiro Prompt 1 → 13) e
  `RESUMAO.md` (semente).

### Decisões e o porquê
| Decisão | Por quê |
|---|---|
| Alocação por perfil de risco (suitability, CVM 30) como eixo | Dá um critério oficial para dizer se a carteira é "conservadora", em vez de achismo |
| Diversificação de Markowitz para sugerir proporções | Justifica recomendar uma carteira-alvo por classe, não um único produto |
| Rendimento líquido, peso e risco por função pura | Previsão vira cálculo testável, à prova de erro de digitação |
| IR regressivo e isenção (LCI/LCA/poupança) na lógica | O que importa é o líquido: um % do CDI menor pode render mais que um CDB tributado |
| Stack HTML/CSS/JS puro + localStorage | Roda no navegador sem instalar nada — didático para iniciantes |
| Dados de exemplo fictícios (estrutura real, valores arredondados) | LGPD: espelha uma carteira real sem expor dados de pessoas |

### Testes
- Nenhum ainda — começam no Prompt 2 (núcleo da lógica).

### Próximo passo
- Executar o **Prompt 2**: núcleo da lógica em funções puras (rendimento líquido,
  IR regressivo, peso na carteira, nível de risco) + testes no Jest.

### Etapa 1 — Fundamentação (Prompt 1)

### O que foi feito
- Consolidada a base conceitual do app com **fontes reais e links**: Teoria
  Moderna do Portfólio (**Markowitz**, 1952 — diversificação e fronteira
  eficiente), **Suitability** (Resolução CVM 30/2021 — perfis conservador/
  moderado/agressivo), **FGC** (garantia de R$ 250 mil por CPF/instituição),
  **CDI e Selic** (a régua da renda fixa), **Tesouro Selic/LFT** (pós-fixado, base
  da reserva) e **IR regressivo** (22,5% → 15%, com LCI/LCA/poupança isentas).
- Registrados os termos no `GLOSSARIO.md` (Etapa 1) em linguagem simples, com
  analogia, o porquê no app e a fonte linkada.

### Decisões e o porquê
| Decisão | Por quê |
|---|---|
| Perfil-alvo = conservador | O app mira baixo risco; é o eixo que dá sentido à "aderência" |
| Separar fonte externa de convenção interna | Os rótulos de risco (muito baixo/baixo/médio) e a carteira-alvo são escolhas do projeto, calibradas pelas referências — fica explícito o que é o quê |

### Testes
- Nenhum ainda — a fundamentação não tem código; os testes começam no Prompt 2.

### Próximo passo
- Executar o **Prompt 2**: núcleo da lógica em funções puras + testes (Jest).

### Etapa 2 — Núcleo da lógica (Prompt 2)

### O que foi feito
- Criado `logica.js` com as **funções puras** do app: `nivelDeRisco`,
  `ehIsento`, `aliquotaIR`, `rendimentoBruto`, `impostoRegressivo`,
  `rendimentoLiquido`, `pesoNaCarteira` e `validarAporte`, com as constantes-fonte
  (`CATEGORIAS`, `RISCO_POR_CATEGORIA`, `NIVEIS_DE_RISCO`).
- Criado `logica.test.js` (Jest) com 24 casos, positivos e negativos, e
  `package.json` com `npm test`. Ainda **sem tela**.

### Decisões e o porquê
| Decisão | Por quê |
|---|---|
| Rendimento em % do CDI capitalizado por dias corridos sobre 365 | Simplificação didática: `dias` tem um significado só (o mesmo da tabela de IR), fica consistente e testável — documentado como convenção interna |
| IR sobre o **ganho**, com isenção para LCI/LCA/poupança | É o que faz o líquido, não o bruto, ser o número de comparação — um % do CDI menor pode render mais líquido |
| Nível de risco derivado da categoria (nunca digitado) | Valor derivado é cálculo, não achismo; a categoria é a única fonte |
| Erro em entrada inválida (categoria/prazo) em vez de retorno silencioso | O bug aparece já no teste, não vira conta errada escondida |
| Export dual (Node/Jest e `window.Logica`) | A mesma lógica serve os testes e a futura tela, sem duplicar |

### Testes
- **24 unitários passando** (E2E começa junto da primeira tela, no Prompt 3):
  tabela de IR nas bordas das faixas, bruto × líquido, isento × tributado,
  peso com carteira vazia e validação acumulando erros.
- Lint/format ainda não instalados — entram no **Prompt 2.5**.

### Próximo passo
- A escolher: **Prompt 2.5** (ferramental de qualidade) ou **Prompt 3**
  (primeira tela).

### Etapa 2.5 — Ferramental de qualidade de código (Prompt 2.5)

### O que foi feito
- Instaladas as dependências (`npm install`) e configurados **ESLint**
  (`.eslintrc.json`), **Prettier** (`.prettierrc.json`) e **Husky**, com os
  scripts `lint`/`format`/`prepare` no `package.json`.
- Criado o hook `.husky/pre-commit` (roda lint + format) e os arquivos de
  exclusão `.gitignore`, `.eslintignore` e `.prettierignore`.

### Decisões e o porquê
| Decisão | Por quê |
|---|---|
| Instalar o ferramental cedo (passo 2.5) | O padrão passa a valer em todas as etapas seguintes, não só no fim |
| Config idêntica ao projeto irmão (funil) | Mantém a mesma espinha entre os experimentos do repo |
| HTML e Markdown fora do Prettier (`.prettierignore`) | Slides e diários têm alinhamento/placar feitos à mão que o formatador quebraria |
| Pre-commit só lint + format (sem E2E) | Rápido e robusto; a suíte completa roda a cada prompt manualmente |

### Testes
- **24 unitários passando** (nada regrediu). `npm run lint` **sem erros** e
  `npm run format` **sem mudanças** (o código já estava no padrão).
- Observação: como a pasta fica **dentro** do repo `ia-na-pratica`, o Husky de
  subpasta não se auto-instala (avisa ".git can't be found"); o hook fica ativo
  quando o projeto vira repositório próprio (`git init`, no passo do README).

### Próximo passo
- **Prompt 3**: primeira tela (formulário de aporte + design tokens da inspiração
  visual + rodapé de contraste WCAG + teste de espaçamento + screenshot).

### Etapa 3 — Primeira tela + design tokens + contraste (Prompt 3)

### O que foi feito
- Criado `index.html`: header com "Reiniciar experiência", **formulário de novo
  aporte** (produto, categoria, valor, % do CDI, CDI anual, prazo em dias),
  **prévia ao vivo** (risco, bruto, IR, líquido, total) e **rodapé de contraste
  WCAG** que mede a paleta em tempo real.
- Inspiração visual escolhida pelo usuário: **XP Investimentos** (preto +
  amarelo). Design tokens (espaçamento/cores/raio/tipografia) em variáveis CSS.
- Adicionadas ao `logica.js` as funções puras de acessibilidade
  (`hexParaRgb`, `luminancia`, `razaoContraste`, `nivelWcag`) e de layout
  (`caixaContem`, `distanciaEntreCaixas`, `validarEspacamento`).
- Criados `playwright.config.js` e `e2e/app.spec.js`; screenshot em
  `screenshots/prompt3-primeira-tela.png`.

### Decisões e o porquê
| Decisão | Por quê |
|---|---|
| Inspiração XP (preto + amarelo) | Escolha do usuário; contraste forte casa com acessibilidade AAA |
| Prazo em "dias corridos" no formulário (em vez de duas datas) | Alimenta direto a função pura e a tabela de IR; datas entram no ciclo de status (Prompt 6) |
| Rodapé mede o contraste da paleta ao vivo | Acessibilidade vira número visível, não promessa — os 3 pares deram AAA |
| Espaçamento coberto por teste (folga > 0,5px) | "Nada colado" garantido por máquina, não só pelo olho |
| Tela só chama `window.Logica` | Zero regra de negócio no HTML: tudo testável na lógica pura |

### Testes
- **34 unitários + 6 E2E = 40 passando.** Novos: contraste (preto×branco ~21,
  paleta XP em AA, amarelo/branco reprova para texto miúdo) e espaçamento
  (colado/sobreposto reprova, pai/filho ignorado). E2E: carrega, prévia ao vivo,
  isento mostra "Isento", valor zero bloqueado, rodapé audita contraste, nenhum
  controle colado.
- `npm run lint` **sem erros**; `npm run format` **sem mudanças**.
- Revisão visual do screenshot: layout em grid sem quebra, componentes
  consistentes, respiro nas bordas, contraste AAA nos três pares.

### Próximo passo
- **Prompt 4**: persistência no localStorage (aportes sobrevivem ao recarregar).

### Etapa 4 — Persistência no localStorage (Prompt 4)

### O que foi feito
- O formulário agora **adiciona aportes à carteira**, salvos no `localStorage`
  (chave `rfc.aportes`) e recarregados ao reabrir o app.
- Nova seção "Sua carteira" com **contador** e lista mínima dos aportes; o botão
  "Reiniciar experiência" apaga a carteira (com confirmação).
- Adicionadas ao `logica.js` as funções puras `serializarAportes` e
  `desserializarAportes` (leitura blindada contra dado corrompido).
- Screenshot em `screenshots/prompt4-persistencia.png`.

### Decisões e o porquê
| Decisão | Por quê |
|---|---|
| Guardar só os campos de entrada; derivados recalculados ao renderizar | Rendimento/risco nunca ficam desatualizados nem são "digitados" |
| Leitura blindada (try/catch → lista vazia) | Um JSON corrompido não pode derrubar o app |
| Escapar o nome do produto antes de injetar no HTML | Evita quebra de layout / injeção com texto do usuário |
| "Reiniciar" apaga a carteira salva | O botão "zera o fluxo" de verdade — coerente com o header |

### Testes
- **39 unitários + 8 E2E = 47 passando.** Novos unitários: ida-e-volta da
  serialização, lista vazia/não-lista, texto ausente, JSON corrompido e descarte
  de lixo. Novos E2E: aporte persiste após recarregar; dado corrompido não quebra
  o app; valor zero não entra na carteira.
- `npm run lint` **sem erros**; `npm run format` **sem mudanças**.
- Revisão visual: carteira com dois aportes, respiro nas bordas, contraste AAA.

### Próximo passo
- **Prompt 5**: lista organizada por nível de risco (grupos com total e % da
  carteira).

### Etapa 5 — Lista organizada por nível de risco (Prompt 5)

### O que foi feito
- A carteira agora aparece **agrupada por nível de risco** (muito baixo → baixo →
  médio), cada grupo com **quantidade, soma e % da carteira**, e os itens
  **ordenados por valor** dentro do grupo. Grupos vazios não aparecem.
- Adicionadas ao `logica.js` as funções puras `totalCarteira`, `ordenarPorValor`
  e `agruparPorRisco`.
- Screenshot em `screenshots/prompt5-lista-por-risco.png`.

### Decisões e o porquê
| Decisão | Por quê |
|---|---|
| Agrupar por risco (não por categoria) | O objetivo do app é ver se a carteira é conservadora — risco é o eixo que responde isso |
| Peso % por grupo em destaque | Mostra a composição de relance (ex.: 86% em muito baixo + baixo) |
| Ordenar por valor = ordenar por peso | Peso é valor/total; evita cálculo redundante e mantém simples |
| `ordenarPorValor` não muta a lista | Função pura previsível; nada de efeito colateral em quem chama |

### Testes
- **45 unitários + 9 E2E = 54 passando.** Novos unitários: soma total, ordenação
  sem mutar, três grupos na ordem, quantidade/soma/peso do grupo, carteira vazia
  com pesos 0. Novo E2E: carteira agrupa por risco com pesos 75%/25%.
- `npm run lint` **sem erros**; `npm run format` **sem mudanças**.
- Revisão visual: grupos com cabeçalho e peso, itens alinhados, contraste AAA.

### Próximo passo
- **Prompt 6**: ciclo de status do aporte (Planejado → Aplicado → Resgatável →
  Resgatado, avança e volta um passo).

### Etapa 6 — Ciclo de status do aporte (Prompt 6)

### O que foi feito
- Cada aporte agora tem um **ciclo de status** (Planejado → Aplicado → Resgatável
  → Resgatado) com botões **Avançar/Voltar** por item; a transição para "Aplicado"
  e "Resgatado" carimba a data, e voltar limpa o carimbo.
- Funções puras `proximoStatus`, `statusAnterior`, `avancarAporte` e
  `voltarAporte` no `logica.js` (carimbo de data injetado de fora, sem mutar).
- **Complemento pedido pelo usuário:** carteira de **exemplo** (`DADOS_EXEMPLO`)
  que espelha a estrutura de uma carteira real (a partir dos prints em `docs/`),
  com valores fictícios/arredondados (LGPD); botão "Carregar carteira de exemplo".
- `docs/` (prints da carteira real) adicionado ao `.gitignore`.
- Screenshot em `screenshots/prompt6-ciclo-status.png`.

### Decisões e o porquê
| Decisão | Por quê |
|---|---|
| Data do carimbo vem da tela (`opts.agora`) | Mantém a função pura (mesma entrada → mesma saída) e testável |
| Botões desabilitados nos extremos | Torna impossível o beco sem saída, além de comunicá-lo visualmente |
| `id` por aporte (crypto.randomUUID) | Identifica o item para Avançar/Voltar mesmo após o agrupamento reordenar |
| Carteira de exemplo com valores fictícios | LGPD: usa só a estrutura da carteira real; nada de dado pessoal |
| `docs/` no .gitignore | Os prints têm valores reais — não devem subir ao repositório |

### Testes
- **55 unitários + 11 E2E = 66 passando.** Novos unitários: ordem do ciclo,
  limites (sem beco), status inválido, carimbo ao aplicar/resgatar, limpeza ao
  voltar, sem mutar. Novos E2E: aporte avança e volta; carregar exemplo popula e
  persiste.
- `npm run lint` **sem erros**; `npm run format` **sem mudanças**.
- Revisão visual: 8 aportes de exemplo em 3 grupos, badges de status, "Voltar"
  desabilitado nos planejados, contraste AAA.

### Próximo passo
- **Prompt 7**: dashboard com indicadores (patrimônio total, rendimento líquido
  projetado, aderência ao perfil conservador, alertas).

### Etapa 7 — Dashboard com indicadores (Prompt 7)

### O que foi feito
- Novo **painel no topo** com patrimônio total, rendimento líquido projetado,
  **aderência ao perfil conservador**, barras de **composição por risco** e
  **alertas** (risco médio acima do teto; aporte acima do teto do FGC).
- Funções puras `rendimentoLiquidoCarteira`, `aderenciaConservador` e
  `alertasCarteira` no `logica.js`, com as constantes `PERFIL_ALVO_CONSERVADOR`,
  `TETO_FGC` e `CATEGORIAS_FGC`.
- Screenshots em `screenshots/prompt7-dashboard.png` e `.../prompt7-dashboard-painel.png`.

### Decisões e o porquê
| Decisão | Por quê |
|---|---|
| Aderência pelo teto de risco médio (≤ 15%) | Um número simples e verificável para "está conservador?" — o eixo do app |
| Alerta de FGC só para categorias cobertas | Tesouro/Fundo não têm FGC; alertar neles seria errado |
| Alertas como objetos estruturados (tela formata) | Mantém a lógica pura e testável; o texto/idioma fica na interface |
| Um único ponto de render (`renderizarDashboard` dentro de `renderizarCarteira`) | Painel nunca fica dessincronizado da carteira |

### Testes
- **63 unitários + 12 E2E = 75 passando.** Novos unitários: soma do líquido da
  carteira, aderência dentro/fora do teto, alerta de risco médio, alerta de FGC e
  o caso em que Tesouro > 250k não gera FGC. Novo E2E: painel mostra patrimônio,
  vira "Fora do perfil" e exibe o alerta ao carregar o exemplo.
- `npm run lint` **sem erros**; `npm run format` **sem mudanças**.
- Revisão visual: cartões em grid responsivo, barras de composição, alerta
  vermelho legível, contraste preservado.

### Próximo passo
- **Prompt 8**: filtros/preferências persistidos (categoria, risco, horizonte e
  perfil-alvo).

### Etapa 8 — Filtros e preferências persistidas (Prompt 8)

### O que foi feito
- Barra de **filtros** (categoria, risco, horizonte) + seletor de **perfil-alvo**
  (conservador/moderado/agressivo), tudo salvo em `localStorage` (`rfc.prefs`) e
  reaplicado ao reabrir.
- O **perfil-alvo virou de verdade**: cada perfil tem um teto de risco médio
  (15%/30%/60%); a aderência e os alertas do dashboard passam a respeitar o perfil
  escolhido (rótulo dinâmico "Aderência ao perfil …").
- Funções puras `aderenciaPerfil`, `horizonteDoAporte` e `filtrarAportes` no
  `logica.js` (mais `PERFIS`, `TETO_RISCO_MEDIO`, `HORIZONTES`).
- Screenshot em `screenshots/prompt8-filtros.png`.

### Decisões e o porquê
| Decisão | Por quê |
|---|---|
| Perfil com teto de risco médio por nível | Torna "subir de perfil" concreto: a mesma carteira muda de status conforme o perfil |
| Filtro esconde itens mas mantém o peso do grupo real | A composição verdadeira não pode mudar só porque filtrei a visão |
| Prefs em chave separada (`rfc.prefs`) | Preferências não se misturam com os dados da carteira (`rfc.aportes`) |
| `aderenciaConservador` mantido como atalho | Não quebra a API/testes anteriores ao generalizar para `aderenciaPerfil` |

### Testes
- **72 unitários + 13 E2E = 85 passando.** Novos unitários: horizonte curto/médio/
  longo, filtro por categoria/risco/horizonte e combinado, perfil mais tolerante
  aceita mais risco, perfil inválido cai no conservador. Novo E2E: filtro por risco
  e perfil-alvo persistem após recarregar.
- `npm run lint` **sem erros**; `npm run format` **sem mudanças**.
- Revisão visual: barra de filtros alinhada, contador "N de M", aderência dinâmica
  por perfil, contraste AAA.

### Próximo passo
- **Prompt 9** (a rever com o novo rumo): ações destrutivas + "Reiniciar" — ou já
  um **simulador de melhoria de rentabilidade / dicas de rebalanceamento** (novo
  objetivo do usuário).

### Etapa 9 — Reformulação do conceito + Simulador de melhoria (Prompt 9)

### O que foi feito
- **Reformulação do conceito** (a pedido do usuário): o app passou a ser um
  **simulador de perfil com foco em aumentar a renda** — o `CLAUDE.md` (pitch,
  conceito central, resultado esperado) foi atualizado, ligando o objetivo de
  "mais retorno" à fronteira eficiente de Markowitz (subir de perfil de forma
  controlada).
- Novo cartão **"Como render mais 🚀"**: dicas de troca ordenadas pelo **ganho
  anual estimado** (ex.: sair de Poupança/CDB PRÉ fracos), com o **ganho total**
  no topo e uma nota sobre liquidez/objetivo/FGC.
- Funções puras `taxaLiquidaAnualizada`, `melhorAlvoMelhoria`,
  `sugestoesRebalanceamento` e `resumoMelhoria` no `logica.js` (alvos de
  referência: CDB DI 110% e LCI/LCA 97% isenta).
- Screenshots em `screenshots/prompt9-melhoria*.png`.

### Decisões e o porquê
| Decisão | Por quê |
|---|---|
| Comparar por rentabilidade ANUALIZADA | Única régua justa entre prazos diferentes |
| Alvo = melhor entre CDB 110% e LCI 97% isenta | O que importa é o líquido; a isenção às vezes ganha mesmo com % menor |
| Ordenar dicas pelo ganho em R$/ano | Foca a "próxima ação" de maior impacto primeiro |
| Nota de liquidez/objetivo/FGC no cartão | Rentabilidade não é tudo — evita induzir a mover a reserva de emergência |
| Manter o nome da pasta, reformular só o conceito | Evita quebrar caminhos/histórico; o pitch já comunica o novo foco |

### Testes
- **79 unitários + 15 E2E = 94 passando.** Novos unitários: taxa anualizada,
  aporte inválido, poupança vira dica, produto ótimo não vira dica, ordenação por
  ganho, resumo soma o total, carteira ótima sem dicas. Novos E2E: simulador
  sugere trocar produto fraco; carteira ótima "bem posicionada".
- `npm run lint` **sem erros**; `npm run format` **sem mudanças**.
- Revisão visual: cartão com resumo do ganho, dicas ordenadas, nota de ressalva,
  contraste preservado.

### Próximo passo
- **Prompt 10**: ações destrutivas (remover aporte) — e depois exportar/limpar
  (LGPD), acessibilidade/E2E e entregas finais.

### Etapa 10 — Ações destrutivas: remover aporte (Prompt 10)

### O que foi feito
- Cada item da carteira ganhou um botão **"Remover"** (estilo de perigo, vermelho)
  que **pede confirmação** antes de apagar; a remoção persiste no localStorage.
- Antes só dava para "Reiniciar" tudo — agora dá para tirar **um** aporte.
- Função pura `removerAporte(lista, id)` no `logica.js` (devolve nova lista, não muta).
- Screenshot em `screenshots/prompt10-remover.png`.

### Decisões e o porquê
| Decisão | Por quê |
|---|---|
| Remoção por `id`, não por índice | O agrupamento reordena os itens; o id é estável |
| Confirmação antes de remover | Ação destrutiva não pode ser acidental |
| `removerAporte` pura (nova lista) | Testável e sem efeito colateral; a tela cuida de salvar/redesenhar |
| Reaproveitar a delegação de eventos existente | Um único listener trata Voltar/Avançar/Remover |

### Testes
- **81 unitários + 16 E2E = 97 passando.** Novos unitários: remove o item certo
  sem mutar, id inexistente não muda nada. Novo E2E: cancelar mantém os 2 aportes;
  confirmar remove e persiste após recarregar.
- `npm run lint` **sem erros**; `npm run format` **sem mudanças**.
- Revisão visual: botão "Remover" em vermelho, alinhado aos demais, contraste OK.

### Próximo passo
- **Prompt 11**: exportar / limpar dados (LGPD) — exportar a carteira em JSON e
  apagar tudo com confirmação.

### Etapa 11 — Exportar / limpar dados (Prompt 11)

### O que foi feito
- Botão **"Exportar (JSON)"** no header: baixa a carteira + preferências como
  `carteira-renda-fixa.json` (o dado é do usuário — LGPD).
- O **"Reiniciar experiência"** já cobre o "limpar tudo" (zera carteira e prefs
  com confirmação) — cobrimos também por E2E.
- Funções puras `montarExportacao` e `exportarJson` no `logica.js` (data do export
  injetada de fora, para manter a função pura).
- Screenshot em `screenshots/prompt11-exportar.png`.

### Decisões e o porquê
| Decisão | Por quê |
|---|---|
| Exportar carteira + prefs num só JSON | Leva o estado completo (dados e preferências) de uma vez |
| Data do export vinda da tela (`hoje()`) | `montarExportacao`/`exportarJson` continuam puras e testáveis |
| Reaproveitar "Reiniciar" como "limpar tudo" | Evita dois botões com o mesmo efeito destrutivo |
| Download via Blob + link invisível | Baixa arquivo sem servidor, coerente com o app 100% no navegador |

### Testes
- **84 unitários + 18 E2E = 102 passando.** Novos unitários: montarExportacao
  embala carteira/prefs/versão, exportarJson volta ao objeto, dados ausentes viram
  vazio. Novos E2E: exportar baixa `carteira-renda-fixa.json`; reiniciar limpa tudo.
- `npm run lint` **sem erros**; `npm run format` **sem mudanças**.
- Revisão visual: header com "Exportar (JSON)" + "Reiniciar", alinhados e com respiro.

### Próximo passo
- **Prompt 12**: acessibilidade WCAG AA + E2E (Playwright) — passada de teclado/
  labels/foco e cobertura dos fluxos críticos.

### Etapa 12 — Acessibilidade WCAG AA + E2E (Prompt 12)

### O que foi feito
- **Skip-link** "Pular para o conteúdo" (aparece no Tab), regiões **`aria-live`**
  na prévia e no painel, e o rodapé de contraste passou a auditar **5 pares**
  (incluindo verde e vermelho sobre o cartão) — todos AA/AAA.
- E2E novos: skip-link/rótulos/contraste sem reprovação; navegação por teclado até
  "Adicionar"; **fluxo crítico** cadastrar → painel → filtrar → exportar.
- Screenshot em `screenshots/prompt12-contraste.png`.

### Decisões e o porquê
| Decisão | Por quê |
|---|---|
| Provar verde/vermelho no rodapé | Cores de status também precisam passar em AA, não só texto/fundo |
| `aria-live` em prévia/painel | Leitor de tela anuncia o número novo sem o usuário caçar |
| Skip-link | Quem usa teclado pula o cabeçalho e vai direto ao conteúdo |
| Fluxo crítico coberto ponta a ponta | Garante que o caminho principal nunca quebre silenciosamente |

### Testes
- **84 unitários + 21 E2E = 105 passando.** `npm run lint` limpo, `format` sem
  mudanças. Contraste: 19.8/13.09/9.22/9.03 AAA e 6.52 AA (alerta).

### Próximo passo
- **Prompt 13**: entregas finais (README + slides) — ou o **simulador de trocas
  com comparação antes/depois** pedido pelo usuário.

### Etapa 13 — Pivô "Render Mais" + carteira revisada + simulador de trocas (Prompt 13)

### O que foi feito
- **Pivô de conceito e nome:** o app deixou de ser "Renda Fixa Conservadora" e
  virou **"Render Mais"** — foco em **aumentar a rentabilidade** (trocas + futuro
  plano mensal), não em "ser conservador". Pasta renomeada para `render-mais`;
  `CLAUDE.md`, `index.html`, `package.json` e docs atualizados.
- **Carteira de exemplo revisada conforme os docs**, somando **R$ 88.344**
  (CDB ~35% · Títulos ~20,6% · Poupança ~19,8% · Fundos ~17,9% · Letras ~6,5%).
- **Simulador de trocas (antes × depois):** botão "Simular trocas" no fim do cartão
  "Como render mais" mostra rentabilidade média e renda/ano **antes → depois**, o
  **veredito** (aumenta ou não) e a lista das trocas. Funções puras
  `rentabilidadeMediaAnual`, `aplicarMelhorias`, `simularMelhoria`.
- Screenshot em `screenshots/prompt13-simular.png` (demais regenerados com a marca nova).

### Decisões e o porquê
| Decisão | Por quê |
|---|---|
| Renomear pasta + app para "Render Mais" | Pedido do usuário; o nome comunica o novo objetivo |
| Exemplo somando exatamente R$ 88.344 | Bater o total do perfil informado pelo usuário |
| Não modelar ações/multimercado | O app é de renda fixa; a fatia de renda variável fica de fora (avisado) |
| Simulação como "antes × depois" | Responde direto "isso aumenta minha rentabilidade?" |

### Testes
- **88 unitários + 22 E2E = 110 passando.** Novos unitários: rentabilidade média
  ponderada, aplicarMelhorias sem mutar, simular mostra ganho / sem ganho. Novo
  E2E: simular mostra antes × depois e o ganho.
- `npm run lint` **sem erros**; `npm run format` **sem mudanças**.

### Fatia faltando (aviso ao usuário)
- Os docs mostravam, dentro de FUNDOS, pequenas posições em **AÇÕES** (Bolsa Brasil
  ~R$ 81 + Globais ~R$ 50) e multimercado — **renda variável**, fora do escopo do
  app. O exemplo cobre só a **renda fixa**; por isso o total fica em ~R$ 88.344.

### Próximo passo
- **Plano mensal de aportes** (2ª alavanca do "Render Mais"): projetar o
  crescimento dos lucros por juros compostos — ou entregas finais (README + slides).

### Etapa 14 — Plano mensal (Prompt 14)

### O que foi feito
- 2ª alavanca do "Render Mais": card **"Plano mensal para crescer"** projeta, por
  **juros compostos**, quanto um aporte mensal vira em N anos (total investido,
  montante final, ganho). Taxa pré-preenchida com a rentabilidade média da carteira.
- Funções puras `taxaMensalDeAnual` e `projetarPlanoMensal`.

### Testes
- **115 (92 unit + 23 E2E).** Casos: conversão anual→mensal, montante > investido,
  taxa 0 = soma dos aportes, entradas inválidas zeram.

### Etapa 15 — Renda variável (Prompt 15)

### O que foi feito
- Incluída a fatia de **ações/multimercado** (que estava fora): categorias `acoes`
  (risco **alto**) e `multimercado` (médio); rendimento pela **rentabilidade
  esperada** informada (não há % do CDI). Formulário mostra o campo certo por
  categoria; exemplo passou a ter a parcela RV (total mantido R$ 88.344).
- Funções `ehRendaVariavel`, `rendimentoLiquidoDeAporte`; `aderenciaPerfil` agora
  soma médio + alto; RV não entra no rebalanceamento.

### Decisões e o porquê
| Decisão | Por quê |
|---|---|
| RV usa rentabilidade esperada (não % do CDI) | Renda variável não tem retorno garantido; o usuário estima |
| Ações = risco alto (novo nível) | Representa fielmente a volatilidade; entra na composição/aderência |
| RV fora das dicas de troca | É outra classe de ativo; não faz sentido "trocar por LCI" |

### Testes
- **123 (99 unit + 24 E2E).** Casos: nível de risco RV, rendimento por rentabilidade
  esperada, validação exige rentabilidade, RV fora das sugestões, grupo "alto".

### Etapa 16 — Entregas finais (Prompt 16)

### O que foi feito
- **`README.md`** (visão, como rodar/testar, arquitetura, tabela de funções, passo
  a passo git), **`slides.html`** (13 slides na paleta XP, capa com Tema +
  Inspiração) e **`tutorial.js`** — um **tutorial AO VIVO** (`npm run tutorial`)
  que abre o navegador e percorre o fluxo completo narrando cada função pura.

### Testes
- Suíte estável em **123 passando**; `tutorial.js` executado ponta a ponta.

### Próximo passo
- **Plano de Testes** (próximos casos priorizados) — o passo 13 do roteiro didático.

### Etapa 17 — Plano de Testes (Prompt 17)

### O que foi feito
- Criado `PLANO-DE-TESTES.md` com **12 casos** priorizados por risco (ALTA/MÉDIA/
  BAIXA), cada um com cenário **positivo e negativo**: de IR sobre ações,
  prejuízo em RV, come-cotas e FGC por instituição (alta) a edição de aporte,
  plano com patrimônio inicial e conteúdo do JSON (média), até responsividade
  360px, locale e teclado (baixa).
- Fecha o **roteiro didático (Setup 0 → 13)**. App entregue: fundamentado,
  testado (123 verdes), acessível, documentado, com README, slides e tutorial ao vivo.

### Próximo passo
- Executar os casos do `PLANO-DE-TESTES.md` conforme a prioridade — ou evoluir o
  produto (ex.: editar aporte, plano mensal com patrimônio inicial, gráfico de
  evolução).

### Etapa 18 — Dicas com risco e IR por troca (refinamento)

### O que foi feito
- Cada dica de "Como render mais" passou a mostrar a **mudança de risco** (⚠ em
  vermelho quando sobe; verde quando mantém/cai) e o **IR descontado hoje × no
  alvo** (com a economia de IR). Responde "qual risco eu assumo?" e "quanto de
  imposto muda?" por troca — e explica o "todos 97%" (a LCI isenta vence no líquido).
- `sugestoesRebalanceamento` agora devolve `riscoAtual`, `riscoAlvo`, `subiuRisco`,
  `irAtual`, `irAlvo` e `economiaIR`.

### Testes
- **101 unitários + 24 E2E = 125 passando.** Novos: a dica informa risco/IR;
  troca de mesmo nível não sobe o risco. Contraste do vermelho/verde no fundo da
  dica reverificado (AA/AAA).

### Etapa 19 — Apetite de risco + IR na renda variável

### O que foi feito
- **Toggle "Só trocas que não aumentam o risco"** no cartão (persistido em
  `rfc.prefs`): com ele ligado, só entram trocas de risco igual/menor — respeita o
  apetite e naturalmente diversifica o conjunto (some, ex., a troca do Tesouro).
- **IR na renda variável** (item ALTA do Plano de Testes): a RV passa a informar a
  rentabilidade esperada **bruta** e o app desconta o IR — **ações 15%**,
  **multimercado regressivo**; prejuízo não paga IR. Prévia da RV mostra o IR.
- Funções: `melhorAlvoMelhoria(aporte, {manterRisco})`, `sugestoesRebalanceamento`/
  `resumoMelhoria`/`aplicarMelhorias`/`simularMelhoria` aceitam `opts`;
  `impostoRendaVariavel`.

### Decisões e o porquê
| Decisão | Por quê |
|---|---|
| Toggle de "não subir risco" (em vez de fixar o alvo) | Respeita o apetite do usuário e mostra que, p/ produtos "muito baixo", não há alvo melhor sem subir risco |
| RV informa retorno BRUTO; app desconta IR | Deixa a rentabilidade comparável e o líquido correto (ações 15%, multi regressivo) |
| Sem isenção de R$ 20 mil/mês (ações) | Simplificação didática — anotada no Plano de Testes |

### Testes
- **105 unitários + 25 E2E = 130 passando.** Novos: ações 15% / multi regressivo /
  prejuízo sem IR; `manterRisco` remove trocas que sobem o risco (Tesouro sem dica,
  CDB PRÉ mantém); E2E do toggle persistindo após recarregar.

### Etapa 20 — Dividendos / renda passiva

### O que foi feito
- Card **"Renda passiva de dividendos"**: soma os dividendos esperados das ações
  (campo **DY esperado**, só para ações) — total por ano, por mês e a quebra por
  ativo. Funções `rendaDividendosAnual` e `rendaPassivaCarteira`.
- Dois alertas novos no painel: **DY alto demais** (> 15% → possível *yield trap*)
  e **concentração** (um aporte > 30% da carteira). Exemplo ganhou DY nas ações.

### Decisões e o porquê
| Decisão | Por quê |
|---|---|
| DY só para ações | Dividendo é atributo de ação; RF não tem |
| Alerta de DY > 15% | DY altíssimo costuma ser yield trap (educa o usuário) |
| Concentração por aporte > 30% | Risco de baque isolado; conversa com a diversificação de Markowitz |
| Renda passiva separada do rendimento | Dividendo é fluxo à parte do ganho de capital |

### Testes
- **111 unitários + 27 E2E = 138 passando.** Novos: renda anual = valor × DY, soma
  só ações com DY (anual/mensal/por ativo), alerta de DY alto e de concentração;
  E2E dos dividendos do exemplo e do alerta de yield trap.

### Etapa 21 — Meta de renda passiva + E2E das visões de risco

### O que foi feito
- **Meta de renda passiva** no card de dividendos: informe "quero R$ X/mês" e o DY
  médio; o app mostra **quanto precisa ter investido** e **quanto falta**
  (considerando a renda de dividendos atual). Função `metaRendaPassiva`.
- **E2E completo** (`e2e/simulacao-riscos.spec.js`) simulando três visões para
  aumentar a rentabilidade da carteira de ~R$ 88 mil:
  - **baixo risco** — só trocas que não sobem o risco;
  - **médio risco** — libera trocas que sobem um degrau (+ perfil moderado);
  - **alto risco** — acrescenta ações de maior retorno (+ perfil agressivo).
  Compara numericamente (via `window.Logica`) e confirma o fluxo na tela.

### Testes
- **114 unitários + 32 E2E = 146 passando.** Novos unitários: meta (capital
  necessário/falta/atingida). Novos E2E: comparação numérica das 3 visões, cada
  visão na tela, e a meta de R$ 1.000/mês ⇒ ~R$ 200 mil.

### Etapa 22 — Meta → plano (quanto aportar por mês)

### O que foi feito
- A **meta de renda passiva** virou plano de ação: dado o capital que falta e um
  prazo (anos), o app calcula **quanto aportar por mês** para chegar lá, rendendo a
  taxa do plano mensal (rentabilidade média da carteira). Ex.: ~R$ 200 mil em 10
  anos ≈ **R$ 967/mês**. Função pura `aporteMensalParaMeta` (inverso de
  `projetarPlanoMensal`), verificada por **round-trip** nos testes.

### Testes
- **117 unitários + 32 E2E = 149 passando.** Novos: round-trip aporte↔montante,
  sem juros = alvo/meses, entradas inválidas → 0; E2E da meta ligada ao plano.

### Etapa 23 — Simulador de cenários por npm script

### O que foi feito
- `simular.js` (headed, com servidor próprio): **7 cenários** narrados sobre a
  carteira default de R$ 88 mil, cada um uma situação de troca — **baixo**,
  **medio**, **alto**, **dividendos**, **plano**, **troca-poupanca** e **tudo**.
- Atalhos no `package.json`: `cenario:baixo` … `cenario:tudo` e
  `test:e2e:riscos`. Documentados no README. Cada passo narra a função pura por trás.

### Decisões e o porquê
| Decisão | Por quê |
|---|---|
| Um npm script por cenário | O usuário roda só a situação que quer aprender a simular |
| Headed + narração no terminal | Aprender vendo a tela mudar e sabendo a função por trás |
| Reusa o servidor próprio (como o tutorial) | `npm run cenario:*` funciona sem subir nada à parte |
| Cenário `troca-poupanca` concreto | Mostra o efeito real de uma troca (R$ 19.377 → R$ 20.830) |

### Testes
- Suíte estável em **149 passando**; cenário `troca-poupanca` executado ponta a
  ponta. Os cenários são scripts didáticos (não entram no `jest`/`playwright`).

### Etapa 24 — Painel de siglas + cenários de risco

### O que foi feito
- **Painel lateral "Siglas"** (botão no header, abre/fecha; acessível:
  `aria-expanded`, foco ao abrir/fechar, tecla Escape) com 17 legendas do sistema
  (CDB, CDI, LCI/LCA, FGC, DY, IR, RF/RV, WCAG…). Mesma referência no `GLOSSARIO.md`.
- Três cenários novos no `simular.js`: **fgc** (estoura o teto), **concentracao**
  (> 30% num produto) e **yield-trap** (DY absurdo), com atalhos `cenario:*`.

### Testes
- **117 unitários + 33 E2E = 150 passando.** Novo E2E: painel de siglas abre,
  mostra as legendas e fecha. `yield-trap` executado ponta a ponta.

### Etapa 25 — Fim da monocultura "tudo vira LCI/LCA"

### O que foi feito
- **Menu de alvos realista** no simulador de trocas: além de CDB e LCI/LCA,
  entraram **Tesouro IPCA+** (muito baixo, protege da inflação) e **debênture
  incentivada** (isenta, sem FGC, risco médio). O motor escolhe o melhor no
  líquido — então a dica agora **varia por prazo e apetite de risco**, em vez de
  cair sempre em LCI/LCA.
- Nova **categoria `debenture`** (isenta de IR pela Lei 12.431/2011, **sem FGC** →
  risco médio), no formulário, no filtro e nas siglas.
- **Blindagem da reserva** (`ehReservaEmergencia`): o Tesouro Selic (pós ~100% do
  CDI) não é mais sugerido para troca — liquidez vale mais que alguns reais/ano.
- **Piso de relevância** (R$ 50/ano): trocas de ganho irrisório somem da lista.
- Análise e decisões registradas em [`docs/analise-lci-lca.md`](docs/analise-lci-lca.md).

### Decisões e o porquê
| Decisão | Por quê |
|---|---|
| Alvo aceita `taxaAnual` além de `pctCDI` | Representar prefixado/IPCA+ sem sair da mesma função de rendimento (conversão pelo CDI do aporte) |
| Debênture = risco **médio**, sem FGC | Honestidade: crédito privado isento rende mais, mas não tem garantia do FGC |
| Blindar a reserva por padrão | Coerência com Markowitz/liquidez: não trocar a reserva de emergência por +R$/ano marginal |
| Manter o checkbox de risco **desmarcado** por padrão | Mostrar todas as oportunidades com "⚠ risco sobe" visível; o usuário decide/filtra |

### Testes
- **120 unitários + 33 E2E = 153 passando.** Novos casos: blindagem da reserva,
  piso de ganho irrisório, poupança → Tesouro IPCA+ (mesmo risco) e "prazo longo
  prefere CDB 118% à LCI". Testes de "produto ótimo" passaram a fixar `manterRisco`.
