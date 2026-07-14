// logica.test.js — testes das funções puras do "Funil" (Jest).
// Convenção do projeto: cada teste diz (positivo) = o que DEVE funcionar,
// ou (negativo) = o que DEVE ser bloqueado/dar erro.
// Cobre: logica.js

const {
  ETAPAS,
  probabilidadeDaEtapa,
  pontuarQualificacao,
  probabilidadeDeFechamento,
  valorPonderado,
  validarNegocio,
  luminancia,
  razaoContraste,
  nivelWcag,
  caixaContem,
  distanciaEntreCaixas,
  validarEspacamento,
  serializarNegocios,
  desserializarNegocios,
  ordenarPorValorPonderado,
  agruparPorEtapa,
  proximaEtapa,
  etapaAnterior,
  avancarNegocio,
  voltarNegocio,
  probabilidadeDoNegocio,
  valorPonderadoDoNegocio,
  montarExportacao,
  exportarJson,
} = require('./logica');

// Atalho para montar uma caixa (formato do getBoundingClientRect).
const cx = (left, top, right, bottom) => ({ left, top, right, bottom });

describe('probabilidadeDaEtapa', () => {
  test('(positivo) cada etapa tem sua probabilidade-base e ela cresce ao descer o funil', () => {
    expect(probabilidadeDaEtapa('lead')).toBe(0.1);
    expect(probabilidadeDaEtapa('qualificacao')).toBe(0.25);
    expect(probabilidadeDaEtapa('proposta')).toBe(0.5);
    expect(probabilidadeDaEtapa('negociacao')).toBe(0.75);
    expect(probabilidadeDaEtapa('fechado')).toBe(1);
  });

  test('(negativo) etapa desconhecida lança erro em vez de calcular errado', () => {
    expect(() => probabilidadeDaEtapa('lançamento')).toThrow(/Etapa desconhecida/);
    expect(() => probabilidadeDaEtapa('')).toThrow();
  });
});

describe('pontuarQualificacao (BANT)', () => {
  test('(positivo) conta de 0 a 4 os critérios atendidos', () => {
    expect(pontuarQualificacao({ orcamento: true, autoridade: true, necessidade: true, prazo: true })).toBe(4);
    expect(pontuarQualificacao({ orcamento: true, necessidade: true })).toBe(2);
    expect(pontuarQualificacao({})).toBe(0);
  });

  test('(positivo) chaves desconhecidas são ignoradas (só BANT conta)', () => {
    expect(pontuarQualificacao({ orcamento: true, foo: true, bar: true })).toBe(1);
  });

  test('(negativo) entrada ausente ou não-objeto conta como 0 (não quebra)', () => {
    expect(pontuarQualificacao(undefined)).toBe(0);
    expect(pontuarQualificacao(null)).toBe(0);
    expect(pontuarQualificacao('sim')).toBe(0);
  });
});

describe('probabilidadeDeFechamento (etapa + BANT)', () => {
  test('(positivo) sem BANT, usa só a base da etapa', () => {
    expect(probabilidadeDeFechamento('proposta', undefined)).toBe(0.5);
  });

  test('(positivo) o BANT empurra a chance para cima (5% por critério)', () => {
    // proposta (0.50) + 4 critérios × 0.05 = 0.70
    const bantCompleto = { orcamento: true, autoridade: true, necessidade: true, prazo: true };
    expect(probabilidadeDeFechamento('proposta', bantCompleto)).toBe(0.7);
    // lead (0.10) + 2 critérios × 0.05 = 0.20
    expect(probabilidadeDeFechamento('lead', { orcamento: true, prazo: true })).toBe(0.2);
  });

  test('(positivo) nunca passa de 100% e "fechado" fica em 100% mesmo sem BANT', () => {
    const bantCompleto = { orcamento: true, autoridade: true, necessidade: true, prazo: true };
    // negociacao (0.75) + 0.20 = 0.95 (não estoura 1)
    expect(probabilidadeDeFechamento('negociacao', bantCompleto)).toBe(0.95);
    expect(probabilidadeDeFechamento('fechado', {})).toBe(1);
  });
});

describe('valorPonderado', () => {
  test('(positivo) é valor × probabilidade de fechamento', () => {
    // 10.000 × 0.50 (proposta, sem BANT) = 5.000
    expect(valorPonderado(10000, 'proposta', undefined)).toBe(5000);
    // 10.000 × 0.70 (proposta + BANT completo) = 7.000
    const bantCompleto = { orcamento: true, autoridade: true, necessidade: true, prazo: true };
    expect(valorPonderado(10000, 'proposta', bantCompleto)).toBe(7000);
  });

  test('(positivo) arredonda dinheiro para 2 casas', () => {
    // 999.99 × 0.25 (qualificacao) = 249.9975 -> 250.00
    expect(valorPonderado(999.99, 'qualificacao', undefined)).toBe(250);
  });

  test('(negativo) valor zero, negativo ou não-numérico lança erro', () => {
    expect(() => valorPonderado(0, 'proposta')).toThrow(/Valor inválido/);
    expect(() => valorPonderado(-100, 'proposta')).toThrow(/Valor inválido/);
    expect(() => valorPonderado('mil', 'proposta')).toThrow(/Valor inválido/);
  });
});

describe('validarNegocio', () => {
  test('(positivo) negócio completo é válido, sem erros', () => {
    const negocio = { nome: 'Clínica Sorriso', valor: 4500, etapa: 'qualificacao' };
    expect(validarNegocio(negocio)).toEqual({ valido: true, erros: [] });
  });

  test('(negativo) sem nome é rejeitado', () => {
    const r = validarNegocio({ nome: '   ', valor: 4500, etapa: 'lead' });
    expect(r.valido).toBe(false);
    expect(r.erros).toContain('Informe o nome do negócio ou contato.');
  });

  test('(negativo) valor zero ou negativo é rejeitado', () => {
    expect(validarNegocio({ nome: 'X', valor: 0, etapa: 'lead' }).valido).toBe(false);
    expect(validarNegocio({ nome: 'X', valor: -1, etapa: 'lead' }).valido).toBe(false);
  });

  test('(negativo) etapa inválida é rejeitada', () => {
    const r = validarNegocio({ nome: 'X', valor: 100, etapa: 'ganhou' });
    expect(r.valido).toBe(false);
    expect(r.erros.some((e) => e.includes('etapa'))).toBe(true);
  });

  test('(negativo) objeto vazio acumula os três erros de uma vez', () => {
    const r = validarNegocio({});
    expect(r.valido).toBe(false);
    expect(r.erros).toHaveLength(3);
  });
});

describe('contraste WCAG (acessibilidade)', () => {
  test('(positivo) luminância vai de 0 (preto) a 1 (branco)', () => {
    expect(luminancia('#000000')).toBe(0);
    expect(luminancia('#ffffff')).toBe(1);
  });

  test('(positivo) preto × branco dá o contraste máximo de 21:1', () => {
    expect(razaoContraste('#000000', '#ffffff')).toBe(21);
  });

  test('(positivo) aceita atalho de 3 dígitos (#fff = #ffffff)', () => {
    expect(razaoContraste('#000', '#fff')).toBe(21);
  });

  test('(positivo) nivelWcag classifica pelos limites certos', () => {
    expect(nivelWcag(21)).toBe('AAA'); // >= 7
    expect(nivelWcag(5)).toBe('AA'); // >= 4.5 e < 7
    expect(nivelWcag(2)).toBe('reprovado'); // < 4.5
    expect(nivelWcag(3.5, true)).toBe('AA'); // texto grande afrouxa (>= 3)
  });

  test('(negativo) cor em formato inválido lança erro', () => {
    expect(() => razaoContraste('verde', '#fff')).toThrow(/Cor inválida/);
    expect(() => luminancia('#12')).toThrow(/Cor inválida/);
  });
});

describe('espaçamento de layout (guarda contra elementos colados)', () => {
  test('(positivo) distância mede folga entre caixas separadas', () => {
    // b começa 8px à direita de a
    expect(distanciaEntreCaixas(cx(0, 0, 100, 40), cx(108, 0, 200, 40))).toBe(8);
    // separadas na diagonal (3px em x, 4px em y) => hipotenusa 5
    expect(distanciaEntreCaixas(cx(0, 0, 100, 100), cx(103, 104, 200, 200))).toBe(5);
  });

  test('(negativo) caixas encostadas dão 0 e sobrepostas dão negativo', () => {
    expect(distanciaEntreCaixas(cx(0, 0, 100, 40), cx(100, 0, 200, 40))).toBe(0); // encostadas
    expect(distanciaEntreCaixas(cx(0, 0, 100, 40), cx(90, 0, 200, 40))).toBeLessThan(0); // sobrepostas
  });

  test('(positivo) caixaContem identifica pai/filho', () => {
    expect(caixaContem(cx(0, 0, 100, 100), cx(10, 10, 90, 90))).toBe(true);
    expect(caixaContem(cx(10, 10, 90, 90), cx(0, 0, 100, 100))).toBe(false);
  });

  test('(positivo) elementos com folga > 0,5px passam', () => {
    const caixas = [
      { nome: 'campo', caixa: cx(0, 0, 100, 40) },
      { nome: 'botao', caixa: cx(0, 56, 100, 96) }, // 16px abaixo
    ];
    expect(validarEspacamento(caixas)).toEqual({ valido: true, minPx: 0.5, violacoes: [] });
  });

  test('(negativo) elemento colado (gap 0) vira violação', () => {
    const caixas = [
      { nome: 'bant', caixa: cx(0, 0, 100, 40) },
      { nome: 'botao', caixa: cx(0, 40, 100, 80) }, // encostado no de cima
    ];
    const r = validarEspacamento(caixas);
    expect(r.valido).toBe(false);
    expect(r.violacoes).toEqual([{ a: 'bant', b: 'botao', distancia: 0 }]);
  });

  test('(negativo) folga de 0,3px ainda é violação; 0,6px passa', () => {
    expect(validarEspacamento([
      { nome: 'a', caixa: cx(0, 0, 100, 40) },
      { nome: 'b', caixa: cx(100.3, 0, 200, 40) },
    ]).valido).toBe(false);
    expect(validarEspacamento([
      { nome: 'a', caixa: cx(0, 0, 100, 40) },
      { nome: 'b', caixa: cx(100.6, 0, 200, 40) },
    ]).valido).toBe(true);
  });

  test('(positivo) pai/filho (contido) é ignorado, não é falso positivo', () => {
    const caixas = [
      { nome: 'rotulo', caixa: cx(0, 0, 100, 40) },
      { nome: 'checkbox', caixa: cx(8, 12, 24, 28) }, // dentro do rótulo
    ];
    expect(validarEspacamento(caixas).valido).toBe(true);
  });
});

describe('persistência (serializar / ler com segurança)', () => {
  const lista = [
    { id: 'a1', nome: 'Clínica Sorriso', valor: 4500, etapa: 'proposta', bant: { orcamento: true } },
    { id: 'b2', nome: 'Studio Bem-Estar', valor: 12000, etapa: 'lead', bant: {} },
  ];

  test('(positivo) ida e volta preserva a lista (round-trip)', () => {
    expect(desserializarNegocios(serializarNegocios(lista))).toEqual(lista);
  });

  test('(positivo) lista ausente serializa como "[]"', () => {
    expect(serializarNegocios(undefined)).toBe('[]');
    expect(serializarNegocios(null)).toBe('[]');
  });

  test('(negativo) texto ausente/vazio vira lista vazia (não quebra)', () => {
    expect(desserializarNegocios(null)).toEqual([]);
    expect(desserializarNegocios('')).toEqual([]);
    expect(desserializarNegocios('   ')).toEqual([]);
  });

  test('(negativo) JSON corrompido vira lista vazia (não quebra o app)', () => {
    expect(desserializarNegocios('{isto não é json')).toEqual([]);
    expect(desserializarNegocios('[{"nome": "X"')).toEqual([]);
  });

  test('(negativo) conteúdo que não é lista de objetos é descartado', () => {
    expect(desserializarNegocios('"só um texto"')).toEqual([]);
    expect(desserializarNegocios('{"nome":"X"}')).toEqual([]); // objeto, não lista
    expect(desserializarNegocios('[1, 2, "x"]')).toEqual([]); // lista sem objetos
  });
});

describe('organização da lista (agrupar / ordenar)', () => {
  // Negócios de exemplo (dados fictícios — LGPD).
  const pequeno = { id: '1', nome: 'Pequeno', valor: 1000, etapa: 'proposta', bant: {} }; // 1000×0,50 = 500
  const grande = { id: '2', nome: 'Grande', valor: 4000, etapa: 'proposta', bant: {} }; // 4000×0,50 = 2000
  const lead = { id: '3', nome: 'Lead novo', valor: 9000, etapa: 'lead', bant: {} }; // 9000×0,10 = 900

  test('(positivo) ordena do maior para o menor valor ponderado', () => {
    const ordenada = ordenarPorValorPonderado([pequeno, grande]);
    expect(ordenada.map((n) => n.id)).toEqual(['2', '1']);
  });

  test('(positivo) não altera a lista original (função pura)', () => {
    const original = [pequeno, grande];
    ordenarPorValorPonderado(original);
    expect(original.map((n) => n.id)).toEqual(['1', '2']);
  });

  test('(positivo) agrupa por etapa na ordem oficial, com quantidade e soma de valor', () => {
    const grupos = agruparPorEtapa([pequeno, grande, lead]);
    expect(grupos.map((g) => g.etapa)).toEqual(['lead', 'qualificacao', 'proposta', 'negociacao', 'fechado']);
    const proposta = grupos.find((g) => g.etapa === 'proposta');
    expect(proposta.quantidade).toBe(2);
    expect(proposta.somaValor).toBe(5000); // 1000 + 4000
    expect(proposta.itens.map((n) => n.id)).toEqual(['2', '1']); // ordenado por ponderado
    const leadGrp = grupos.find((g) => g.etapa === 'lead');
    expect(leadGrp.quantidade).toBe(1);
  });

  test('(negativo/borda) lista vazia gera as 5 etapas, todas zeradas', () => {
    const grupos = agruparPorEtapa([]);
    expect(grupos).toHaveLength(5);
    expect(grupos.every((g) => g.quantidade === 0 && g.somaValor === 0)).toBe(true);
  });
});

describe('ciclo de etapas (avançar / voltar / desfecho)', () => {
  const naNegociacao = { id: '1', nome: 'X', valor: 1000, etapa: 'negociacao', bant: {} };

  test('(positivo) próxima/anterior respeitam a ordem e as bordas', () => {
    expect(proximaEtapa('lead')).toBe('qualificacao');
    expect(proximaEtapa('fechado')).toBe('fechado'); // não passa do fim
    expect(etapaAnterior('proposta')).toBe('qualificacao');
    expect(etapaAnterior('lead')).toBe('lead'); // não sobe do topo
  });

  test('(positivo) avançar sem chegar em fechado não exige desfecho', () => {
    const r = avancarNegocio({ ...naNegociacao, etapa: 'lead' });
    expect(r.etapa).toBe('qualificacao');
    expect(r.desfecho).toBeUndefined();
  });

  test('(positivo) fechar como Ganho carimba desfecho e data (vinda de fora)', () => {
    const r = avancarNegocio(naNegociacao, { desfecho: 'ganho', agora: '2026-07-13T10:00:00.000Z' });
    expect(r.etapa).toBe('fechado');
    expect(r.desfecho).toBe('ganho');
    expect(r.fechadoEm).toBe('2026-07-13T10:00:00.000Z');
  });

  test('(negativo) avançar para fechado SEM desfecho lança erro', () => {
    expect(() => avancarNegocio(naNegociacao)).toThrow(/desfecho/);
    expect(() => avancarNegocio(naNegociacao, { desfecho: 'talvez' })).toThrow(/desfecho/);
  });

  test('(negativo) avançar quando já está fechado não muda nada', () => {
    const fechado = { ...naNegociacao, etapa: 'fechado', desfecho: 'ganho' };
    expect(avancarNegocio(fechado)).toBe(fechado);
  });

  test('(positivo) voltar um passo; e não volta além do Lead', () => {
    expect(voltarNegocio(naNegociacao).etapa).toBe('proposta');
    const lead = { ...naNegociacao, etapa: 'lead' };
    expect(voltarNegocio(lead)).toBe(lead);
  });

  test('(positivo) reabrir (voltar de fechado) limpa desfecho e data', () => {
    const fechado = { ...naNegociacao, etapa: 'fechado', desfecho: 'perdido', fechadoEm: '2026-07-13T10:00:00.000Z' };
    const r = voltarNegocio(fechado);
    expect(r.etapa).toBe('negociacao');
    expect(r.desfecho).toBeUndefined();
    expect(r.fechadoEm).toBeUndefined();
  });

  test('(positivo) as transições NÃO mutam o negócio original (função pura)', () => {
    const original = { ...naNegociacao };
    avancarNegocio(original, { desfecho: 'ganho', agora: 'x' });
    voltarNegocio(original);
    expect(original.etapa).toBe('negociacao');
    expect(original.desfecho).toBeUndefined();
  });

  test('(positivo) desfecho manda na probabilidade e no valor ponderado', () => {
    const ganho = { valor: 1000, etapa: 'fechado', desfecho: 'ganho', bant: {} };
    const perdido = { valor: 1000, etapa: 'fechado', desfecho: 'perdido', bant: {} };
    expect(probabilidadeDoNegocio(ganho)).toBe(1);
    expect(valorPonderadoDoNegocio(ganho)).toBe(1000);
    expect(probabilidadeDoNegocio(perdido)).toBe(0);
    expect(valorPonderadoDoNegocio(perdido)).toBe(0);
  });
});

describe('exportar dados (LGPD)', () => {
  const lista = [{ id: '1', nome: 'Clínica Sorriso', valor: 4500, etapa: 'proposta', bant: {} }];

  test('(positivo) monta a exportação com metadados e os negócios', () => {
    const pacote = montarExportacao(lista, '2026-07-13T10:00:00.000Z');
    expect(pacote.app).toBe('Funil');
    expect(pacote.total).toBe(1);
    expect(pacote.exportadoEm).toBe('2026-07-13T10:00:00.000Z');
    expect(pacote.negocios).toEqual(lista);
  });

  test('(positivo) exportarJson gera JSON válido que dá para reler', () => {
    const lido = JSON.parse(exportarJson(lista, '2026-07-13T10:00:00.000Z'));
    expect(lido.negocios[0].nome).toBe('Clínica Sorriso');
  });

  test('(negativo/borda) lista ausente exporta total 0 e lista vazia', () => {
    const pacote = montarExportacao(undefined, null);
    expect(pacote.total).toBe(0);
    expect(pacote.negocios).toEqual([]);
  });
});
