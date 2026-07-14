/*
 * logica.js — Regras de negócio do Prioriza, em FUNÇÕES PURAS.
 *
 * "Função pura" = mesma entrada -> mesma saída, sem mexer em nada por fora
 * (ver GLOSSARIO.md). Isso torna a priorização testável e à prova de erro de
 * digitação: o quadrante e a nota NUNCA são digitados pelo usuário, são
 * CALCULADOS a partir de urgência × importância (Matriz de Eisenhower).
 *
 * Coberto por: logica.test.js (Jest).
 */

// Urgência e importância são notas inteiras de 1 a 5.
// A partir do LIMIAR consideramos a dimensão "alta" — é o corte 2x2 clássico
// da Matriz de Eisenhower (urgente/não, importante/não).
const NOTA_MINIMA = 1;
const NOTA_MAXIMA = 5;
const LIMIAR_ALTO = 3; // nota >= 3 é considerada "alta"

// Os quatro quadrantes de Eisenhower, com os nomes (convenção deste projeto).
const QUADRANTES = {
  FACA_AGORA: 'faca-agora', // urgente E importante
  AGENDE: 'agende', // importante, não urgente
  DELEGUE: 'delegue', // urgente, não importante
  ELIMINE: 'elimine', // nem urgente nem importante
};

// Status do ciclo de vida da tarefa (o ciclo em si entra no Prompt 6).
const STATUS = { A_FAZER: 'a-fazer', FAZENDO: 'fazendo', CONCLUIDA: 'concluida' };

/**
 * É uma nota válida? (inteiro dentro de 1..5)
 * Função auxiliar pura usada pela validação.
 */
function ehNotaValida(nota) {
  return Number.isInteger(nota) && nota >= NOTA_MINIMA && nota <= NOTA_MAXIMA;
}

/**
 * Valida os campos obrigatórios de uma tarefa ANTES de salvar.
 * Não lança erro: devolve um relatório { valida, erros } para a tela decidir
 * o que mostrar. Assim o mesmo código serve para teste e para interface.
 */
function validarTarefa(tarefa) {
  const erros = [];
  const t = tarefa || {};

  // Título: obrigatório e não pode ser só espaços.
  if (typeof t.titulo !== 'string' || t.titulo.trim() === '') {
    erros.push('titulo-obrigatorio');
  }
  // Urgência e importância: obrigatórias e dentro da escala 1..5.
  if (!ehNotaValida(t.urgencia)) erros.push('urgencia-invalida');
  if (!ehNotaValida(t.importancia)) erros.push('importancia-invalida');

  return { valida: erros.length === 0, erros };
}

/**
 * Classifica a tarefa em um dos quatro quadrantes de Eisenhower.
 * Regra: cruza "urgência alta?" com "importância alta?" usando o LIMIAR.
 */
function classificarQuadrante(urgencia, importancia) {
  const urgenteAlto = urgencia >= LIMIAR_ALTO;
  const importanteAlto = importancia >= LIMIAR_ALTO;

  if (importanteAlto && urgenteAlto) return QUADRANTES.FACA_AGORA;
  if (importanteAlto && !urgenteAlto) return QUADRANTES.AGENDE;
  if (!importanteAlto && urgenteAlto) return QUADRANTES.DELEGUE;
  return QUADRANTES.ELIMINE;
}

/**
 * Calcula a NOTA de prioridade para ordenar as tarefas.
 * A importância pesa o dobro da urgência — decisão do projeto: o que é
 * importante deve subir na fila mesmo sem prazo apertado (espírito de Eisenhower,
 * que valoriza o quadrante "Agende"). Faixa possível: 3 (1*2+1) a 15 (5*2+5).
 * Maior nota = fazer primeiro.
 */
function pontuarPrioridade(urgencia, importancia) {
  return importancia * 2 + urgencia;
}

/**
 * Monta a "visão calculada" de uma tarefa: acrescenta quadrante e prioridade
 * derivados. Recebe uma tarefa já validada e devolve uma NOVA tarefa (não
 * altera a original — pureza). Serve de ponte entre validar e listar.
 */
function decorarTarefa(tarefa) {
  return {
    ...tarefa,
    quadrante: classificarQuadrante(tarefa.urgencia, tarefa.importancia),
    prioridade: pontuarPrioridade(tarefa.urgencia, tarefa.importancia),
  };
}

/* ----------------------------------------------------------------------------
 * Persistência: transformação PURA entre lista de tarefas e texto (JSON).
 * O acesso ao localStorage em si (não-puro) mora em repositorio.js; aqui ficam
 * só as funções testáveis que serializam e leem, tolerando dado corrompido.
 * ------------------------------------------------------------------------- */

/**
 * Acrescenta uma tarefa à lista, já DECORADA (quadrante + prioridade calculados).
 * Devolve uma NOVA lista (não altera a original — pureza).
 */
function adicionarTarefa(lista, tarefa) {
  return [...lista, decorarTarefa(tarefa)];
}

// Ordem do ciclo de vida da tarefa. Avança nesta ordem e volta um passo; as
// pontas travam (não há beco sem saída — sempre dá para ir para o outro lado).
const ORDEM_STATUS = [STATUS.A_FAZER, STATUS.FAZENDO, STATUS.CONCLUIDA];

/** Índice do status na ordem; status desconhecido é tratado como "a fazer" (0). */
function indiceStatus(status) {
  const i = ORDEM_STATUS.indexOf(status);
  return i === -1 ? 0 : i;
}

/** Próximo status (trava em "concluída"). */
function avancarStatus(status) {
  const i = indiceStatus(status);
  return ORDEM_STATUS[Math.min(i + 1, ORDEM_STATUS.length - 1)];
}

/** Status anterior (trava em "a fazer"). */
function voltarStatus(status) {
  const i = indiceStatus(status);
  return ORDEM_STATUS[Math.max(i - 1, 0)];
}

/**
 * Aplica um novo status a uma tarefa, devolvendo uma NOVA tarefa (pureza).
 * Concluir CARIMBA a data (recebida de fora — `agoraISO` — para manter a
 * pureza); qualquer outro status LIMPA o carimbo (reabrir = sem data).
 */
function definirStatus(tarefa, novoStatus, agoraISO) {
  return {
    ...tarefa,
    status: novoStatus,
    concluidoEm: novoStatus === STATUS.CONCLUIDA ? agoraISO : null,
  };
}

// Ordem fixa em que os quadrantes aparecem na lista (a mais "urgente/importante"
// primeiro). É também a ordem de leitura do painel.
const ORDEM_QUADRANTES = [
  QUADRANTES.FACA_AGORA,
  QUADRANTES.AGENDE,
  QUADRANTES.DELEGUE,
  QUADRANTES.ELIMINE,
];

/**
 * Ordena as tarefas da maior para a menor prioridade. Devolve uma NOVA lista
 * (não altera a original — pureza). A nota é recalculada aqui para não depender
 * de um campo salvo que possa ter sido adulterado (fonte única = o cálculo).
 */
function ordenarPorPrioridade(lista) {
  return [...lista].sort(
    (a, b) =>
      pontuarPrioridade(b.urgencia, b.importancia) - pontuarPrioridade(a.urgencia, a.importancia)
  );
}

/**
 * Ordena por um critério escolhido pelo usuário (preferência persistida):
 * 'prioridade' (padrão, maior primeiro), 'recentes' ou 'antigas' (por data de
 * criação). Sempre devolve uma NOVA lista (pureza).
 */
function ordenarTarefas(lista, criterio) {
  if (criterio === 'recentes') {
    return [...lista].sort((a, b) =>
      String(b.criadoEm || '').localeCompare(String(a.criadoEm || ''))
    );
  }
  if (criterio === 'antigas') {
    return [...lista].sort((a, b) =>
      String(a.criadoEm || '').localeCompare(String(b.criadoEm || ''))
    );
  }
  return ordenarPorPrioridade(lista); // padrão
}

/** É um quadrante conhecido? (usado para ignorar filtro inválido/adulterado) */
function ehQuadranteValido(q) {
  return ORDEM_QUADRANTES.includes(q);
}

/** É um status conhecido? */
function ehStatusValido(s) {
  return ORDEM_STATUS.includes(s);
}

/**
 * Filtra as tarefas por quadrante e por status. Valor 'todos' (ou qualquer valor
 * desconhecido — defesa contra preferência adulterada) não filtra aquela dimensão.
 * Recalcula o quadrante a partir das notas. Devolve uma NOVA lista (pureza).
 */
function filtrarTarefas(lista, filtros) {
  const f = filtros || {};
  const filtraQuad = ehQuadranteValido(f.quadrante);
  const filtraStatus = ehStatusValido(f.status);
  return lista.filter((t) => {
    if (filtraQuad && classificarQuadrante(t.urgencia, t.importancia) !== f.quadrante) return false;
    if (filtraStatus && (t.status || STATUS.A_FAZER) !== f.status) return false;
    return true;
  });
}

/**
 * Agrupa as tarefas pelos quatro quadrantes de Eisenhower, na ordem fixa, cada
 * grupo ordenado pelo critério pedido (padrão: prioridade). Recalcula o quadrante
 * (não confia no campo salvo). Devolve sempre os 4 grupos, mesmo vazios.
 * Formato: [{ quadrante, tarefas: [...] }, ...]
 */
function agruparPorQuadrante(lista, criterio) {
  const ordenada = ordenarTarefas(lista, criterio || 'prioridade');
  return ORDEM_QUADRANTES.map((q) => ({
    quadrante: q,
    tarefas: ordenada.filter((t) => classificarQuadrante(t.urgencia, t.importancia) === q),
  }));
}

// Preferências do usuário (filtros/ordenação) — persistidas no localStorage.
const PREFS_PADRAO = { quadrante: 'todos', status: 'todos', ordem: 'prioridade' };

/**
 * Lê as preferências salvas, com valores-padrão para o que faltar ou estiver
 * corrompido. NUNCA lança: preferência quebrada volta ao padrão (não trava o app).
 */
function lerPreferencias(texto) {
  if (typeof texto !== 'string' || texto.trim() === '') return { ...PREFS_PADRAO };
  try {
    const dados = JSON.parse(texto);
    if (!dados || typeof dados !== 'object' || Array.isArray(dados)) return { ...PREFS_PADRAO };
    return { ...PREFS_PADRAO, ...dados };
  } catch (_erro) {
    return { ...PREFS_PADRAO };
  }
}

/** Uma tarefa está concluída HOJE? (compara a data do carimbo com `hojeISO`). */
function ehConcluidaHoje(tarefa, hojeISO) {
  return (
    tarefa.status === STATUS.CONCLUIDA &&
    typeof tarefa.concluidoEm === 'string' &&
    tarefa.concluidoEm.slice(0, 10) === hojeISO // compara só a parte AAAA-MM-DD
  );
}

/**
 * Calcula os números do painel "Foco do dia". Função pura: recebe a lista e a
 * data de hoje (AAAA-MM-DD) de fora, e devolve os indicadores já prontos.
 * - total: todas as tarefas
 * - pendentes: as que ainda não foram concluídas
 * - fazAgora: pendentes no quadrante "Faça agora" (o que exige ação imediata)
 * - concluidasHoje: quantas foram concluídas na data de hoje
 * - atencao: a tarefa PENDENTE de maior prioridade (o "comece por esta"), ou null
 */
function calcularResumo(lista, hojeISO) {
  const pendentes = lista.filter((t) => (t.status || STATUS.A_FAZER) !== STATUS.CONCLUIDA);
  const fazAgora = pendentes.filter(
    (t) => classificarQuadrante(t.urgencia, t.importancia) === QUADRANTES.FACA_AGORA
  ).length;
  const concluidasHoje = lista.filter((t) => ehConcluidaHoje(t, hojeISO)).length;
  const atencao = ordenarPorPrioridade(pendentes)[0] || null;

  return {
    total: lista.length,
    pendentes: pendentes.length,
    fazAgora,
    concluidasHoje,
    atencao,
  };
}

/**
 * Monta o pacote de exportação dos dados do usuário (LGPD: o dado é dele, ele
 * pode levar). Função pura: recebe a data de fora (`agoraISO`). A tela transforma
 * isso em arquivo para download.
 */
function montarExportacao(lista, agoraISO) {
  return {
    app: 'Prioriza',
    versao: 1,
    exportadoEm: agoraISO,
    total: lista.length,
    tarefas: lista,
  };
}

/**
 * Remove a tarefa de um dado id, devolvendo uma NOVA lista (pureza). Se o id não
 * existir, devolve a lista igual (não quebra). A confirmação com o usuário é
 * responsabilidade da tela (window.confirm) — aqui é só a regra.
 */
function removerTarefa(lista, id) {
  return lista.filter((t) => t.id !== id);
}

/** Converte a lista de tarefas em texto para guardar no localStorage. */
function serializarTarefas(lista) {
  return JSON.stringify(lista);
}

/**
 * Lê tarefas a partir do texto guardado. É a fronteira de segurança do app:
 * NUNCA lança erro. Se o texto for vazio, inválido ou adulterado, devolve [].
 * Também descarta itens que não parecem uma tarefa (defesa contra dado corrompido).
 */
function lerTarefasDe(texto) {
  if (typeof texto !== 'string' || texto.trim() === '') return [];
  try {
    const dados = JSON.parse(texto);
    if (!Array.isArray(dados)) return [];
    return dados.filter(
      (t) =>
        t && typeof t.titulo === 'string' && ehNotaValida(t.urgencia) && ehNotaValida(t.importancia)
    );
  } catch (_erro) {
    return []; // JSON quebrado não pode derrubar o app
  }
}

/* ----------------------------------------------------------------------------
 * Acessibilidade: auditoria de contraste WCAG AA (funções puras).
 * Usadas pelo "relatório de contraste ao vivo" no rodapé (ver index.html).
 * Fórmulas oficiais da WCAG 2.1 (luminância relativa e razão de contraste).
 * ------------------------------------------------------------------------- */

/**
 * Converte uma cor hex (#RGB ou #RRGGBB) em { r, g, b } (0..255).
 * Devolve null se a cor for inválida — quem chama decide o que fazer.
 */
function hexParaRgb(hex) {
  if (typeof hex !== 'string') return null;
  let h = hex.trim().replace(/^#/, '');
  if (h.length === 3)
    h = h
      .split('')
      .map((c) => c + c)
      .join(''); // #f00 -> #ff0000
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  return {
    r: Number.parseInt(h.slice(0, 2), 16),
    g: Number.parseInt(h.slice(2, 4), 16),
    b: Number.parseInt(h.slice(4, 6), 16),
  };
}

/**
 * Luminância relativa de uma cor (0 = preto, 1 = branco), conforme WCAG 2.1.
 * Cada canal é "linearizado" antes de entrar na média ponderada.
 */
function luminancia(hex) {
  const rgb = hexParaRgb(hex);
  if (!rgb) return null;
  const canal = (valor) => {
    const s = valor / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * canal(rgb.r) + 0.7152 * canal(rgb.g) + 0.0722 * canal(rgb.b);
}

/**
 * Razão de contraste entre duas cores (de 1:1 a 21:1), conforme WCAG 2.1.
 * A cor mais clara vai por cima na fórmula (L1 + 0.05) / (L2 + 0.05).
 */
function razaoContraste(hex1, hex2) {
  const l1 = luminancia(hex1);
  const l2 = luminancia(hex2);
  if (l1 === null || l2 === null) return null;
  const clara = Math.max(l1, l2);
  const escura = Math.min(l1, l2);
  return (clara + 0.05) / (escura + 0.05);
}

/**
 * Classifica a razão de contraste no nível WCAG: 'AAA', 'AA' ou 'Reprovado'.
 * Texto grande (>= 18pt, ou 14pt em negrito) tem limites mais baixos.
 */
function nivelWcag(razao, textoGrande = false) {
  if (typeof razao !== 'number' || Number.isNaN(razao)) return null;
  const limiteAA = textoGrande ? 3 : 4.5;
  const limiteAAA = textoGrande ? 4.5 : 7;
  if (razao >= limiteAAA) return 'AAA';
  if (razao >= limiteAA) return 'AA';
  return 'Reprovado';
}

// Exporta para o Jest (Node) e, no navegador, disponibiliza em window.Logica —
// mesmo arquivo roda nos dois lados, sem build.
const api = {
  NOTA_MINIMA,
  NOTA_MAXIMA,
  LIMIAR_ALTO,
  QUADRANTES,
  ORDEM_QUADRANTES,
  STATUS,
  ORDEM_STATUS,
  ehNotaValida,
  validarTarefa,
  classificarQuadrante,
  pontuarPrioridade,
  decorarTarefa,
  avancarStatus,
  voltarStatus,
  definirStatus,
  ordenarPorPrioridade,
  ordenarTarefas,
  filtrarTarefas,
  agruparPorQuadrante,
  ehConcluidaHoje,
  calcularResumo,
  removerTarefa,
  montarExportacao,
  PREFS_PADRAO,
  lerPreferencias,
  adicionarTarefa,
  serializarTarefas,
  lerTarefasDe,
  hexParaRgb,
  luminancia,
  razaoContraste,
  nivelWcag,
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = api;
} else if (typeof window !== 'undefined') {
  window.Logica = api;
}
