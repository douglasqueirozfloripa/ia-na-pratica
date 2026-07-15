# Plano de Testes — Render Mais

> **Para que serve:** mapear os **próximos** testes (além dos 123 já verdes) que
> mais reduzem risco no app. Ordenado por **prioridade** (alta → baixa). Cada item
> traz o **cenário positivo** (deve funcionar) e o **negativo** (deve ser
> bloqueado/tratado). Convenção mantida: unitários no Jest sobre `logica.js`, E2E
> no Playwright por `data-testid`.

## Cobertura atual (resumo)

- **99 unitários + 24 E2E = 123 passando.** Já cobrem: rendimento (RF e RV), IR
  regressivo, risco/composição, aderência por perfil, dicas + simulação de trocas,
  plano mensal, filtros/preferências, ciclo de status, persistência, export,
  contraste/espaçamento e o fluxo crítico.
- **Lacunas conhecidas** (viram teste + código nesta ordem):

## Prioridade ALTA (correção do cálculo / risco financeiro)

1. **IR sobre renda variável** — ✅ **FEITO** (a RV agora informa a rentabilidade
   esperada **bruta** e o app desconta o IR): ações **15%** fixo, multimercado
   **regressivo**. Coberto por: _(positivo)_ ação com ganho desconta 15%;
   _(positivo)_ multimercado usa a tabela regressiva; _(negativo)_ prejuízo não
   gera IR. Próximo refino possível: isenção de R$ 20 mil/mês em ações.
2. **Rentabilidade negativa em RV (prejuízo)** — `rendimentoLiquidoDeAporte` com
   `rentabilidadeAnual` negativa:
   - _(positivo)_ devolve valor negativo (prejuízo projetado);
   - _(negativo)_ a tela mostra o número em vermelho, sem quebrar o painel.
3. **Come-cotas nos fundos** — não modelado. Ao incluir:
   - _(positivo)_ fundo tributado sofre o adiantamento semestral;
   - _(negativo)_ LCI/LCA/poupança nunca sofrem come-cotas.
4. **Alerta de FGC no total por instituição** — hoje o alerta olha aporte a aporte;
   o teto é por **CPF e instituição**:
   - _(positivo)_ dois CDBs do mesmo banco somando > R$ 250 mil alertam;
   - _(negativo)_ mesma soma em instituições diferentes não alerta.

## Prioridade MÉDIA (usabilidade / fluxos ausentes)

5. **Editar um aporte** (só existe adicionar/remover):
   - _(positivo)_ editar valor recalcula rendimento e composição;
   - _(negativo)_ edição inválida (valor 0) é bloqueada, aporte original mantido.
6. **Plano mensal com patrimônio inicial** — combinar aporte mensal + valor já
   investido:
   - _(positivo)_ montante final soma a projeção do inicial com juros;
   - _(negativo)_ inicial negativo é tratado como 0.
7. **Simular trocas sem dicas** — carteira já ótima:
   - _(positivo)_ o botão "Simular" fica escondido e o resumo diz "bem posicionada";
   - _(negativo)_ nenhum resultado de simulação é exibido.
8. **Persistência do perfil após reiniciar** — E2E:
   - _(positivo)_ perfil volta a "conservador" após "Reiniciar experiência";
   - _(negativo)_ pref corrompida em `rfc.prefs` cai no padrão sem quebrar.
9. **Conteúdo do JSON exportado** — E2E lendo o download:
   - _(positivo)_ o arquivo contém os aportes e o `versao: 1`;
   - _(negativo)_ carteira vazia exporta `aportes: []` válido.

## Prioridade BAIXA (robustez / apresentação)

10. **Responsividade a 360px** — E2E com viewport estreito:
    - _(positivo)_ cartões do painel/carteira empilham sem estourar (reusar
      `validarEspacamento`);
    - _(negativo)_ nenhum controle "raspa" a borda.
11. **Números grandes / locale** — valores na casa dos milhões:
    - _(positivo)_ formatação `pt-BR` com separador correto;
    - _(negativo)_ `NaN`/`Infinity` nunca aparecem na tela.
12. **Navegação por teclado completa** — ordem de foco e ativação por Enter em
    todos os botões de ação (Avançar/Voltar/Remover/Exportar).

## Como executar

```bash
npm test            # unitários
npm run test:e2e    # E2E (Playwright)
npm run tutorial    # fluxo ao vivo (não é teste, mas valida a jornada)
```

> Regra do projeto: **todo prompt que altera código roda a suíte e reporta o
> placar**; prompts de tela também geram screenshot. Um item deste plano só sai da
> lista quando entra **com teste positivo e negativo** e a suíte segue verde.
