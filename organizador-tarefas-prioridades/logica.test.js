/*
 * logica.test.js — Testes das regras puras (Jest).
 *
 * Convenção do projeto: cada teste diz no nome se cobre um caso (positivo) —
 * o que DEVE funcionar — ou (negativo) — o que deve ser bloqueado/dar erro.
 */

const {
  QUADRANTES,
  ehNotaValida,
  validarTarefa,
  classificarQuadrante,
  pontuarPrioridade,
  decorarTarefa,
  STATUS,
  avancarStatus,
  voltarStatus,
  definirStatus,
  calcularResumo,
  removerTarefa,
  montarExportacao,
  ordenarPorPrioridade,
  ordenarTarefas,
  filtrarTarefas,
  lerPreferencias,
  PREFS_PADRAO,
  agruparPorQuadrante,
  adicionarTarefa,
  serializarTarefas,
  lerTarefasDe,
  hexParaRgb,
  luminancia,
  razaoContraste,
  nivelWcag,
} = require('./logica');

describe('validarTarefa', () => {
  const tarefaOk = { titulo: 'Enviar relatório', urgencia: 4, importancia: 5 };

  test('(positivo) aceita tarefa com título e notas válidas', () => {
    expect(validarTarefa(tarefaOk)).toEqual({ valida: true, erros: [] });
  });

  test('(negativo) rejeita tarefa sem título', () => {
    const r = validarTarefa({ ...tarefaOk, titulo: '' });
    expect(r.valida).toBe(false);
    expect(r.erros).toContain('titulo-obrigatorio');
  });

  test('(negativo) rejeita título só com espaços', () => {
    expect(validarTarefa({ ...tarefaOk, titulo: '   ' }).valida).toBe(false);
  });

  test('(negativo) rejeita urgência fora da escala 1..5', () => {
    expect(validarTarefa({ ...tarefaOk, urgencia: 0 }).erros).toContain('urgencia-invalida');
    expect(validarTarefa({ ...tarefaOk, urgencia: 6 }).erros).toContain('urgencia-invalida');
  });

  test('(negativo) rejeita nota não inteira', () => {
    expect(validarTarefa({ ...tarefaOk, importancia: 2.5 }).valida).toBe(false);
  });

  test('(negativo) acumula todos os erros de uma vez', () => {
    const r = validarTarefa({ titulo: '', urgencia: 9, importancia: null });
    expect(r.erros).toEqual(
      expect.arrayContaining(['titulo-obrigatorio', 'urgencia-invalida', 'importancia-invalida'])
    );
  });

  test('(negativo) não quebra com entrada undefined', () => {
    expect(validarTarefa(undefined).valida).toBe(false);
  });
});

describe('ehNotaValida', () => {
  test('(positivo) aceita inteiros de 1 a 5', () => {
    expect(ehNotaValida(1)).toBe(true);
    expect(ehNotaValida(5)).toBe(true);
  });
  test('(negativo) recusa 0, 6, decimais e não-números', () => {
    [0, 6, 2.5, '3', null, undefined].forEach((n) => expect(ehNotaValida(n)).toBe(false));
  });
});

describe('classificarQuadrante (Matriz de Eisenhower, limiar >= 3)', () => {
  test('(positivo) urgente E importante -> Faça agora', () => {
    expect(classificarQuadrante(5, 5)).toBe(QUADRANTES.FACA_AGORA);
    expect(classificarQuadrante(3, 3)).toBe(QUADRANTES.FACA_AGORA); // na borda do limiar
  });

  test('(positivo) importante, não urgente -> Agende', () => {
    expect(classificarQuadrante(2, 5)).toBe(QUADRANTES.AGENDE);
  });

  test('(positivo) urgente, não importante -> Delegue', () => {
    expect(classificarQuadrante(5, 2)).toBe(QUADRANTES.DELEGUE);
  });

  test('(positivo) nem urgente nem importante -> Elimine', () => {
    expect(classificarQuadrante(1, 2)).toBe(QUADRANTES.ELIMINE);
  });
});

describe('pontuarPrioridade (importância pesa o dobro)', () => {
  test('(positivo) calcula importancia*2 + urgencia', () => {
    expect(pontuarPrioridade(5, 5)).toBe(15); // máximo
    expect(pontuarPrioridade(1, 1)).toBe(3);  // mínimo
  });

  test('(positivo) importante-não-urgente vence urgente-não-importante', () => {
    const agende = pontuarPrioridade(2, 5);  // importância alta
    const delegue = pontuarPrioridade(5, 2); // urgência alta
    expect(agende).toBeGreaterThan(delegue);
  });
});

describe('decorarTarefa', () => {
  test('(positivo) acrescenta quadrante e prioridade calculados', () => {
    const t = decorarTarefa({ titulo: 'Estudar', urgencia: 2, importancia: 5 });
    expect(t.quadrante).toBe(QUADRANTES.AGENDE);
    expect(t.prioridade).toBe(12);
  });

  test('(positivo) não altera a tarefa original (pureza)', () => {
    const original = { titulo: 'X', urgencia: 3, importancia: 3 };
    decorarTarefa(original);
    expect(original.quadrante).toBeUndefined();
  });
});

describe('Ciclo de status (avança / volta um passo)', () => {
  test('(positivo) avança na ordem a-fazer -> fazendo -> concluída', () => {
    expect(avancarStatus(STATUS.A_FAZER)).toBe(STATUS.FAZENDO);
    expect(avancarStatus(STATUS.FAZENDO)).toBe(STATUS.CONCLUIDA);
  });

  test('(positivo) volta um passo concluída -> fazendo -> a-fazer', () => {
    expect(voltarStatus(STATUS.CONCLUIDA)).toBe(STATUS.FAZENDO);
    expect(voltarStatus(STATUS.FAZENDO)).toBe(STATUS.A_FAZER);
  });

  test('(negativo) não passa de "concluída" ao avançar (trava, sem beco)', () => {
    expect(avancarStatus(STATUS.CONCLUIDA)).toBe(STATUS.CONCLUIDA);
  });

  test('(negativo) não passa de "a fazer" ao voltar (trava)', () => {
    expect(voltarStatus(STATUS.A_FAZER)).toBe(STATUS.A_FAZER);
  });

  test('(negativo) status desconhecido é tratado como "a fazer"', () => {
    expect(avancarStatus('inventado')).toBe(STATUS.FAZENDO);
    expect(voltarStatus(undefined)).toBe(STATUS.A_FAZER);
  });

  test('(positivo) concluir CARIMBA a data recebida', () => {
    const t = definirStatus({ titulo: 'X' }, STATUS.CONCLUIDA, '2026-07-13T12:00:00.000Z');
    expect(t.status).toBe(STATUS.CONCLUIDA);
    expect(t.concluidoEm).toBe('2026-07-13T12:00:00.000Z');
  });

  test('(positivo) reabrir (voltar de concluída) LIMPA o carimbo', () => {
    const concluida = definirStatus({ titulo: 'X' }, STATUS.CONCLUIDA, '2026-07-13T12:00:00.000Z');
    const reaberta = definirStatus(concluida, voltarStatus(concluida.status), '2026-07-13T12:00:00.000Z');
    expect(reaberta.status).toBe(STATUS.FAZENDO);
    expect(reaberta.concluidoEm).toBeNull();
  });

  test('(positivo) definirStatus não altera a tarefa original (pureza)', () => {
    const original = { titulo: 'X', status: STATUS.A_FAZER };
    definirStatus(original, STATUS.FAZENDO, '2026-07-13T12:00:00.000Z');
    expect(original.status).toBe(STATUS.A_FAZER);
    expect(original.concluidoEm).toBeUndefined();
  });
});

describe('ordenarPorPrioridade', () => {
  const baixa = { titulo: 'baixa', urgencia: 1, importancia: 1 }; // nota 3
  const media = { titulo: 'media', urgencia: 2, importancia: 3 }; // nota 8
  const alta = { titulo: 'alta', urgencia: 5, importancia: 5 };   // nota 15

  test('(positivo) ordena da maior para a menor prioridade', () => {
    const r = ordenarPorPrioridade([baixa, alta, media]);
    expect(r.map((t) => t.titulo)).toEqual(['alta', 'media', 'baixa']);
  });

  test('(positivo) não altera a lista original (pureza)', () => {
    const original = [baixa, alta];
    ordenarPorPrioridade(original);
    expect(original.map((t) => t.titulo)).toEqual(['baixa', 'alta']);
  });

  test('(positivo) lista vazia devolve lista vazia', () => {
    expect(ordenarPorPrioridade([])).toEqual([]);
  });
});

describe('agruparPorQuadrante', () => {
  const fazAgora = { titulo: 'faz', urgencia: 5, importancia: 5 };
  const agende1 = { titulo: 'ag1', urgencia: 1, importancia: 5 }; // nota 11
  const agende2 = { titulo: 'ag2', urgencia: 2, importancia: 4 }; // nota 10
  const elimine = { titulo: 'eli', urgencia: 1, importancia: 1 };

  test('(positivo) devolve sempre os 4 grupos na ordem fixa', () => {
    const grupos = agruparPorQuadrante([]);
    expect(grupos.map((g) => g.quadrante)).toEqual([
      QUADRANTES.FACA_AGORA, QUADRANTES.AGENDE, QUADRANTES.DELEGUE, QUADRANTES.ELIMINE,
    ]);
    expect(grupos.every((g) => g.tarefas.length === 0)).toBe(true);
  });

  test('(positivo) cada tarefa cai no grupo certo', () => {
    const grupos = agruparPorQuadrante([fazAgora, agende1, elimine]);
    const porQuad = Object.fromEntries(grupos.map((g) => [g.quadrante, g.tarefas]));
    expect(porQuad[QUADRANTES.FACA_AGORA].map((t) => t.titulo)).toEqual(['faz']);
    expect(porQuad[QUADRANTES.AGENDE].map((t) => t.titulo)).toEqual(['ag1']);
    expect(porQuad[QUADRANTES.DELEGUE]).toHaveLength(0);
    expect(porQuad[QUADRANTES.ELIMINE].map((t) => t.titulo)).toEqual(['eli']);
  });

  test('(positivo) dentro do grupo, ordena por prioridade', () => {
    const grupos = agruparPorQuadrante([agende2, agende1]); // 10 e 11
    const agende = grupos.find((g) => g.quadrante === QUADRANTES.AGENDE);
    expect(agende.tarefas.map((t) => t.titulo)).toEqual(['ag1', 'ag2']);
  });

  test('(positivo) recalcula o quadrante — ignora campo salvo adulterado', () => {
    // quadrante salvo diz "elimine", mas as notas são de "faça agora"
    const adulterada = { titulo: 'x', urgencia: 5, importancia: 5, quadrante: 'elimine' };
    const grupos = agruparPorQuadrante([adulterada]);
    const faca = grupos.find((g) => g.quadrante === QUADRANTES.FACA_AGORA);
    expect(faca.tarefas).toHaveLength(1);
  });
});

describe('montarExportacao (LGPD)', () => {
  const lista = [{ id: 'a', titulo: 'A', urgencia: 3, importancia: 3 }];

  test('(positivo) inclui as tarefas, o total e a data recebida', () => {
    const pacote = montarExportacao(lista, '2026-07-13T12:00:00.000Z');
    expect(pacote.tarefas).toEqual(lista);
    expect(pacote.total).toBe(1);
    expect(pacote.exportadoEm).toBe('2026-07-13T12:00:00.000Z');
    expect(pacote.app).toBe('Prioriza');
  });

  test('(positivo) lista vazia exporta total 0 e tarefas []', () => {
    const pacote = montarExportacao([], '2026-07-13T12:00:00.000Z');
    expect(pacote.total).toBe(0);
    expect(pacote.tarefas).toEqual([]);
  });
});

describe('removerTarefa', () => {
  const lista = [
    { id: 'a', titulo: 'A', urgencia: 3, importancia: 3 },
    { id: 'b', titulo: 'B', urgencia: 3, importancia: 3 },
  ];

  test('(positivo) remove a tarefa do id dado e mantém as outras', () => {
    const r = removerTarefa(lista, 'a');
    expect(r.map((t) => t.id)).toEqual(['b']);
  });

  test('(negativo) id inexistente não remove nada', () => {
    expect(removerTarefa(lista, 'zzz')).toHaveLength(2);
  });

  test('(positivo) não altera a lista original (pureza)', () => {
    removerTarefa(lista, 'a');
    expect(lista).toHaveLength(2);
  });
});

describe('calcularResumo (painel "Foco do dia")', () => {
  const HOJE = '2026-07-13';
  const base = [
    { titulo: 'crítica', urgencia: 5, importancia: 5, status: 'a-fazer' },        // faça agora, pendente
    { titulo: 'em andamento', urgencia: 4, importancia: 4, status: 'fazendo' },   // faça agora, pendente
    { titulo: 'planejar', urgencia: 1, importancia: 5, status: 'a-fazer' },       // agende, pendente
    { titulo: 'feita hoje', urgencia: 3, importancia: 3, status: 'concluida', concluidoEm: '2026-07-13T09:00:00.000Z' },
    { titulo: 'feita ontem', urgencia: 3, importancia: 3, status: 'concluida', concluidoEm: '2026-07-12T09:00:00.000Z' },
  ];

  test('(positivo) total conta todas as tarefas', () => {
    expect(calcularResumo(base, HOJE).total).toBe(5);
  });

  test('(positivo) fazAgora conta só PENDENTES no quadrante Faça agora', () => {
    // crítica (5x5) e em andamento (4x4) são faça-agora e pendentes = 2
    expect(calcularResumo(base, HOJE).fazAgora).toBe(2);
  });

  test('(positivo) concluidasHoje conta só as do dia de hoje', () => {
    expect(calcularResumo(base, HOJE).concluidasHoje).toBe(1); // "feita hoje", não "ontem"
  });

  test('(positivo) atenção = tarefa pendente de maior prioridade', () => {
    expect(calcularResumo(base, HOJE).atencao.titulo).toBe('crítica');
  });

  test('(negativo) sem pendentes, atenção é null', () => {
    const soConcluidas = [base[3], base[4]];
    const r = calcularResumo(soConcluidas, HOJE);
    expect(r.atencao).toBeNull();
    expect(r.fazAgora).toBe(0);
  });

  test('(negativo) lista vazia zera tudo', () => {
    expect(calcularResumo([], HOJE)).toEqual({
      total: 0, pendentes: 0, fazAgora: 0, concluidasHoje: 0, atencao: null,
    });
  });
});

describe('filtrarTarefas', () => {
  const lista = [
    { titulo: 'a', urgencia: 5, importancia: 5, status: 'a-fazer' },  // faça-agora
    { titulo: 'b', urgencia: 5, importancia: 2, status: 'fazendo' },  // delegue
    { titulo: 'c', urgencia: 1, importancia: 5, status: 'concluida' }, // agende
  ];

  test('(positivo) sem filtros (todos) devolve tudo', () => {
    expect(filtrarTarefas(lista, { quadrante: 'todos', status: 'todos' })).toHaveLength(3);
  });

  test('(positivo) filtra por quadrante', () => {
    const r = filtrarTarefas(lista, { quadrante: 'faca-agora', status: 'todos' });
    expect(r.map((t) => t.titulo)).toEqual(['a']);
  });

  test('(positivo) filtra por status', () => {
    const r = filtrarTarefas(lista, { quadrante: 'todos', status: 'fazendo' });
    expect(r.map((t) => t.titulo)).toEqual(['b']);
  });

  test('(positivo) combina quadrante + status', () => {
    expect(filtrarTarefas(lista, { quadrante: 'agende', status: 'concluida' })).toHaveLength(1);
    expect(filtrarTarefas(lista, { quadrante: 'agende', status: 'a-fazer' })).toHaveLength(0);
  });

  test('(negativo) valor de filtro desconhecido é ignorado (não some tudo)', () => {
    expect(filtrarTarefas(lista, { quadrante: 'inventado', status: 'xpto' })).toHaveLength(3);
  });
});

describe('ordenarTarefas (critério do usuário)', () => {
  const t1 = { titulo: 'antiga', urgencia: 1, importancia: 1, criadoEm: '2026-01-01T00:00:00.000Z' };
  const t2 = { titulo: 'nova', urgencia: 5, importancia: 5, criadoEm: '2026-06-01T00:00:00.000Z' };

  test('(positivo) prioridade (padrão) coloca maior nota primeiro', () => {
    expect(ordenarTarefas([t1, t2], 'prioridade').map((t) => t.titulo)).toEqual(['nova', 'antiga']);
  });

  test('(positivo) recentes coloca a mais nova primeiro', () => {
    expect(ordenarTarefas([t1, t2], 'recentes').map((t) => t.titulo)).toEqual(['nova', 'antiga']);
  });

  test('(positivo) antigas coloca a mais antiga primeiro', () => {
    expect(ordenarTarefas([t2, t1], 'antigas').map((t) => t.titulo)).toEqual(['antiga', 'nova']);
  });

  test('(positivo) não altera a lista original (pureza)', () => {
    const orig = [t1, t2];
    ordenarTarefas(orig, 'recentes');
    expect(orig.map((t) => t.titulo)).toEqual(['antiga', 'nova']);
  });
});

describe('lerPreferencias', () => {
  test('(positivo) vazio/nulo devolve o padrão', () => {
    expect(lerPreferencias('')).toEqual(PREFS_PADRAO);
    expect(lerPreferencias(null)).toEqual(PREFS_PADRAO);
  });

  test('(positivo) mescla o que veio salvo com o padrão', () => {
    expect(lerPreferencias('{"status":"fazendo"}')).toEqual({
      quadrante: 'todos', status: 'fazendo', ordem: 'prioridade',
    });
  });

  test('(negativo) texto corrompido volta ao padrão', () => {
    expect(lerPreferencias('{quebrado')).toEqual(PREFS_PADRAO);
    expect(lerPreferencias('[1,2,3]')).toEqual(PREFS_PADRAO);
  });
});

describe('Persistência (funções puras)', () => {
  const t1 = { titulo: 'A', urgencia: 5, importancia: 5 };
  const t2 = { titulo: 'B', urgencia: 1, importancia: 2 };

  test('(positivo) adicionarTarefa acrescenta a tarefa decorada', () => {
    const lista = adicionarTarefa([], t1);
    expect(lista).toHaveLength(1);
    expect(lista[0].quadrante).toBe(QUADRANTES.FACA_AGORA);
    expect(lista[0].prioridade).toBe(15);
  });

  test('(positivo) adicionarTarefa não altera a lista original (pureza)', () => {
    const original = [];
    adicionarTarefa(original, t1);
    expect(original).toHaveLength(0);
  });

  test('(positivo) serializar -> ler faz round-trip (sobrevive ao "recarregar")', () => {
    const lista = adicionarTarefa(adicionarTarefa([], t1), t2);
    const texto = serializarTarefas(lista);
    const recarregada = lerTarefasDe(texto);
    expect(recarregada).toEqual(lista);
  });

  test('(negativo) texto corrompido não quebra: devolve []', () => {
    expect(lerTarefasDe('{isso não é json')).toEqual([]);
    expect(lerTarefasDe('42')).toEqual([]);      // não é array
    expect(lerTarefasDe('"texto"')).toEqual([]); // não é array
  });

  test('(negativo) vazio/nulo devolve []', () => {
    expect(lerTarefasDe('')).toEqual([]);
    expect(lerTarefasDe(null)).toEqual([]);
    expect(lerTarefasDe(undefined)).toEqual([]);
  });

  test('(negativo) descarta itens adulterados dentro do array', () => {
    const texto = JSON.stringify([
      { titulo: 'Válida', urgencia: 3, importancia: 4 },
      { titulo: 'Sem notas' },                      // incompleta
      { urgencia: 2, importancia: 2 },              // sem título
      { titulo: 'Nota fora', urgencia: 9, importancia: 1 },
      'lixo',
    ]);
    const lista = lerTarefasDe(texto);
    expect(lista).toHaveLength(1);
    expect(lista[0].titulo).toBe('Válida');
  });
});

describe('Contraste WCAG (acessibilidade)', () => {
  test('(positivo) hexParaRgb lê #RRGGBB e a forma curta #RGB', () => {
    expect(hexParaRgb('#ffffff')).toEqual({ r: 255, g: 255, b: 255 });
    expect(hexParaRgb('#f00')).toEqual({ r: 255, g: 0, b: 0 });
  });

  test('(negativo) hexParaRgb devolve null para cor inválida', () => {
    expect(hexParaRgb('#zzz')).toBeNull();
    expect(hexParaRgb('vermelho')).toBeNull();
    expect(hexParaRgb(123)).toBeNull();
  });

  test('(positivo) luminância: preto ~0, branco ~1', () => {
    expect(luminancia('#000000')).toBeCloseTo(0, 5);
    expect(luminancia('#ffffff')).toBeCloseTo(1, 5);
  });

  test('(positivo) contraste preto/branco é 21:1 (máximo)', () => {
    expect(razaoContraste('#000000', '#ffffff')).toBeCloseTo(21, 1);
  });

  test('(positivo) contraste da mesma cor é 1:1 (mínimo)', () => {
    expect(razaoContraste('#123456', '#123456')).toBeCloseTo(1, 5);
  });

  test('(negativo) contraste com cor inválida devolve null', () => {
    expect(razaoContraste('#000000', 'nope')).toBeNull();
  });

  test('(positivo) nivelWcag classifica AAA / AA / Reprovado (texto normal)', () => {
    expect(nivelWcag(21)).toBe('AAA');      // >= 7
    expect(nivelWcag(4.6)).toBe('AA');      // >= 4.5 e < 7
    expect(nivelWcag(3)).toBe('Reprovado'); // < 4.5 para texto normal
  });

  test('(positivo) texto grande tem limites menores (3 = AA)', () => {
    expect(nivelWcag(3, true)).toBe('AA');
    expect(nivelWcag(4.5, true)).toBe('AAA');
  });
});

// Guarda de acessibilidade: os design tokens da tela (index.html), derivados da
// paleta OFICIAL do Jenkins, devem SEMPRE passar no WCAG AA. Se alguém trocar uma
// cor e quebrar o contraste, este teste falha antes de chegar ao usuário.
describe('Design tokens (paleta Jenkins) passam WCAG AA', () => {
  const TOKENS = {
    fundo: '#f4f6f7',
    superficie: '#ffffff',
    texto: '#14232b',
    textoSuave: '#6d6b6d',
    primaria: '#335061',  // Worn Navy
    acento: '#d33834',    // Medium Carmine (gravata)
    bismark: '#48728b',
  };
  const paresDaUI = [
    ['texto sobre superfície', TOKENS.texto, TOKENS.superficie],
    ['texto suave sobre branco', TOKENS.textoSuave, TOKENS.superficie],
    ['branco sobre botão primário (navy)', '#ffffff', TOKENS.primaria],
    ['branco sobre acento (carmim)', '#ffffff', TOKENS.acento],
    ['branco sobre selo Delegue (bismark)', '#ffffff', TOKENS.bismark],
    ['texto sobre fundo', TOKENS.texto, TOKENS.fundo],
  ];

  test.each(paresDaUI)('(positivo) %s é pelo menos AA', (_rotulo, frente, fundo) => {
    const razao = razaoContraste(frente, fundo);
    expect(nivelWcag(razao)).not.toBe('Reprovado');
  });

  // Teste de COMPARAÇÃO: fixa a razão esperada de cada par (conferida contra a
  // fórmula WCAG 2.1 — a mesma do Adobe Color Contrast Analyzer). Se uma cor
  // mudar, o número esperado falha aqui, não só o "passou/reprovou".
  const REFERENCIA = [
    ['texto/superfície', TOKENS.texto, TOKENS.superficie, 16.09],
    ['texto suave/branco', TOKENS.textoSuave, TOKENS.superficie, 5.28],
    ['branco/navy', '#ffffff', TOKENS.primaria, 8.53],
    ['branco/carmim', '#ffffff', TOKENS.acento, 4.79],
    ['branco/bismark', '#ffffff', TOKENS.bismark, 5.18],
    ['texto/fundo', TOKENS.texto, TOKENS.fundo, 14.84],
  ];

  test.each(REFERENCIA)('(positivo) razão de %s = %s:1 esperado', (_rot, a, b, esperado) => {
    expect(razaoContraste(a, b)).toBeCloseTo(esperado, 2);
  });

  test('(positivo) âncoras WCAG: preto/branco=21, mesma cor=1', () => {
    expect(razaoContraste('#000000', '#ffffff')).toBeCloseTo(21, 1);
    expect(razaoContraste('#abcabc', '#abcabc')).toBeCloseTo(1, 5);
  });
});
