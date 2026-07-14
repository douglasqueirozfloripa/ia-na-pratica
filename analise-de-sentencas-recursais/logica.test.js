/*
 * logica.test.js — Testes das funções puras (Jest).
 *
 * Convenção do projeto: cada teste diz no nome se é (positivo) — o que deve
 * funcionar — ou (negativo) — o que deve ser bloqueado / dar erro.
 */

const {
  CARGAS,
  RESULTADOS,
  FASES,
  ORGAOS_JULGADORES,
  TIPOS_LIDE_SLUGS,
  faixaValor,
  faixaPrazo,
  validarDecisao,
  classificarEspecie,
  pontuarPrioridade,
  rotuloEspecie,
  hexParaRgb,
  luminancia,
  razaoContraste,
  nivelWcag,
  validarEspacamento,
  adicionarDecisao,
  serializarDecisoes,
  lerDecisoesDe,
  diasEntre,
  prioridadeDaDecisao,
  ordenarPorPrioridade,
  agruparPorFase,
  avancarFase,
  voltarFase,
  definirFase,
  calcularResumo,
  removerDecisao,
  PREFS_PADRAO,
  lerPreferencias,
  filtrarDecisoes,
} = require('./logica');

// Uma decisão-base VÁLIDA e fictícia (LGPD: nada real). Cada teste altera só o
// campo que quer exercitar.
function decisaoValida(overrides = {}) {
  return {
    numeroProcesso: '0000001-00.2026.8.24.0000',
    orgaoVara: '3ª Vara Cível de Florianópolis',
    tipoLide: 'cobranca-indevida',
    orgaoJulgador: 'singular',
    resolveuMerito: true,
    cargaEficacia: 'condenatoria',
    resultado: 'procedente',
    valorCausa: 15000,
    prazoRecursalAte: '2026-08-01',
    ...overrides,
  };
}

describe('validarDecisao', () => {
  test('(positivo) decisão completa e coerente é válida', () => {
    const r = validarDecisao(decisaoValida());
    expect(r.valida).toBe(true);
    expect(r.erros).toEqual([]);
  });

  test('(positivo) sem mérito NÃO exige carga de eficácia', () => {
    const r = validarDecisao(decisaoValida({ resolveuMerito: false, cargaEficacia: undefined }));
    expect(r.valida).toBe(true);
  });

  test('(negativo) processo sem número é rejeitado', () => {
    const r = validarDecisao(decisaoValida({ numeroProcesso: '   ' }));
    expect(r.valida).toBe(false);
    expect(r.erros).toContain('numeroProcesso é obrigatório');
  });

  test('(negativo) tipoLide fora da lista é rejeitado', () => {
    const r = validarDecisao(decisaoValida({ tipoLide: 'briga-de-vizinho' }));
    expect(r.valida).toBe(false);
    expect(r.erros).toContain('tipoLide inválido');
  });

  test('(negativo) com mérito mas sem carga é rejeitado', () => {
    const r = validarDecisao(decisaoValida({ resolveuMerito: true, cargaEficacia: undefined }));
    expect(r.valida).toBe(false);
    expect(r.erros).toContain('cargaEficacia é obrigatória quando a sentença resolve o mérito');
  });

  test('(negativo) valor em risco negativo é rejeitado', () => {
    const r = validarDecisao(decisaoValida({ valorCausa: -1 }));
    expect(r.valida).toBe(false);
    expect(r.erros).toContain('valorCausa deve ser um número >= 0');
  });

  test('(negativo) órgão julgador inválido é rejeitado', () => {
    const r = validarDecisao(decisaoValida({ orgaoJulgador: 'robô' }));
    expect(r.valida).toBe(false);
    expect(r.erros).toContain('orgaoJulgador inválido');
  });

  test('(positivo) valorCondenacao ausente é aceito (opcional, = 0)', () => {
    const r = validarDecisao(decisaoValida({ valorCondenacao: undefined }));
    expect(r.valida).toBe(true);
  });

  test('(negativo) valorCondenacao negativo é rejeitado', () => {
    const r = validarDecisao(decisaoValida({ valorCondenacao: -100 }));
    expect(r.valida).toBe(false);
    expect(r.erros).toContain('valorCondenacao deve ser um número >= 0');
  });

  test('(negativo) resultado inválido é rejeitado', () => {
    const r = validarDecisao(decisaoValida({ resultado: 'talvez' }));
    expect(r.valida).toBe(false);
    expect(r.erros).toContain('resultado inválido');
  });

  test('(negativo) decisão indefinida não quebra a validação', () => {
    const r = validarDecisao(undefined);
    expect(r.valida).toBe(false);
    expect(r.erros.length).toBeGreaterThan(0);
  });

  test('(positivo) os 6 tipos de lide são aceitos', () => {
    for (const slug of TIPOS_LIDE_SLUGS) {
      expect(validarDecisao(decisaoValida({ tipoLide: slug })).valida).toBe(true);
    }
    expect(TIPOS_LIDE_SLUGS).toHaveLength(6);
  });
});

describe('classificarEspecie', () => {
  test('(positivo) com mérito -> definitiva, mantém a carga', () => {
    const e = classificarEspecie(true, 'condenatoria', 'singular');
    expect(e).toEqual({
      merito: 'definitiva',
      carga: 'condenatoria',
      orgao: 'simples',
    });
  });

  test('(positivo) sem mérito -> terminativa e carga nula (regra dura)', () => {
    // Mesmo passando uma carga por engano, sentença SEM mérito não tem carga.
    const e = classificarEspecie(false, 'condenatoria', 'singular');
    expect(e.merito).toBe('terminativa');
    expect(e.carga).toBeNull();
  });

  test('(positivo) órgão colegiado vira espécie plúrima (acórdão)', () => {
    expect(classificarEspecie(true, 'declaratoria', 'colegiado').orgao).toBe('plurima');
    expect(classificarEspecie(true, 'declaratoria', 'complexo').orgao).toBe('complexa');
  });

  test('(negativo) sem mérito NUNCA é definitiva', () => {
    expect(classificarEspecie(false, undefined, 'singular').merito).not.toBe('definitiva');
  });

  test('(negativo) órgão julgador inválido lança erro', () => {
    expect(() => classificarEspecie(true, 'condenatoria', 'xpto')).toThrow(RangeError);
  });

  test('(negativo) com mérito e carga inválida lança erro', () => {
    expect(() => classificarEspecie(true, 'inexistente', 'singular')).toThrow(RangeError);
  });

  test('(negativo) resolveuMerito não booleano lança erro', () => {
    expect(() => classificarEspecie('sim', 'condenatoria', 'singular')).toThrow(TypeError);
  });
});

describe('faixaValor / faixaPrazo', () => {
  test('(positivo) faixaValor cresce com a exposição', () => {
    expect(faixaValor(500)).toBe(0);
    expect(faixaValor(5000)).toBe(1);
    expect(faixaValor(30000)).toBe(2);
    expect(faixaValor(80000)).toBe(3);
    expect(faixaValor(500000)).toBe(4);
  });

  test('(positivo) faixaPrazo é maior quanto menos dias faltam', () => {
    expect(faixaPrazo(null)).toBe(0); // sem prazo aberto
    expect(faixaPrazo(0)).toBe(4); // vence hoje
    expect(faixaPrazo(-3)).toBe(4); // vencido
    expect(faixaPrazo(5)).toBe(3);
    expect(faixaPrazo(12)).toBe(2);
    expect(faixaPrazo(20)).toBe(1);
    expect(faixaPrazo(90)).toBe(0);
  });
});

describe('pontuarPrioridade', () => {
  test('(positivo) procedente + alta exposição + prazo vencido pontua alto', () => {
    const alta = pontuarPrioridade(500000, 'procedente', 0);
    const baixa = pontuarPrioridade(500, 'improcedente', null);
    expect(alta).toBeGreaterThan(baixa);
  });

  test('(positivo) mais exposição => mais prioridade (mantendo o resto)', () => {
    const menos = pontuarPrioridade(500, 'parcial', 10);
    const mais = pontuarPrioridade(90000, 'parcial', 10);
    expect(mais).toBeGreaterThan(menos);
  });

  test('(positivo) procedente pesa mais que improcedente (mesmos demais)', () => {
    const perdeu = pontuarPrioridade(20000, 'procedente', 10);
    const venceu = pontuarPrioridade(20000, 'improcedente', 10);
    expect(perdeu).toBeGreaterThan(venceu);
  });

  test('(positivo) sem prazo aberto conta como urgência zero', () => {
    // faixaPrazo(null)=0 => nota = peso * (2*faixaValor + 1)
    // valor 500 -> faixaValor 0 ; improcedente peso 1 => 1*(0+0+1)=1
    expect(pontuarPrioridade(500, 'improcedente', null)).toBe(1);
  });

  test('(negativo) resultado inválido lança erro', () => {
    expect(() => pontuarPrioridade(1000, 'meia-boca', 10)).toThrow(RangeError);
  });

  test('(negativo) valor em risco negativo lança erro', () => {
    expect(() => pontuarPrioridade(-5, 'procedente', 10)).toThrow(TypeError);
  });

  test('(negativo) diasParaPrazo com tipo errado lança erro', () => {
    expect(() => pontuarPrioridade(1000, 'procedente', 'amanhã')).toThrow(TypeError);
  });
});

describe('rotuloEspecie', () => {
  test('(positivo) definitiva condenatória plúrima vira texto amigável', () => {
    const texto = rotuloEspecie({
      merito: 'definitiva',
      carga: 'condenatoria',
      orgao: 'plurima',
    });
    expect(texto).toBe('Definitiva · condenatória · plúrima (acórdão)');
  });

  test('(positivo) terminativa (sem carga) não mostra carga', () => {
    const texto = rotuloEspecie({ merito: 'terminativa', carga: null, orgao: 'simples' });
    expect(texto).toBe('Terminativa · simples');
  });

  test('(negativo) entrada inválida devolve string vazia', () => {
    expect(rotuloEspecie(null)).toBe('');
    expect(rotuloEspecie(undefined)).toBe('');
  });
});

describe('contraste WCAG', () => {
  test('(positivo) hexParaRgb entende #RGB e #RRGGBB', () => {
    expect(hexParaRgb('#fff')).toEqual({ r: 255, g: 255, b: 255 });
    expect(hexParaRgb('#0B57D0')).toEqual({ r: 11, g: 87, b: 208 });
  });

  test('(negativo) cor inválida devolve null e não quebra', () => {
    expect(hexParaRgb('azul')).toBeNull();
    expect(luminancia('xyz')).toBeNull();
    expect(razaoContraste('#000', 'nada')).toBeNull();
  });

  test('(positivo) preto x branco tem contraste máximo (~21:1, AAA)', () => {
    const razao = razaoContraste('#000000', '#FFFFFF');
    expect(razao).toBeCloseTo(21, 0);
    expect(nivelWcag(razao)).toBe('AAA');
  });

  test('(negativo) contraste baixo é Reprovado', () => {
    expect(nivelWcag(razaoContraste('#FFFFFF', '#FFFF00'))).toBe('Reprovado');
  });

  // GUARDA: todos os pares de tokens da tela (index.html) precisam passar em AA.
  // Se alguém mexer numa cor e reprovar o contraste, ESTE teste quebra.
  test('(positivo) todos os pares de tokens da paleta Jusbrasil passam em AA', () => {
    const TOKENS = {
      fundo: '#ffffff',
      superficie: '#f4f7fb',
      texto: '#12203a',
      textoSuave: '#4a5568',
      inverso: '#ffffff',
      primaria: '#0b57d0',
      primariaEscura: '#0a3d91',
      sucesso: '#00875a',
      perigo: '#c0392b',
    };
    const pares = [
      [TOKENS.texto, TOKENS.fundo],
      [TOKENS.texto, TOKENS.superficie],
      [TOKENS.inverso, TOKENS.primaria],
      [TOKENS.inverso, TOKENS.primariaEscura],
      [TOKENS.inverso, TOKENS.sucesso],
      [TOKENS.inverso, TOKENS.perigo],
      [TOKENS.textoSuave, TOKENS.fundo],
    ];
    for (const [frente, fundo] of pares) {
      const nivel = nivelWcag(razaoContraste(frente, fundo));
      expect(['AA', 'AAA']).toContain(nivel);
    }
  });
});

describe('validarEspacamento', () => {
  // Caixas no formato { id, left, top, right, bottom } (como viriam do
  // getBoundingClientRect, que a tela/E2E fornecem).
  const caixa = (id, left, top, right, bottom) => ({ id, left, top, right, bottom });

  test('(positivo) elementos com folga > 0,5px passam', () => {
    const r = validarEspacamento([
      caixa('a', 0, 0, 100, 40),
      caixa('b', 0, 60, 100, 100), // 20px abaixo de "a"
    ]);
    expect(r.ok).toBe(true);
    expect(r.colisoes).toEqual([]);
  });

  test('(negativo) elementos colados/sobrepostos reprovam', () => {
    const r = validarEspacamento([
      caixa('a', 0, 0, 100, 40),
      caixa('b', 50, 20, 150, 60), // invade "a"
    ]);
    expect(r.ok).toBe(false);
    expect(r.colisoes).toHaveLength(1);
  });

  test('(positivo) par pai/filho é ignorado (contêm-se de propósito)', () => {
    const r = validarEspacamento([
      caixa('pai', 0, 0, 200, 200),
      caixa('filho', 10, 10, 100, 100), // dentro do pai
    ]);
    expect(r.ok).toBe(true);
  });
});

describe('persistência (funções puras)', () => {
  test('(positivo) adicionarDecisao devolve nova lista sem mutar a original', () => {
    const original = [];
    const nova = adicionarDecisao(original, decisaoValida());
    expect(nova).toHaveLength(1);
    expect(original).toHaveLength(0); // pureza: original intacta
  });

  test('(positivo) serializar + ler faz round-trip (persiste após "recarregar")', () => {
    const lista = [
      decisaoValida({ numeroProcesso: '0000001-00.2026.8.24.0000' }),
      decisaoValida({ numeroProcesso: '0000002-00.2026.8.24.0000', tipoLide: 'dano-moral' }),
    ];
    const texto = serializarDecisoes(lista);
    const lida = lerDecisoesDe(texto);
    expect(lida).toHaveLength(2);
    expect(lida[1].tipoLide).toBe('dano-moral');
  });

  test('(negativo) JSON corrompido não quebra o app -> []', () => {
    expect(lerDecisoesDe('{isso não é json')).toEqual([]);
    expect(lerDecisoesDe('')).toEqual([]);
    expect(lerDecisoesDe(null)).toEqual([]);
  });

  test('(negativo) não-array vira []', () => {
    expect(lerDecisoesDe('{"a":1}')).toEqual([]);
  });

  test('(negativo) itens que não parecem decisão são descartados', () => {
    const texto = JSON.stringify([
      decisaoValida(), // íntegra -> fica
      { foo: 'bar' }, // lixo -> sai
      { numeroProcesso: '123', tipoLide: 'inexistente' }, // tipoLide inválido -> sai
    ]);
    expect(lerDecisoesDe(texto)).toHaveLength(1);
  });
});

describe('lista: ordenação e agrupamento por fase', () => {
  const HOJE = '2026-07-14';

  test('(positivo) diasEntre calcula dias corretos (e negativo p/ vencido)', () => {
    expect(diasEntre(HOJE, '2026-07-24')).toBe(10);
    expect(diasEntre(HOJE, '2026-07-04')).toBe(-10);
    expect(diasEntre(HOJE, null)).toBeNull();
    expect(diasEntre(HOJE, 'sem-data')).toBeNull();
  });

  test('(positivo) ordenarPorPrioridade coloca a maior prioridade primeiro', () => {
    const alta = decisaoValida({
      numeroProcesso: 'A',
      valorCausa: 500000,
      resultado: 'procedente',
      prazoRecursalAte: '2026-07-15', // 1 dia -> urgente
    });
    const baixa = decisaoValida({
      numeroProcesso: 'B',
      valorCausa: 500,
      resultado: 'improcedente',
      prazoRecursalAte: null,
    });
    const ordenada = ordenarPorPrioridade([baixa, alta], HOJE);
    expect(ordenada[0].numeroProcesso).toBe('A');
    expect(ordenada[1].numeroProcesso).toBe('B');
  });

  test('(positivo) empate mantém a ordem original (estável)', () => {
    const a = decisaoValida({ numeroProcesso: 'A', valorCausa: 20000, prazoRecursalAte: null });
    const b = decisaoValida({ numeroProcesso: 'B', valorCausa: 20000, prazoRecursalAte: null });
    const ordenada = ordenarPorPrioridade([a, b], HOJE);
    expect(ordenada.map((d) => d.numeroProcesso)).toEqual(['A', 'B']);
  });

  test('(positivo) ordenarPorPrioridade não muta a lista original', () => {
    const lista = [decisaoValida({ numeroProcesso: 'A' })];
    const copia = [...lista];
    ordenarPorPrioridade(lista, HOJE);
    expect(lista).toEqual(copia);
  });

  test('(positivo) agruparPorFase devolve as 4 fases na ordem, com contagem', () => {
    const grupos = agruparPorFase(
      [
        decisaoValida({ numeroProcesso: '1', faseRecursal: 'primeiro-grau' }),
        decisaoValida({ numeroProcesso: '2', faseRecursal: 'apelacao' }),
        decisaoValida({ numeroProcesso: '3', faseRecursal: 'apelacao' }),
        decisaoValida({ numeroProcesso: '4', faseRecursal: 'transitado' }),
      ],
      HOJE
    );
    expect(grupos.map((g) => g.fase)).toEqual([
      'primeiro-grau',
      'apelacao',
      'instancia-superior',
      'transitado',
    ]);
    expect(grupos.map((g) => g.total)).toEqual([1, 2, 0, 1]);
    expect(grupos[1].rotulo).toBe('Apelação (2º grau)');
  });

  test('(negativo) fase desconhecida é ignorada nos grupos', () => {
    const grupos = agruparPorFase(
      [decisaoValida({ numeroProcesso: 'X', faseRecursal: 'fase-inventada' })],
      HOJE
    );
    expect(grupos.reduce((soma, g) => soma + g.total, 0)).toBe(0);
  });

  test('(negativo) decisão sem dados suficientes pontua 0', () => {
    expect(prioridadeDaDecisao({ resultado: 'xpto', valorCausa: 10 }, HOJE)).toBe(0);
    expect(prioridadeDaDecisao(null, HOJE)).toBe(0);
  });
});

describe('ciclo de fases recursais', () => {
  test('(positivo) avança na ordem 1º grau -> apelação -> instância -> transitado', () => {
    expect(avancarFase('primeiro-grau')).toBe('apelacao');
    expect(avancarFase('apelacao')).toBe('instancia-superior');
    expect(avancarFase('instancia-superior')).toBe('transitado');
  });

  test('(negativo) avançar TRAVA em "transitado" (sem beco sem saída)', () => {
    expect(avancarFase('transitado')).toBe('transitado');
  });

  test('(positivo) volta um passo', () => {
    expect(voltarFase('instancia-superior')).toBe('apelacao');
    expect(voltarFase('apelacao')).toBe('primeiro-grau');
  });

  test('(negativo) voltar TRAVA em "primeiro-grau"', () => {
    expect(voltarFase('primeiro-grau')).toBe('primeiro-grau');
  });

  test('(positivo) transitar em julgado CARIMBA a data', () => {
    const d = decisaoValida({ faseRecursal: 'instancia-superior', dataTransito: null });
    const nova = definirFase(d, 'transitado', '2026-07-14T10:00:00.000Z');
    expect(nova.faseRecursal).toBe('transitado');
    expect(nova.dataTransito).toBe('2026-07-14T10:00:00.000Z');
    expect(d.dataTransito).toBeNull(); // não mutou a original
  });

  test('(positivo) reabrir (sair do trânsito) LIMPA a data', () => {
    const d = decisaoValida({
      faseRecursal: 'transitado',
      dataTransito: '2026-07-01T00:00:00.000Z',
    });
    const nova = definirFase(d, 'instancia-superior', '2026-07-14T10:00:00.000Z');
    expect(nova.faseRecursal).toBe('instancia-superior');
    expect(nova.dataTransito).toBeNull();
  });

  test('(negativo) definirFase com fase inválida lança erro', () => {
    expect(() => definirFase(decisaoValida(), 'fase-x', '2026-07-14')).toThrow(RangeError);
  });
});

describe('calcularResumo (painel do contencioso)', () => {
  const HOJE = '2026-07-14';
  const lista = [
    decisaoValida({
      numeroProcesso: 'A',
      faseRecursal: 'primeiro-grau',
      valorCausa: 38000,
      resultado: 'procedente',
      prazoRecursalAte: '2026-07-18',
    }),
    decisaoValida({
      numeroProcesso: 'B',
      faseRecursal: 'apelacao',
      valorCausa: 120000,
      resultado: 'procedente',
      prazoRecursalAte: '2026-07-19',
    }),
    decisaoValida({
      numeroProcesso: 'C',
      faseRecursal: 'apelacao',
      valorCausa: 8000,
      resultado: 'parcial',
      prazoRecursalAte: '2026-06-01',
    }), // vencido
    decisaoValida({
      numeroProcesso: 'D',
      faseRecursal: 'transitado',
      valorCausa: 25000,
      resultado: 'procedente',
      prazoRecursalAte: null,
    }),
  ];

  test('(positivo) conta total, transitados e exposição ativa (exclui transitado)', () => {
    const r = calcularResumo(lista, HOJE);
    expect(r.total).toBe(4);
    expect(r.transitados).toBe(1);
    expect(r.exposicaoAtiva).toBe(38000 + 120000 + 8000); // D (transitado) fora
  });

  test('(positivo) prazoCorrendo conta só ativas com prazo em aberto (>= hoje)', () => {
    const r = calcularResumo(lista, HOJE);
    expect(r.prazoCorrendo).toBe(2); // A e B; C está vencido; D transitado
  });

  test('(positivo) destaque é a ativa de maior prioridade ("aja por esta primeiro")', () => {
    const r = calcularResumo(lista, HOJE);
    expect(r.destaque.numeroProcesso).toBe('B'); // 120k + prazo curto
  });

  test('(negativo) lista vazia devolve zeros e destaque null', () => {
    const r = calcularResumo([], HOJE);
    expect(r).toEqual({
      total: 0,
      prazoCorrendo: 0,
      transitados: 0,
      exposicaoAtiva: 0,
      totalCondenado: 0,
      percentDefendidos: 0,
      destaque: null,
    });
  });

  test('(negativo) só transitadas -> destaque null', () => {
    const r = calcularResumo([decisaoValida({ faseRecursal: 'transitado' })], HOJE);
    expect(r.destaque).toBeNull();
  });

  test('(positivo) exposição em disputa ZERA quando todas transitaram', () => {
    const todasTransitadas = [
      decisaoValida({ numeroProcesso: 'A', faseRecursal: 'transitado', valorCausa: 38000 }),
      decisaoValida({ numeroProcesso: 'B', faseRecursal: 'transitado', valorCausa: 120000 }),
    ];
    const r = calcularResumo(todasTransitadas, HOJE);
    expect(r.exposicaoAtiva).toBe(0);
    expect(r.transitados).toBe(2);
  });

  test('(positivo) totalCondenado soma o valor a pagar de todas as decisões', () => {
    const r = calcularResumo(
      [
        decisaoValida({ numeroProcesso: 'A', valorCondenacao: 10000 }),
        decisaoValida({ numeroProcesso: 'B', faseRecursal: 'transitado', valorCondenacao: 5000 }),
        decisaoValida({ numeroProcesso: 'C', resultado: 'improcedente', valorCondenacao: 0 }),
      ],
      HOJE
    );
    expect(r.totalCondenado).toBe(15000);
  });

  test('(positivo) percentDefendidos = % de improcedentes', () => {
    const r = calcularResumo(
      [
        decisaoValida({ numeroProcesso: 'A', resultado: 'improcedente' }),
        decisaoValida({ numeroProcesso: 'B', resultado: 'improcedente' }),
        decisaoValida({ numeroProcesso: 'C', resultado: 'procedente' }),
        decisaoValida({ numeroProcesso: 'D', resultado: 'parcial' }),
      ],
      HOJE
    );
    expect(r.percentDefendidos).toBe(50); // 2 de 4
  });
});

describe('filtros / preferências persistidas', () => {
  test('(positivo) lerPreferencias devolve o padrão quando vazio', () => {
    expect(lerPreferencias('')).toEqual(PREFS_PADRAO);
    expect(lerPreferencias(null)).toEqual(PREFS_PADRAO);
  });

  test('(positivo) lê preferências válidas gravadas', () => {
    const prefs = lerPreferencias(
      JSON.stringify({ fase: 'apelacao', especie: 'definitiva', resultado: 'procedente' })
    );
    expect(prefs).toEqual({ fase: 'apelacao', especie: 'definitiva', resultado: 'procedente' });
  });

  test('(negativo) preferência corrompida cai no padrão (leitura blindada)', () => {
    expect(lerPreferencias('{quebrado')).toEqual(PREFS_PADRAO);
  });

  test('(negativo) valores desconhecidos são ignorados (voltam ao padrão)', () => {
    const prefs = lerPreferencias(
      JSON.stringify({ fase: 'inexistente', especie: 'xpto', resultado: 'talvez' })
    );
    expect(prefs).toEqual(PREFS_PADRAO);
  });

  test('(positivo) filtrarDecisoes por fase + resultado combina os filtros', () => {
    const lista = [
      decisaoValida({ numeroProcesso: 'A', faseRecursal: 'apelacao', resultado: 'procedente' }),
      decisaoValida({ numeroProcesso: 'B', faseRecursal: 'apelacao', resultado: 'improcedente' }),
      decisaoValida({
        numeroProcesso: 'C',
        faseRecursal: 'primeiro-grau',
        resultado: 'procedente',
      }),
    ];
    const r = filtrarDecisoes(lista, {
      fase: 'apelacao',
      especie: 'todas',
      resultado: 'procedente',
    });
    expect(r.map((d) => d.numeroProcesso)).toEqual(['A']);
  });

  test('(positivo) filtro por espécie usa o mérito (definitiva x terminativa)', () => {
    const lista = [
      decisaoValida({ numeroProcesso: 'D', resolveuMerito: true }),
      decisaoValida({ numeroProcesso: 'T', resolveuMerito: false, cargaEficacia: undefined }),
    ];
    const soDefinitiva = filtrarDecisoes(lista, { ...PREFS_PADRAO, especie: 'definitiva' });
    expect(soDefinitiva.map((d) => d.numeroProcesso)).toEqual(['D']);
    const soTerminativa = filtrarDecisoes(lista, { ...PREFS_PADRAO, especie: 'terminativa' });
    expect(soTerminativa.map((d) => d.numeroProcesso)).toEqual(['T']);
  });

  test('(positivo/borda) padrão (todas/todos) devolve tudo', () => {
    const lista = [decisaoValida({ numeroProcesso: 'A' }), decisaoValida({ numeroProcesso: 'B' })];
    expect(filtrarDecisoes(lista, PREFS_PADRAO)).toHaveLength(2);
  });
});

describe('removerDecisao', () => {
  test('(positivo) remove pelo id e não muta a original', () => {
    const original = [
      decisaoValida({ numeroProcesso: 'A' }),
      decisaoValida({ numeroProcesso: 'B' }),
    ];
    original[0].id = 'id-a';
    original[1].id = 'id-b';
    const nova = removerDecisao(original, 'id-a');
    expect(nova).toHaveLength(1);
    expect(nova[0].id).toBe('id-b');
    expect(original).toHaveLength(2); // pureza
  });

  test('(negativo) id inexistente mantém a lista', () => {
    const lista = [decisaoValida()];
    lista[0].id = 'id-a';
    expect(removerDecisao(lista, 'id-zzz')).toHaveLength(1);
  });
});

describe('montarExportacao (LGPD)', () => {
  const { montarExportacao } = require('./logica');

  test('(positivo) monta o pacote com app, data, total e decisões', () => {
    const lista = [decisaoValida({ numeroProcesso: 'A' }), decisaoValida({ numeroProcesso: 'B' })];
    const pacote = montarExportacao(lista, '2026-07-14T10:00:00.000Z');
    expect(pacote.app).toBe('Instância');
    expect(pacote.geradoEm).toBe('2026-07-14T10:00:00.000Z');
    expect(pacote.total).toBe(2);
    expect(pacote.decisoes).toHaveLength(2);
  });

  test('(borda) lista vazia exporta total 0', () => {
    const pacote = montarExportacao([], '2026-07-14T10:00:00.000Z');
    expect(pacote.total).toBe(0);
    expect(pacote.decisoes).toEqual([]);
  });
});

/* =========================================================================
 * COBERTURA AMPLA — cenários possíveis de decisões e indicadores do painel.
 * (Testes "de componente" das regras: varrem combinações de forma data-driven.)
 * ========================================================================= */

describe('cenários de espécie — todas as combinações (classificarEspecie)', () => {
  const ORGAO_ESPERADO = { singular: 'simples', colegiado: 'plurima', complexo: 'complexa' };

  // Com mérito: para cada carga × cada órgão, a espécie é definitiva + carga + órgão.
  for (const carga of CARGAS) {
    for (const org of ORGAOS_JULGADORES) {
      test(`(positivo) COM mérito · ${carga} · ${org} -> definitiva/${carga}/${ORGAO_ESPERADO[org]}`, () => {
        expect(classificarEspecie(true, carga, org)).toEqual({
          merito: 'definitiva',
          carga,
          orgao: ORGAO_ESPERADO[org],
        });
      });
    }
  }

  // Sem mérito: para cada órgão, é terminativa e carga nula (carga é ignorada).
  for (const org of ORGAOS_JULGADORES) {
    test(`(positivo) SEM mérito · ${org} -> terminativa/carga nula`, () => {
      const e = classificarEspecie(false, 'condenatoria', org);
      expect(e.merito).toBe('terminativa');
      expect(e.carga).toBeNull();
      expect(e.orgao).toBe(ORGAO_ESPERADO[org]);
    });
  }
});

describe('cenários de validação — cada campo obrigatório isolado', () => {
  const casos = [
    ['numeroProcesso vazio', { numeroProcesso: '  ' }, 'numeroProcesso é obrigatório'],
    ['tipoLide inválido', { tipoLide: 'xpto' }, 'tipoLide inválido'],
    ['orgaoJulgador inválido', { orgaoJulgador: 'xpto' }, 'orgaoJulgador inválido'],
    ['resultado inválido', { resultado: 'xpto' }, 'resultado inválido'],
    ['valorCausa negativo', { valorCausa: -1 }, 'valorCausa deve ser um número >= 0'],
    ['valorCausa não numérico', { valorCausa: NaN }, 'valorCausa deve ser um número >= 0'],
    [
      'valorCondenacao negativo',
      { valorCondenacao: -1 },
      'valorCondenacao deve ser um número >= 0',
    ],
    [
      'mérito sem carga',
      { resolveuMerito: true, cargaEficacia: undefined },
      'cargaEficacia é obrigatória quando a sentença resolve o mérito',
    ],
  ];
  for (const [nome, override, erroEsperado] of casos) {
    test(`(negativo) ${nome} é rejeitado`, () => {
      const r = validarDecisao(decisaoValida(override));
      expect(r.valida).toBe(false);
      expect(r.erros).toContain(erroEsperado);
    });
  }

  // Cada tipo de lide é aceito individualmente.
  for (const tipo of TIPOS_LIDE_SLUGS) {
    test(`(positivo) tipo de lide "${tipo}" é aceito`, () => {
      expect(validarDecisao(decisaoValida({ tipoLide: tipo })).valida).toBe(true);
    });
  }

  // Cada resultado é aceito individualmente.
  for (const resultado of RESULTADOS) {
    test(`(positivo) resultado "${resultado}" é aceito`, () => {
      expect(validarDecisao(decisaoValida({ resultado })).valida).toBe(true);
    });
  }
});

describe('cenários de fase — ciclo completo pelas FASES', () => {
  const HOJE = '2026-07-14';

  // definirFase aceita cada fase; só "transitado" carimba a data.
  for (const fase of FASES) {
    test(`(positivo) definirFase para "${fase}" ${fase === 'transitado' ? 'carimba' : 'não carimba'}`, () => {
      const nova = definirFase(decisaoValida(), fase, '2026-07-14T10:00:00.000Z');
      expect(nova.faseRecursal).toBe(fase);
      if (fase === 'transitado') {
        expect(nova.dataTransito).toBe('2026-07-14T10:00:00.000Z');
      } else {
        expect(nova.dataTransito).toBeNull();
      }
    });
  }

  test('(positivo) agruparPorFase devolve exatamente as FASES na ordem', () => {
    const grupos = agruparPorFase([], HOJE);
    expect(grupos.map((g) => g.fase)).toEqual(FASES);
  });

  test('(positivo) avançar do 1º grau até o fim percorre todas as FASES', () => {
    let fase = FASES[0];
    const caminho = [fase];
    for (let i = 0; i < FASES.length + 2; i++) {
      fase = avancarFase(fase);
      caminho.push(fase);
    }
    // Chega no transitado e trava lá (sem beco sem saída).
    expect(caminho).toContain('transitado');
    expect(avancarFase('transitado')).toBe('transitado');
    expect(caminho[caminho.length - 1]).toBe('transitado');
  });
});

describe('cenários de faixa — bordas exatas', () => {
  const valores = [
    [1000, 0],
    [1001, 1],
    [10000, 1],
    [10001, 2],
    [50000, 2],
    [50001, 3],
    [100000, 3],
    [100001, 4],
  ];
  for (const [v, esperado] of valores) {
    test(`(borda) faixaValor(${v}) = ${esperado}`, () => {
      expect(faixaValor(v)).toBe(esperado);
    });
  }

  const prazos = [
    [null, 0],
    [-1, 4],
    [0, 4],
    [1, 3],
    [7, 3],
    [8, 2],
    [15, 2],
    [16, 1],
    [30, 1],
    [31, 0],
  ];
  for (const [d, esperado] of prazos) {
    test(`(borda) faixaPrazo(${d}) = ${esperado}`, () => {
      expect(faixaPrazo(d)).toBe(esperado);
    });
  }
});

describe('cenários de prioridade — peso do resultado', () => {
  // Mesmo valor e prazo, a prioridade cresce improcedente < parcial < procedente.
  test('(positivo) improcedente < parcial < procedente (mesmos demais)', () => {
    const imp = pontuarPrioridade(20000, 'improcedente', 10);
    const par = pontuarPrioridade(20000, 'parcial', 10);
    const pro = pontuarPrioridade(20000, 'procedente', 10);
    expect(imp).toBeLessThan(par);
    expect(par).toBeLessThan(pro);
  });

  // Valor esperado exato pela fórmula peso*(2*faixaValor + 2*faixaPrazo + 1).
  const casos = [
    [500, 'improcedente', null, 1], // 1*(0+0+1)
    [500000, 'procedente', 0, 3 * (2 * 4 + 2 * 4 + 1)], // 3*17=51
    [30000, 'parcial', 10, 2 * (2 * 2 + 2 * 2 + 1)], // 2*9=18
  ];
  for (const [valor, resultado, dias, esperado] of casos) {
    test(`(positivo) pontuarPrioridade(${valor}, ${resultado}, ${dias}) = ${esperado}`, () => {
      expect(pontuarPrioridade(valor, resultado, dias)).toBe(esperado);
    });
  }
});

describe('indicadores do painel — cenários (calcularResumo)', () => {
  const HOJE = '2026-07-14';
  const d = (o) => decisaoValida(o);

  test('(borda) sem decisões: tudo zero, destaque null', () => {
    expect(calcularResumo([], HOJE)).toEqual({
      total: 0,
      prazoCorrendo: 0,
      transitados: 0,
      exposicaoAtiva: 0,
      totalCondenado: 0,
      percentDefendidos: 0,
      destaque: null,
    });
  });

  test('(positivo) itens nulos são ignorados no total', () => {
    const r = calcularResumo([null, d({ numeroProcesso: 'A' }), undefined], HOJE);
    expect(r.total).toBe(1);
  });

  test('(positivo) exposição = soma do valor da causa só das ATIVAS', () => {
    const r = calcularResumo(
      [
        d({ faseRecursal: 'primeiro-grau', valorCausa: 10000 }),
        d({ faseRecursal: 'apelacao', valorCausa: 20000 }),
        d({ faseRecursal: 'transitado', valorCausa: 99999 }),
      ],
      HOJE
    );
    expect(r.exposicaoAtiva).toBe(30000);
  });

  test('(positivo) exposição ZERA quando todas transitaram', () => {
    const r = calcularResumo(
      [
        d({ faseRecursal: 'transitado', valorCausa: 10000 }),
        d({ faseRecursal: 'transitado', valorCausa: 20000 }),
      ],
      HOJE
    );
    expect(r.exposicaoAtiva).toBe(0);
    expect(r.destaque).toBeNull();
  });

  test('(positivo) total condenado soma o valor a pagar de TODAS (ativas e transitadas)', () => {
    const r = calcularResumo(
      [
        d({ valorCondenacao: 1000 }),
        d({ faseRecursal: 'transitado', valorCondenacao: 2500 }),
        d({ resultado: 'improcedente', valorCondenacao: 0 }),
        d({ valorCondenacao: undefined }), // ausente conta 0
      ],
      HOJE
    );
    expect(r.totalCondenado).toBe(3500);
  });

  const defendidos = [
    [['procedente'], 0],
    [['improcedente'], 100],
    [['improcedente', 'procedente'], 50],
    [['improcedente', 'procedente', 'procedente'], 33], // 1/3 arredonda p/ 33
    [['improcedente', 'improcedente', 'procedente'], 67], // 2/3 -> 67
  ];
  for (const [resultados, esperado] of defendidos) {
    test(`(positivo) % defendidos de [${resultados}] = ${esperado}%`, () => {
      const lista = resultados.map((resultado, i) => d({ numeroProcesso: 'P' + i, resultado }));
      expect(calcularResumo(lista, HOJE).percentDefendidos).toBe(esperado);
    });
  }

  test('(positivo) prazoCorrendo ignora vencidos e transitados', () => {
    const r = calcularResumo(
      [
        d({ numeroProcesso: 'futuro', prazoRecursalAte: '2026-07-20' }),
        d({ numeroProcesso: 'hoje', prazoRecursalAte: HOJE }),
        d({ numeroProcesso: 'vencido', prazoRecursalAte: '2026-06-01' }),
        d({ numeroProcesso: 'sem-prazo', prazoRecursalAte: null }),
        d({
          numeroProcesso: 'transitado',
          faseRecursal: 'transitado',
          prazoRecursalAte: '2026-07-20',
        }),
      ],
      HOJE
    );
    expect(r.prazoCorrendo).toBe(2); // futuro + hoje
  });

  test('(positivo) destaque é a ativa de maior prioridade', () => {
    const r = calcularResumo(
      [
        d({
          numeroProcesso: 'baixa',
          valorCausa: 500,
          resultado: 'improcedente',
          prazoRecursalAte: null,
        }),
        d({
          numeroProcesso: 'alta',
          valorCausa: 500000,
          resultado: 'procedente',
          prazoRecursalAte: HOJE,
        }),
      ],
      HOJE
    );
    expect(r.destaque.numeroProcesso).toBe('alta');
  });
});
