// logica.test.js — testes das FUNÇÕES PURAS do app "Render Mais".
// Convenção: cada teste diz no nome se cobre o que DEVE funcionar (positivo) ou
// o que DEVE ser bloqueado/dar erro (negativo). Rode com: npm test

const {
  CATEGORIAS,
  nivelDeRisco,
  ehIsento,
  ehRendaVariavel,
  rendimentoLiquidoDeAporte,
  impostoRendaVariavel,
  aliquotaIR,
  rendimentoBruto,
  impostoRegressivo,
  rendimentoLiquido,
  pesoNaCarteira,
  validarAporte,
  hexParaRgb,
  luminancia,
  razaoContraste,
  nivelWcag,
  distanciaEntreCaixas,
  validarEspacamento,
  serializarAportes,
  desserializarAportes,
  montarExportacao,
  exportarJson,
  totalCarteira,
  ordenarPorValor,
  removerAporte,
  agruparPorRisco,
  proximoStatus,
  statusAnterior,
  avancarAporte,
  voltarAporte,
  rendimentoLiquidoCarteira,
  aderenciaConservador,
  aderenciaPerfil,
  alertasCarteira,
  rendaDividendosAnual,
  rendaPassivaCarteira,
  metaRendaPassiva,
  horizonteDoAporte,
  filtrarAportes,
  taxaLiquidaAnualizada,
  sugestoesRebalanceamento,
  resumoMelhoria,
  rentabilidadeMediaAnual,
  aplicarMelhorias,
  simularMelhoria,
  taxaMensalDeAnual,
  projetarPlanoMensal,
  aporteMensalParaMeta,
} = require('./logica');

// --- nivelDeRisco ----------------------------------------------------------

describe('nivelDeRisco', () => {
  test('(positivo) Tesouro e Poupança são risco muito baixo', () => {
    expect(nivelDeRisco('tesouro')).toBe('muito baixo');
    expect(nivelDeRisco('poupanca')).toBe('muito baixo');
  });

  test('(positivo) CDB e Letra são risco baixo; Fundo é médio', () => {
    expect(nivelDeRisco('cdb-di')).toBe('baixo');
    expect(nivelDeRisco('cdb-pre')).toBe('baixo');
    expect(nivelDeRisco('letra')).toBe('baixo');
    expect(nivelDeRisco('fundo')).toBe('médio');
  });

  test('(negativo) categoria desconhecida lança erro', () => {
    expect(() => nivelDeRisco('cripto')).toThrow(/desconhecida/i);
  });
});

// --- ehIsento --------------------------------------------------------------

describe('ehIsento', () => {
  test('(positivo) LCI/LCA (letra) e poupança são isentas de IR', () => {
    expect(ehIsento('letra')).toBe(true);
    expect(ehIsento('poupanca')).toBe(true);
  });

  test('(negativo) CDB e Tesouro NÃO são isentos', () => {
    expect(ehIsento('cdb-di')).toBe(false);
    expect(ehIsento('tesouro')).toBe(false);
  });
});

// --- aliquotaIR (tabela regressiva por dias corridos) ----------------------

describe('aliquotaIR', () => {
  test('(positivo) segue a tabela regressiva nas faixas', () => {
    expect(aliquotaIR(180)).toBe(0.225); // até 180
    expect(aliquotaIR(360)).toBe(0.2); // 181–360
    expect(aliquotaIR(720)).toBe(0.175); // 361–720
    expect(aliquotaIR(721)).toBe(0.15); // acima de 720
  });

  test('(positivo) respeita as bordas das faixas', () => {
    expect(aliquotaIR(181)).toBe(0.2);
    expect(aliquotaIR(361)).toBe(0.175);
  });

  test('(negativo) prazo zero ou negativo lança erro', () => {
    expect(() => aliquotaIR(0)).toThrow();
    expect(() => aliquotaIR(-5)).toThrow();
  });
});

// --- rendimentoBruto -------------------------------------------------------

describe('rendimentoBruto', () => {
  test('(positivo) 100% do CDI por 365 dias devolve o próprio CDI sobre o valor', () => {
    // pctCDI=1 e 365 dias recompõem exatamente o fator anual: 1000 * 10,65% = 106,50.
    expect(rendimentoBruto(1000, 1, 0.1065, 365)).toBeCloseTo(106.5, 2);
  });

  test('(positivo) 110% do CDI rende mais que 100% no mesmo prazo', () => {
    const cem = rendimentoBruto(1000, 1, 0.1065, 365);
    const centoDez = rendimentoBruto(1000, 1.1, 0.1065, 365);
    expect(centoDez).toBeGreaterThan(cem);
  });

  test('(negativo) valor, pctCDI ou dias inválidos lançam erro', () => {
    expect(() => rendimentoBruto(0, 1, 0.1065, 365)).toThrow();
    expect(() => rendimentoBruto(1000, -1, 0.1065, 365)).toThrow();
    expect(() => rendimentoBruto(1000, 1, 0.1065, 0)).toThrow();
  });
});

// --- impostoRegressivo -----------------------------------------------------

describe('impostoRegressivo', () => {
  test('(positivo) aplica a alíquota da faixa sobre o ganho', () => {
    // 100 de ganho em 200 dias (faixa 20%) => 20 de imposto.
    expect(impostoRegressivo(100, 200)).toBeCloseTo(20, 2);
  });

  test('(negativo) ganho zero ou negativo não gera imposto', () => {
    expect(impostoRegressivo(0, 365)).toBe(0);
    expect(impostoRegressivo(-50, 365)).toBe(0);
  });
});

// --- rendimentoLiquido -----------------------------------------------------

describe('rendimentoLiquido', () => {
  test('(positivo) produto tributado desconta o IR do ganho', () => {
    // Bruto 106,50 em 365 dias (faixa 17,5%): imposto 18,64 => líquido 87,86.
    const liquido = rendimentoLiquido(1000, 1, 0.1065, 365, 'cdb-di');
    expect(liquido).toBeCloseTo(87.86, 2);
  });

  test('(positivo) produto isento (letra) mantém o líquido igual ao bruto', () => {
    const bruto = rendimentoBruto(1000, 1, 0.1065, 365);
    const liquido = rendimentoLiquido(1000, 1, 0.1065, 365, 'letra');
    expect(liquido).toBeCloseTo(bruto, 2);
  });

  test('(positivo) isento rende mais líquido que tributado no mesmo cenário', () => {
    const tributado = rendimentoLiquido(1000, 1, 0.1065, 365, 'cdb-di');
    const isento = rendimentoLiquido(1000, 1, 0.1065, 365, 'letra');
    expect(isento).toBeGreaterThan(tributado);
  });
});

// --- pesoNaCarteira --------------------------------------------------------

describe('pesoNaCarteira', () => {
  test('(positivo) calcula a fração do aporte no total', () => {
    expect(pesoNaCarteira(250, 1000)).toBeCloseTo(0.25, 4);
  });

  test('(negativo) carteira vazia (total 0) devolve peso 0 sem quebrar', () => {
    expect(pesoNaCarteira(250, 0)).toBe(0);
  });
});

// --- validarAporte ---------------------------------------------------------

describe('validarAporte', () => {
  const valido = {
    produto: 'Tesouro Selic 2031',
    categoria: 'tesouro',
    valor: 5000,
    pctCDI: 1,
    dias: 365,
  };

  test('(positivo) aporte completo e correto é aceito', () => {
    expect(validarAporte(valido)).toEqual({ valido: true, erros: [] });
  });

  test('(negativo) valor zero/negativo é rejeitado', () => {
    const r = validarAporte({ ...valido, valor: 0 });
    expect(r.valido).toBe(false);
    expect(r.erros.length).toBeGreaterThan(0);
  });

  test('(negativo) categoria inválida é rejeitada', () => {
    const r = validarAporte({ ...valido, categoria: 'cripto' });
    expect(r.valido).toBe(false);
  });

  test('(negativo) produto sem nome é rejeitado', () => {
    const r = validarAporte({ ...valido, produto: '   ' });
    expect(r.valido).toBe(false);
  });

  test('(negativo) objeto vazio acumula vários erros', () => {
    const r = validarAporte({});
    expect(r.valido).toBe(false);
    expect(r.erros.length).toBeGreaterThan(1);
  });
});

// --- Sanidade da fonte da verdade ------------------------------------------

test('(positivo) toda categoria tem um nível de risco mapeado', () => {
  CATEGORIAS.forEach((cat) => {
    expect(typeof nivelDeRisco(cat)).toBe('string');
  });
});

// --- Contraste (acessibilidade WCAG) ---------------------------------------

describe('contraste de cores', () => {
  test('(positivo) hexParaRgb aceita #rgb e #rrggbb', () => {
    expect(hexParaRgb('#fff')).toEqual([255, 255, 255]);
    expect(hexParaRgb('#0a0a0a')).toEqual([10, 10, 10]);
  });

  test('(negativo) cor inválida lança erro', () => {
    expect(() => hexParaRgb('roxo')).toThrow(/inválida/i);
    expect(() => hexParaRgb('#12')).toThrow();
  });

  test('(positivo) preto × branco dá o contraste máximo (~21)', () => {
    expect(razaoContraste('#000000', '#ffffff')).toBeCloseTo(21, 0);
    expect(luminancia('#000000')).toBeCloseTo(0, 3);
    expect(luminancia('#ffffff')).toBeCloseTo(1, 3);
  });

  test('(positivo) nivelWcag classifica AAA / AA / reprovado', () => {
    expect(nivelWcag(21)).toBe('AAA');
    expect(nivelWcag(5)).toBe('AA');
    expect(nivelWcag(2)).toBe('reprovado');
  });

  test('(positivo) a paleta XP (texto branco em preto) passa em AA', () => {
    const razao = razaoContraste('#ffffff', '#0a0a0a');
    expect(nivelWcag(razao)).not.toBe('reprovado');
  });

  test('(negativo) amarelo sobre branco reprova para texto miúdo', () => {
    const razao = razaoContraste('#ffcc00', '#ffffff');
    expect(nivelWcag(razao)).toBe('reprovado');
  });
});

// --- Espaçamento entre elementos (nada colado) -----------------------------

describe('validarEspacamento', () => {
  const cx = (left, top, right, bottom) => ({ left, top, right, bottom });

  test('(positivo) elementos com folga > 0,5px passam', () => {
    const caixas = [
      { nome: 'a', caixa: cx(0, 0, 10, 10) },
      { nome: 'b', caixa: cx(20, 0, 30, 10) },
    ];
    expect(validarEspacamento(caixas).valido).toBe(true);
  });

  test('(negativo) elementos colados/sobrepostos reprovam', () => {
    const caixas = [
      { nome: 'a', caixa: cx(0, 0, 10, 10) },
      { nome: 'b', caixa: cx(10, 0, 20, 10) }, // encostado (folga 0)
    ];
    const r = validarEspacamento(caixas);
    expect(r.valido).toBe(false);
    expect(r.violacoes[0]).toMatchObject({ a: 'a', b: 'b' });
  });

  test('(positivo) par pai/filho é ignorado (contêm-se de propósito)', () => {
    const caixas = [
      { nome: 'pai', caixa: cx(0, 0, 100, 100) },
      { nome: 'filho', caixa: cx(10, 10, 90, 90) },
    ];
    expect(validarEspacamento(caixas).valido).toBe(true);
  });

  test('(positivo) distanciaEntreCaixas mede a folga corretamente', () => {
    expect(distanciaEntreCaixas(cx(0, 0, 10, 10), cx(20, 0, 30, 10))).toBe(10);
  });
});

// --- Persistência (serialização blindada) ----------------------------------

describe('serialização de aportes', () => {
  const aporte = { produto: 'Tesouro Selic 2031', categoria: 'tesouro', valor: 5000 };

  test('(positivo) ida e volta preserva a lista', () => {
    const texto = serializarAportes([aporte]);
    expect(desserializarAportes(texto)).toEqual([aporte]);
  });

  test('(positivo) lista vazia (ou não-lista) serializa como []', () => {
    expect(serializarAportes([])).toBe('[]');
    expect(serializarAportes(null)).toBe('[]');
  });

  test('(negativo) texto vazio ou ausente vira lista vazia', () => {
    expect(desserializarAportes('')).toEqual([]);
    expect(desserializarAportes(undefined)).toEqual([]);
  });

  test('(negativo) JSON corrompido não quebra — devolve lista vazia', () => {
    expect(desserializarAportes('{isto não é json')).toEqual([]);
  });

  test('(negativo) descarta itens que não são objeto (lixo)', () => {
    const texto = JSON.stringify([aporte, 42, 'x', null]);
    expect(desserializarAportes(texto)).toEqual([aporte]);
  });

  test('(positivo) montarExportacao embala carteira + prefs + versão', () => {
    const pac = montarExportacao([aporte], { perfil: 'moderado' }, '2026-07-14');
    expect(pac).toMatchObject({
      versao: 1,
      exportadoEm: '2026-07-14',
      aportes: [aporte],
      prefs: { perfil: 'moderado' },
    });
  });

  test('(positivo) exportarJson gera JSON válido que volta ao objeto', () => {
    const json = exportarJson([aporte], {}, '2026-07-14');
    expect(JSON.parse(json).aportes).toEqual([aporte]);
  });

  test('(negativo) exportação com dados ausentes vira lista/objeto vazios', () => {
    const pac = montarExportacao(null, null);
    expect(pac.aportes).toEqual([]);
    expect(pac.prefs).toEqual({});
  });
});

// --- Organização da carteira (agrupar por risco) ---------------------------

describe('organização da carteira', () => {
  const carteira = [
    { produto: 'Tesouro Selic', categoria: 'tesouro', valor: 8000 }, // muito baixo
    { produto: 'Poupança', categoria: 'poupanca', valor: 2000 }, // muito baixo
    { produto: 'CDB DI', categoria: 'cdb-di', valor: 6000 }, // baixo
    { produto: 'Fundo RF', categoria: 'fundo', valor: 4000 }, // médio
  ];

  test('(positivo) totalCarteira soma os valores', () => {
    expect(totalCarteira(carteira)).toBe(20000);
  });

  test('(positivo) totalCarteira de lista vazia/inválida é 0', () => {
    expect(totalCarteira([])).toBe(0);
    expect(totalCarteira(null)).toBe(0);
  });

  test('(positivo) ordenarPorValor coloca o maior primeiro (sem mutar)', () => {
    const original = [...carteira];
    const ordenada = ordenarPorValor(carteira);
    expect(ordenada.map((a) => a.valor)).toEqual([8000, 6000, 4000, 2000]);
    expect(carteira).toEqual(original); // não mutou
  });

  test('(positivo) agruparPorRisco monta os grupos na ordem certa', () => {
    const grupos = agruparPorRisco(carteira);
    expect(grupos.map((g) => g.nivel)).toEqual(['muito baixo', 'baixo', 'médio', 'alto']);
  });

  test('(positivo) grupo "muito baixo" soma, conta e pesa corretamente', () => {
    const grupos = agruparPorRisco(carteira);
    const mb = grupos.find((g) => g.nivel === 'muito baixo');
    expect(mb.quantidade).toBe(2);
    expect(mb.somaValor).toBe(10000);
    expect(mb.peso).toBeCloseTo(0.5, 4); // 10.000 / 20.000
    expect(mb.itens.map((a) => a.valor)).toEqual([8000, 2000]); // ordenado por valor
  });

  test('(positivo) removerAporte tira o item certo sem mutar a lista', () => {
    const lista = [
      { id: 'a', produto: 'A', categoria: 'tesouro', valor: 100 },
      { id: 'b', produto: 'B', categoria: 'cdb-di', valor: 200 },
    ];
    const nova = removerAporte(lista, 'a');
    expect(nova.map((x) => x.id)).toEqual(['b']);
    expect(lista).toHaveLength(2); // original intacta
  });

  test('(negativo) removerAporte com id inexistente não muda nada', () => {
    const lista = [{ id: 'a', produto: 'A', categoria: 'tesouro', valor: 100 }];
    expect(removerAporte(lista, 'zzz')).toHaveLength(1);
  });

  test('(positivo) carteira vazia gera grupos vazios com peso 0', () => {
    const grupos = agruparPorRisco([]);
    expect(grupos).toHaveLength(4);
    grupos.forEach((g) => {
      expect(g.quantidade).toBe(0);
      expect(g.somaValor).toBe(0);
      expect(g.peso).toBe(0);
    });
  });
});

// --- Ciclo de status do aporte ---------------------------------------------

describe('ciclo de status do aporte', () => {
  test('(positivo) proximo/anterior seguem a ordem', () => {
    expect(proximoStatus('planejado')).toBe('aplicado');
    expect(proximoStatus('aplicado')).toBe('resgatavel');
    expect(statusAnterior('resgatado')).toBe('resgatavel');
    expect(statusAnterior('aplicado')).toBe('planejado');
  });

  test('(positivo) não passa dos limites (sem beco sem saída)', () => {
    expect(proximoStatus('resgatado')).toBe('resgatado'); // já no fim
    expect(statusAnterior('planejado')).toBe('planejado'); // já no início
  });

  test('(negativo) status desconhecido lança erro', () => {
    expect(() => proximoStatus('inventado')).toThrow(/desconhecido/i);
  });

  test('(positivo) avançar para "aplicado" carimba a data de aplicação', () => {
    const aporte = { produto: 'CDB', status: 'planejado' };
    const novo = avancarAporte(aporte, { agora: '2026-07-14' });
    expect(novo.status).toBe('aplicado');
    expect(novo.aplicadoEm).toBe('2026-07-14');
    expect(aporte.status).toBe('planejado'); // não mutou o original
  });

  test('(positivo) avançar até "resgatado" carimba a data de resgate', () => {
    let a = { produto: 'CDB', status: 'resgatavel' };
    a = avancarAporte(a, { agora: '2026-08-01' });
    expect(a.status).toBe('resgatado');
    expect(a.resgatadoEm).toBe('2026-08-01');
  });

  test('(positivo) aporte sem status parte de "planejado"', () => {
    const novo = avancarAporte({ produto: 'CDB' });
    expect(novo.status).toBe('aplicado');
  });

  test('(negativo) avançar no fim não muda nada', () => {
    const aporte = { produto: 'CDB', status: 'resgatado', resgatadoEm: 'x' };
    expect(avancarAporte(aporte)).toBe(aporte);
  });

  test('(positivo) voltar de "aplicado" limpa a data de aplicação', () => {
    const aporte = { produto: 'CDB', status: 'aplicado', aplicadoEm: '2026-07-14' };
    const novo = voltarAporte(aporte);
    expect(novo.status).toBe('planejado');
    expect(novo.aplicadoEm).toBeUndefined();
  });

  test('(positivo) voltar de "resgatado" limpa a data de resgate', () => {
    const aporte = { produto: 'CDB', status: 'resgatado', resgatadoEm: '2026-08-01' };
    const novo = voltarAporte(aporte);
    expect(novo.status).toBe('resgatavel');
    expect(novo.resgatadoEm).toBeUndefined();
  });

  test('(negativo) voltar no início não muda nada', () => {
    const aporte = { produto: 'CDB', status: 'planejado' };
    expect(voltarAporte(aporte)).toBe(aporte);
  });
});

// --- Dashboard: indicadores da carteira ------------------------------------

describe('indicadores do dashboard', () => {
  const base = { pctCDI: 1, cdiAnual: 0.1065, dias: 365 };
  const conservadora = [
    { ...base, produto: 'Tesouro', categoria: 'tesouro', valor: 5000 }, // muito baixo
    { ...base, produto: 'CDB', categoria: 'cdb-di', valor: 4000 }, // baixo
    { ...base, produto: 'Fundo', categoria: 'fundo', valor: 1000 }, // médio (10%)
  ];
  const arriscada = [
    { ...base, produto: 'Tesouro', categoria: 'tesouro', valor: 5000 }, // muito baixo
    { ...base, produto: 'Fundo', categoria: 'fundo', valor: 5000 }, // médio (50%)
  ];

  test('(positivo) rendimentoLiquidoCarteira soma o líquido de cada aporte', () => {
    const esperado = conservadora.reduce((s, a) => s + rendimentoLiquidoCarteira([a]), 0);
    expect(rendimentoLiquidoCarteira(conservadora)).toBeCloseTo(esperado, 2);
  });

  test('(positivo) carteira vazia rende 0', () => {
    expect(rendimentoLiquidoCarteira([])).toBe(0);
  });

  test('(positivo) carteira com risco médio dentro do teto é aderente', () => {
    const a = aderenciaConservador(conservadora);
    expect(a.pesoMedio).toBeCloseTo(0.1, 4); // 1.000 de 10.000
    expect(a.aderente).toBe(true);
  });

  test('(negativo) carteira com risco médio acima do teto não é aderente', () => {
    const a = aderenciaConservador(arriscada);
    expect(a.pesoMedio).toBeCloseTo(0.5, 4);
    expect(a.aderente).toBe(false);
  });

  test('(positivo) carteira conservadora não gera alerta de risco nem de FGC', () => {
    const tipos = alertasCarteira(conservadora).map((a) => a.tipo);
    expect(tipos).not.toContain('risco-medio');
    expect(tipos).not.toContain('fgc');
  });

  test('(negativo) risco médio alto gera alerta "risco-medio"', () => {
    const alertas = alertasCarteira(arriscada);
    expect(alertas.some((x) => x.tipo === 'risco-medio')).toBe(true);
  });

  test('(negativo) aporte acima do teto do FGC gera alerta "fgc"', () => {
    const alertas = alertasCarteira([
      { ...base, produto: 'CDB Gigante', categoria: 'cdb-di', valor: 300000 },
    ]);
    expect(alertas.some((x) => x.tipo === 'fgc' && x.produto === 'CDB Gigante')).toBe(true);
  });

  test('(positivo) Tesouro acima de 250k NÃO gera alerta de FGC (não é FGC)', () => {
    const alertas = alertasCarteira([
      { ...base, produto: 'Tesouro Grande', categoria: 'tesouro', valor: 300000 },
    ]);
    expect(alertas.some((x) => x.tipo === 'fgc')).toBe(false);
  });

  test('(positivo) perfil mais tolerante aceita mais risco médio', () => {
    // 50% em médio: reprova no conservador (15%), passa no agressivo (60%).
    expect(aderenciaPerfil(arriscada, 'conservador').aderente).toBe(false);
    expect(aderenciaPerfil(arriscada, 'agressivo').aderente).toBe(true);
  });

  test('(positivo) perfil inválido cai no teto conservador', () => {
    expect(aderenciaPerfil(arriscada, 'xpto').teto).toBe(0.15);
  });

  test('(negativo) DY de ação alto demais gera alerta de yield trap', () => {
    const alertas = alertasCarteira([
      {
        produto: 'Ação DY 20%',
        categoria: 'acoes',
        valor: 1000,
        rentabilidadeAnual: 0.1,
        dyAnual: 0.2,
        dias: 365,
      },
    ]);
    expect(alertas.some((x) => x.tipo === 'dy-alto' && x.produto === 'Ação DY 20%')).toBe(true);
  });

  test('(negativo) aporte concentrado (> 30% da carteira) gera alerta', () => {
    const alertas = alertasCarteira([
      { ...base, produto: 'Gigante', categoria: 'cdb-di', valor: 8000 }, // 80%
      { ...base, produto: 'Pequeno', categoria: 'letra', valor: 2000 },
    ]);
    expect(alertas.some((x) => x.tipo === 'concentracao' && x.produto === 'Gigante')).toBe(true);
  });
});

// --- Dividendos / renda passiva --------------------------------------------

describe('renda passiva de dividendos', () => {
  test('(positivo) renda anual = valor × dividend yield', () => {
    expect(rendaDividendosAnual(10000, 0.08)).toBeCloseTo(800, 2);
  });

  test('(negativo) DY ou valor inválido rende 0', () => {
    expect(rendaDividendosAnual(0, 0.08)).toBe(0);
    expect(rendaDividendosAnual(10000, 0)).toBe(0);
  });

  test('(positivo) soma só as ações com DY e devolve anual/mensal/por ativo', () => {
    const carteira = [
      { produto: 'Itaú', categoria: 'acoes', valor: 10000, dyAnual: 0.06, dias: 365 },
      { produto: 'Taesa', categoria: 'acoes', valor: 5000, dyAnual: 0.1, dias: 365 },
      { produto: 'CDB', categoria: 'cdb-di', valor: 20000, pctCDI: 1, cdiAnual: 0.1065, dias: 365 },
    ];
    const r = rendaPassivaCarteira(carteira);
    expect(r.anual).toBeCloseTo(1100, 2); // 600 + 500
    expect(r.mensal).toBeCloseTo(91.67, 1);
    expect(r.quantidade).toBe(2);
    expect(r.porAtivo[0].produto).toBe('Itaú'); // maior renda primeiro (600 > 500)
  });

  test('(negativo) carteira sem ações com DY tem renda passiva 0', () => {
    const r = rendaPassivaCarteira([{ produto: 'CDB', categoria: 'cdb-di', valor: 1000 }]);
    expect(r.anual).toBe(0);
    expect(r.quantidade).toBe(0);
  });

  test('(positivo) metaRendaPassiva calcula o capital necessário e o que falta', () => {
    // R$ 1.000/mês (12k/ano) a 6% a.a. => precisa de 200k; já com 3k/ano, faltam 150k.
    const m = metaRendaPassiva(1000, 0.06, 3000);
    expect(m.capitalNecessario).toBeCloseTo(200000, 0);
    expect(m.capitalFalta).toBeCloseTo(150000, 0);
    expect(m.atingiu).toBe(false);
  });

  test('(positivo) meta já atingida não pede capital adicional', () => {
    const m = metaRendaPassiva(1000, 0.06, 20000); // 20k/ano > meta 12k/ano
    expect(m.atingiu).toBe(true);
    expect(m.capitalFalta).toBe(0);
  });

  test('(negativo) meta ou DY inválido zera o cálculo', () => {
    expect(metaRendaPassiva(0, 0.06).capitalNecessario).toBe(0);
    expect(metaRendaPassiva(1000, 0).capitalNecessario).toBe(0);
  });
});

// --- Filtros da carteira ---------------------------------------------------

describe('filtros da carteira', () => {
  const carteira = [
    { produto: 'Tesouro', categoria: 'tesouro', valor: 5000, dias: 365 }, // muito baixo, curto
    { produto: 'CDB DI', categoria: 'cdb-di', valor: 4000, dias: 600 }, // baixo, médio
    { produto: 'Fundo', categoria: 'fundo', valor: 1000, dias: 1000 }, // médio, longo
  ];

  test('(positivo) horizonteDoAporte classifica curto/médio/longo', () => {
    expect(horizonteDoAporte(365)).toBe('curto');
    expect(horizonteDoAporte(600)).toBe('medio');
    expect(horizonteDoAporte(1000)).toBe('longo');
  });

  test('(positivo) sem filtro devolve tudo', () => {
    expect(filtrarAportes(carteira, {})).toHaveLength(3);
  });

  test('(positivo) filtra por categoria', () => {
    const r = filtrarAportes(carteira, { categoria: 'cdb-di' });
    expect(r.map((a) => a.produto)).toEqual(['CDB DI']);
  });

  test('(positivo) filtra por risco', () => {
    const r = filtrarAportes(carteira, { risco: 'médio' });
    expect(r.map((a) => a.produto)).toEqual(['Fundo']);
  });

  test('(positivo) filtra por horizonte', () => {
    const r = filtrarAportes(carteira, { horizonte: 'curto' });
    expect(r.map((a) => a.produto)).toEqual(['Tesouro']);
  });

  test('(positivo) combina filtros (E lógico)', () => {
    expect(filtrarAportes(carteira, { risco: 'baixo', horizonte: 'curto' })).toEqual([]);
    expect(filtrarAportes(carteira, { risco: 'baixo', horizonte: 'medio' })).toHaveLength(1);
  });

  test('(negativo) lista inválida vira lista vazia', () => {
    expect(filtrarAportes(null, {})).toEqual([]);
  });
});

// --- Simulador de melhoria de rentabilidade --------------------------------

describe('simulador de melhoria', () => {
  const base = { cdiAnual: 0.1065, dias: 365 };
  const poupanca = {
    ...base,
    id: 'p1',
    produto: 'Poupança BB',
    categoria: 'poupanca',
    valor: 10000,
    pctCDI: 0.7,
  };
  const cdbBom = {
    ...base,
    id: 'c1',
    produto: 'CDB Ótimo',
    categoria: 'cdb-di',
    valor: 10000,
    pctCDI: 1.2,
  };

  test('(positivo) taxaLiquidaAnualizada dá ~% a.a. líquido', () => {
    // LCI isenta a 100% do CDI por 365 dias ~ 10,65% a.a.
    const lci = { ...base, categoria: 'letra', valor: 10000, pctCDI: 1 };
    expect(taxaLiquidaAnualizada(lci)).toBeCloseTo(0.1065, 3);
  });

  test('(positivo) aporte inválido (valor 0) rende taxa 0', () => {
    expect(taxaLiquidaAnualizada({ ...base, valor: 0, pctCDI: 1, categoria: 'tesouro' })).toBe(0);
  });

  test('(positivo) poupança (70% CDI) vira sugestão com ganho anual positivo', () => {
    const s = sugestoesRebalanceamento([poupanca]);
    expect(s).toHaveLength(1);
    expect(s[0].produto).toBe('Poupança BB');
    expect(s[0].ganhoAnual).toBeGreaterThan(0);
    expect(s[0].taxaAlvo).toBeGreaterThan(s[0].taxaAtual);
  });

  test('(negativo) um CDB já ótimo (120% CDI) NÃO gera sugestão', () => {
    expect(sugestoesRebalanceamento([cdbBom])).toEqual([]);
  });

  test('(positivo) sugestões vêm ordenadas pelo maior ganho', () => {
    const cdbPre = {
      ...base,
      produto: 'CDB PRÉ fraco',
      categoria: 'cdb-pre',
      valor: 20000,
      pctCDI: 0.9,
    };
    const s = sugestoesRebalanceamento([poupanca, cdbPre]);
    expect(s[0].ganhoAnual).toBeGreaterThanOrEqual(s[1].ganhoAnual);
  });

  test('(positivo) resumoMelhoria soma o ganho anual total', () => {
    const r = resumoMelhoria([poupanca]);
    expect(r.quantidade).toBe(1);
    expect(r.ganhoAnualTotal).toBeCloseTo(r.sugestoes[0].ganhoAnual, 2);
  });

  test('(positivo) carteira só com produtos ótimos não tem o que melhorar', () => {
    const r = resumoMelhoria([cdbBom]);
    expect(r.quantidade).toBe(0);
    expect(r.ganhoAnualTotal).toBe(0);
  });

  test('(positivo) a dica informa a mudança de risco e o IR descontado', () => {
    // Tesouro (muito baixo, tributado) -> LCI (baixo, isento).
    const tesouro = {
      ...base,
      id: 't1',
      produto: 'Tesouro Selic',
      categoria: 'tesouro',
      valor: 10000,
      pctCDI: 1,
    };
    const [s] = sugestoesRebalanceamento([tesouro]);
    expect(s.riscoAtual).toBe('muito baixo');
    expect(s.riscoAlvo).toBe('baixo');
    expect(s.subiuRisco).toBe(true); // a troca aumenta o risco
    expect(s.irAtual).toBeGreaterThan(0); // Tesouro paga IR hoje
    expect(s.irAlvo).toBe(0); // LCI/LCA é isenta
    expect(s.economiaIR).toBeCloseTo(s.irAtual, 2);
  });

  test('(negativo) troca de mesmo nível de risco não sobe o risco', () => {
    // CDB PRÉ (baixo) -> LCI (baixo).
    const cdbPre = {
      ...base,
      id: 'cp',
      produto: 'CDB PRÉ',
      categoria: 'cdb-pre',
      valor: 10000,
      pctCDI: 0.9,
    };
    const [s] = sugestoesRebalanceamento([cdbPre]);
    expect(s.riscoAtual).toBe('baixo');
    expect(s.subiuRisco).toBe(false);
  });

  test('(positivo) manterRisco: Tesouro (muito baixo) deixa de ter dica (só há alvo de maior risco)', () => {
    const tesouro = {
      ...base,
      id: 't1',
      produto: 'Tesouro Selic',
      categoria: 'tesouro',
      valor: 10000,
      pctCDI: 1,
    };
    expect(sugestoesRebalanceamento([tesouro])).toHaveLength(1); // sem restrição, sugere
    expect(sugestoesRebalanceamento([tesouro], { manterRisco: true })).toEqual([]); // com restrição, não
  });

  test('(positivo) manterRisco: CDB PRÉ (baixo) mantém a dica (alvo é do mesmo nível)', () => {
    const cdbPre = {
      ...base,
      id: 'cp',
      produto: 'CDB PRÉ',
      categoria: 'cdb-pre',
      valor: 10000,
      pctCDI: 0.9,
    };
    const s = sugestoesRebalanceamento([cdbPre], { manterRisco: true });
    expect(s).toHaveLength(1);
    expect(s[0].subiuRisco).toBe(false);
  });

  test('(positivo) aplicarMelhorias troca só os aportes com dica, sem mutar', () => {
    const lista = [poupanca, cdbBom];
    const depois = aplicarMelhorias(lista);
    expect(depois[0].categoria).not.toBe('poupanca'); // poupança foi trocada
    expect(depois[1]).toEqual(cdbBom); // o bom ficou igual
    expect(lista[0].categoria).toBe('poupanca'); // original intacta
  });

  test('(positivo) simularMelhoria mostra antes < depois quando há ganho', () => {
    const sim = simularMelhoria([poupanca]);
    expect(sim.melhora).toBe(true);
    expect(sim.rentDepois).toBeGreaterThan(sim.rentAntes);
    expect(sim.rendaAnualDepois).toBeGreaterThan(sim.rendaAnualAntes);
    expect(sim.ganhoAnual).toBeGreaterThan(0);
    expect(sim.trocas).toHaveLength(1);
  });

  test('(negativo) simularMelhoria sem dicas não muda nada (melhora=false)', () => {
    const sim = simularMelhoria([cdbBom]);
    expect(sim.melhora).toBe(false);
    expect(sim.ganhoAnual).toBe(0);
    expect(sim.rentDepois).toBeCloseTo(sim.rentAntes, 6);
  });

  test('(positivo) rentabilidadeMediaAnual pondera pelo valor', () => {
    // 100% em produto ótimo => média = taxa do produto ótimo
    const um = taxaLiquidaAnualizada(cdbBom);
    expect(rentabilidadeMediaAnual([cdbBom])).toBeCloseTo(um, 6);
  });
});

// --- Renda variável (ações / multimercado) ---------------------------------

describe('renda variável', () => {
  test('(positivo) ações é risco alto; multimercado é médio', () => {
    expect(nivelDeRisco('acoes')).toBe('alto');
    expect(nivelDeRisco('multimercado')).toBe('médio');
  });

  test('(positivo) ehRendaVariavel distingue RV de RF', () => {
    expect(ehRendaVariavel('acoes')).toBe(true);
    expect(ehRendaVariavel('multimercado')).toBe(true);
    expect(ehRendaVariavel('cdb-di')).toBe(false);
  });

  test('(positivo) ações descontam 15% de IR sobre o ganho', () => {
    // 10.000 a 12% a.a. por 365 dias => ganho ~1.200; líquido ~1.200 − 15% = ~1.020.
    const acao = { categoria: 'acoes', valor: 10000, rentabilidadeAnual: 0.12, dias: 365 };
    expect(rendimentoLiquidoDeAporte(acao)).toBeCloseTo(1020, 0);
  });

  test('(positivo) multimercado usa IR regressivo (como fundo)', () => {
    // 10.000 a 12% por 365 dias (faixa 17,5%): líquido ~1.200 − 17,5% = ~990.
    const mm = { categoria: 'multimercado', valor: 10000, rentabilidadeAnual: 0.12, dias: 365 };
    expect(rendimentoLiquidoDeAporte(mm)).toBeCloseTo(990, 0);
  });

  test('(negativo) prejuízo em RV não gera IR (líquido negativo)', () => {
    const acao = { categoria: 'acoes', valor: 10000, rentabilidadeAnual: -0.1, dias: 365 };
    const liq = rendimentoLiquidoDeAporte(acao);
    expect(liq).toBeLessThan(0); // prejuízo projetado
    expect(impostoRendaVariavel(liq, 365, 'acoes')).toBe(0); // sem IR sobre prejuízo
  });

  test('(negativo) RV sem rentabilidade informada é rejeitado na validação', () => {
    const r = validarAporte({ produto: 'Ação X', categoria: 'acoes', valor: 1000, dias: 365 });
    expect(r.valido).toBe(false);
    expect(r.erros.join(' ')).toMatch(/rentabilidade esperada/i);
  });

  test('(positivo) RV com rentabilidade informada é aceita', () => {
    const r = validarAporte({
      produto: 'Ação X',
      categoria: 'acoes',
      valor: 1000,
      rentabilidadeAnual: 0.12,
      dias: 365,
    });
    expect(r.valido).toBe(true);
  });

  test('(positivo) RV não entra nas sugestões de rebalanceamento', () => {
    const acao = {
      id: 'a',
      produto: 'Ação X',
      categoria: 'acoes',
      valor: 1000,
      rentabilidadeAnual: 0.02,
      dias: 365,
    };
    expect(sugestoesRebalanceamento([acao])).toEqual([]);
  });

  test('(positivo) grupo "alto" aparece na composição quando há ações', () => {
    const grupos = agruparPorRisco([
      { id: 'a', categoria: 'acoes', valor: 1000, rentabilidadeAnual: 0.1, dias: 365 },
    ]);
    const alto = grupos.find((g) => g.nivel === 'alto');
    expect(alto.quantidade).toBe(1);
  });
});

// --- Plano mensal de aportes (juros compostos) -----------------------------

describe('plano mensal', () => {
  test('(positivo) taxaMensalDeAnual converte corretamente (12 meses compõem o ano)', () => {
    const i = taxaMensalDeAnual(0.1);
    expect(Math.pow(1 + i, 12) - 1).toBeCloseTo(0.1, 6);
  });

  test('(positivo) com juros, o montante final supera o total investido', () => {
    const p = projetarPlanoMensal(500, 0.1065, 24);
    expect(p.totalInvestido).toBe(12000); // 500 × 24
    expect(p.montanteFinal).toBeGreaterThan(p.totalInvestido);
    expect(p.ganho).toBeCloseTo(p.montanteFinal - p.totalInvestido, 2);
  });

  test('(positivo) taxa 0 devolve exatamente a soma dos aportes (sem juros)', () => {
    const p = projetarPlanoMensal(500, 0, 24);
    expect(p.montanteFinal).toBe(12000);
    expect(p.ganho).toBe(0);
  });

  test('(negativo) aporte ou prazo inválido zera a projeção', () => {
    expect(projetarPlanoMensal(0, 0.1, 12)).toEqual({
      totalInvestido: 0,
      montanteFinal: 0,
      ganho: 0,
    });
    expect(projetarPlanoMensal(500, 0.1, 0).montanteFinal).toBe(0);
  });

  test('(positivo) aporteMensalParaMeta é o inverso de projetarPlanoMensal (round-trip)', () => {
    const montante = projetarPlanoMensal(500, 0.1065, 120).montanteFinal;
    // dado o montante alvo, o aporte necessário volta a ~500/mês
    expect(aporteMensalParaMeta(montante, 0.1065, 120)).toBeCloseTo(500, 0);
  });

  test('(positivo) sem juros, o aporte é o alvo dividido pelos meses', () => {
    expect(aporteMensalParaMeta(12000, 0, 12)).toBe(1000);
  });

  test('(negativo) alvo ou prazo inválido devolve 0', () => {
    expect(aporteMensalParaMeta(0, 0.1, 12)).toBe(0);
    expect(aporteMensalParaMeta(10000, 0.1, 0)).toBe(0);
  });
});
