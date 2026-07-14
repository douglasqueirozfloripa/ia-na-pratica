/*
 * logica.js — Regras de negócio do "Instância", em FUNÇÕES PURAS.
 *
 * "Função pura" = mesma entrada -> mesma saída, sem mexer em nada por fora
 * (ver GLOSSARIO.md). É o que torna a CLASSIFICAÇÃO da sentença e a PRIORIDADE
 * de atuação testáveis e à prova de erro de digitação: nada disso é digitado
 * pelo usuário — é CALCULADO a partir dos dados do caso.
 *
 * Base jurídica (ver CLAUDE.md / GLOSSARIO.md):
 *  - CPC art. 485 (sentença terminativa, SEM mérito) x art. 487 (definitiva, COM
 *    mérito); carga de eficácia declaratória/constitutiva/condenatória (Liebman);
 *    espécie quanto ao órgão julgador (simples/plúrima/complexa).
 *  - Ótica cível do consumidor de energia: CDC (Lei 8.078/1990) + REN ANEEL
 *    1.000/2021 — daí os tipos de lide.
 *
 * Coberto por: logica.test.js (Jest).
 */

// ---------------------------------------------------------------------------
// Domínios (valores válidos). Ficam em constantes para a tela e os testes
// reusarem os MESMOS valores — nada de "string mágica" espalhada pelo código.
// ---------------------------------------------------------------------------

// Os 6 tipos de lide de consumo (todos ancorados em CDC/ANEEL). Cada um tem um
// `slug` (valor guardado, estável) e um `rotulo` (texto amigável na tela).
const TIPOS_LIDE = [
  { slug: 'cobranca-indevida', rotulo: 'Cobrança / faturamento indevido' },
  {
    slug: 'recuperacao-consumo',
    rotulo: 'Recuperação de consumo / irregularidade no medidor (TOI)',
  },
  { slug: 'corte-fornecimento', rotulo: 'Interrupção / corte de fornecimento' },
  { slug: 'dano-moral', rotulo: 'Dano moral' },
  { slug: 'dano-material', rotulo: 'Dano material (danos elétricos)' },
  {
    slug: 'repeticao-indebito',
    rotulo: 'Repetição de indébito (devolução em dobro, art. 42 CDC)',
  },
];
const TIPOS_LIDE_SLUGS = TIPOS_LIDE.map((t) => t.slug);

// Carga de eficácia da sentença de mérito (classificação ternária de Liebman).
const CARGAS = ['declaratoria', 'constitutiva', 'condenatoria'];

// Resultado do ponto de vista da concessionária (quem move a ação de consumo em
// regra é o cliente): "procedente" = pedido do cliente acolhido (exposição maior);
// "improcedente" = empresa venceu; "parcial" = meio a meio.
const RESULTADOS = ['procedente', 'parcial', 'improcedente'];

// Órgão que proferiu a decisão -> espécie "subjetiva" (do artigo de referência).
const ORGAOS_JULGADORES = ['singular', 'colegiado', 'complexo'];
const ORGAO_PARA_ESPECIE = {
  singular: 'simples', // um juiz só (típico do 1º grau)
  colegiado: 'plurima', // um colegiado (o acórdão da apelação/instância superior)
  complexo: 'complexa', // mais de um órgão decide (ex.: Júri)
};

// Fases recursais = o ciclo de status (o ciclo em si é implementado no Prompt 6).
const FASES = ['primeiro-grau', 'apelacao', 'instancia-superior', 'transitado'];
const FASE_ROTULO = {
  'primeiro-grau': '1º grau',
  apelacao: 'Apelação (2º grau)',
  'instancia-superior': 'Instância superior (STJ/STF)',
  transitado: 'Transitado em julgado',
};

// Espécie quanto ao mérito.
const ESPECIE_MERITO = { TERMINATIVA: 'terminativa', DEFINITIVA: 'definitiva' };

// ---------------------------------------------------------------------------
// Auxiliares puros
// ---------------------------------------------------------------------------

/** Texto não vazio (ignora espaços em branco nas pontas). */
function ehTextoPreenchido(valor) {
  return typeof valor === 'string' && valor.trim().length > 0;
}

/**
 * Faixa de exposição financeira (0 a 4) — quanto maior o valor em risco, maior a
 * faixa. Usar faixas (em vez do valor cru) deixa a prioridade estável e testável.
 */
function faixaValor(valorEmRisco) {
  if (valorEmRisco <= 1000) return 0;
  if (valorEmRisco <= 10000) return 1;
  if (valorEmRisco <= 50000) return 2;
  if (valorEmRisco <= 100000) return 3;
  return 4;
}

/**
 * Faixa de urgência do prazo (0 a 4) — quanto MENOS dias faltam, mais urgente.
 * `null` = sem prazo aberto (ex.: já transitado em julgado) -> 0.
 * `<= 0` = vencido ou vence hoje -> urgência máxima.
 */
function faixaPrazo(diasParaPrazo) {
  if (diasParaPrazo === null || diasParaPrazo === undefined) return 0;
  if (diasParaPrazo <= 0) return 4;
  if (diasParaPrazo <= 7) return 3;
  if (diasParaPrazo <= 15) return 2;
  if (diasParaPrazo <= 30) return 1;
  return 0;
}

// ---------------------------------------------------------------------------
// Regras de negócio (as três funções centrais do Prompt 2)
// ---------------------------------------------------------------------------

/**
 * Valida os campos obrigatórios de uma Decisão ANTES de salvar.
 * Não lança erro: devolve um relatório { valida, erros } para a tela decidir o
 * que mostrar. Regra de consumo/CPC: a carga de eficácia SÓ é exigida quando a
 * sentença resolveu o mérito (sentença terminativa não tem carga).
 */
function validarDecisao(decisao) {
  const erros = [];
  const d = decisao || {};

  if (!ehTextoPreenchido(d.numeroProcesso)) {
    erros.push('numeroProcesso é obrigatório');
  }
  if (!TIPOS_LIDE_SLUGS.includes(d.tipoLide)) {
    erros.push('tipoLide inválido');
  }
  if (!ORGAOS_JULGADORES.includes(d.orgaoJulgador)) {
    erros.push('orgaoJulgador inválido');
  }
  if (typeof d.resolveuMerito !== 'boolean') {
    erros.push('resolveuMerito deve ser booleano');
  }
  // Carga só faz sentido (e é obrigatória) quando houve resolução de mérito.
  if (d.resolveuMerito === true && !CARGAS.includes(d.cargaEficacia)) {
    erros.push('cargaEficacia é obrigatória quando a sentença resolve o mérito');
  }
  if (!RESULTADOS.includes(d.resultado)) {
    erros.push('resultado inválido');
  }
  if (typeof d.valorCausa !== 'number' || !Number.isFinite(d.valorCausa) || d.valorCausa < 0) {
    erros.push('valorCausa deve ser um número >= 0');
  }
  // valorCondenacao é opcional (0 quando a empresa não foi condenada), mas se vier
  // precisa ser um número >= 0.
  if (
    d.valorCondenacao !== undefined &&
    d.valorCondenacao !== null &&
    (typeof d.valorCondenacao !== 'number' ||
      !Number.isFinite(d.valorCondenacao) ||
      d.valorCondenacao < 0)
  ) {
    erros.push('valorCondenacao deve ser um número >= 0');
  }

  return { valida: erros.length === 0, erros };
}

/**
 * Classifica a ESPÉCIE da sentença a partir de três eixos, SEM digitar nada:
 *  - mérito: resolveu (definitiva, art. 487) ou não (terminativa, art. 485);
 *  - carga:  declaratória/constitutiva/condenatória (só existe se houve mérito);
 *  - órgão:  simples/plúrima/complexa (do órgão julgador).
 *
 * Regra dura: SEM mérito NUNCA é definitiva e NÃO tem carga (mesmo que uma carga
 * seja passada por engano, ela é ignorada). Entradas inválidas lançam erro — a
 * tela deve chamar validarDecisao() antes.
 */
function classificarEspecie(resolveuMerito, cargaEficacia, orgaoJulgador) {
  if (typeof resolveuMerito !== 'boolean') {
    throw new TypeError('resolveuMerito deve ser booleano');
  }
  const orgao = ORGAO_PARA_ESPECIE[orgaoJulgador];
  if (!orgao) {
    throw new RangeError('orgaoJulgador inválido: ' + orgaoJulgador);
  }

  const merito = resolveuMerito ? ESPECIE_MERITO.DEFINITIVA : ESPECIE_MERITO.TERMINATIVA;

  let carga = null;
  if (resolveuMerito) {
    if (!CARGAS.includes(cargaEficacia)) {
      throw new RangeError('cargaEficacia inválida: ' + cargaEficacia);
    }
    carga = cargaEficacia;
  }

  return { merito, carga, orgao };
}

/**
 * Pontua a PRIORIDADE DE ATUAÇÃO (número inteiro; quanto maior, mais urgente).
 * Cruza três sinais:
 *  - resultado: procedente (empresa perdeu) pesa mais que parcial, que pesa mais
 *    que improcedente (empresa venceu);
 *  - exposição financeira: o VALOR DA CAUSA (faixaValor);
 *  - urgência do prazo recursal (faixaPrazo).
 * Fórmula: pesoResultado * (2*faixaValor + 2*faixaPrazo + 1) — monotônica em cada
 * eixo, então é fácil de conferir por teste.
 */
function pontuarPrioridade(valorCausa, resultado, diasParaPrazo) {
  if (typeof valorCausa !== 'number' || !Number.isFinite(valorCausa) || valorCausa < 0) {
    throw new TypeError('valorCausa deve ser um número >= 0');
  }
  if (!RESULTADOS.includes(resultado)) {
    throw new RangeError('resultado inválido: ' + resultado);
  }
  if (
    diasParaPrazo !== null &&
    diasParaPrazo !== undefined &&
    (typeof diasParaPrazo !== 'number' || !Number.isFinite(diasParaPrazo))
  ) {
    throw new TypeError('diasParaPrazo deve ser número ou null');
  }

  const pesoResultado = { procedente: 3, parcial: 2, improcedente: 1 }[resultado];
  return pesoResultado * (2 * faixaValor(valorCausa) + 2 * faixaPrazo(diasParaPrazo) + 1);
}

/* ---------------------------------------------------------------------------
 * Persistência (regras PURAS): como serializar e como LER com segurança. O
 * acesso ao localStorage em si fica no repositorio.js (impuro, fora daqui).
 * ------------------------------------------------------------------------- */

/**
 * Acrescenta uma decisão à lista. Devolve uma NOVA lista (não altera a
 * original — pureza).
 */
function adicionarDecisao(lista, decisao) {
  return [...lista, decisao];
}

/** Remove a decisão de id informado. Devolve NOVA lista (não muta a original). */
function removerDecisao(lista, id) {
  return lista.filter((d) => d && d.id !== id);
}

/**
 * Monta o pacote de exportação (LGPD: o dado é do usuário — ele leva embora).
 * "agora" é injetado para a função ser pura/testável.
 */
function montarExportacao(lista, agoraISO) {
  const decisoes = Array.isArray(lista) ? lista : [];
  return {
    app: 'Instância',
    geradoEm: agoraISO,
    total: decisoes.length,
    decisoes,
  };
}

/** Converte a lista de decisões em texto para guardar no localStorage. */
function serializarDecisoes(lista) {
  return JSON.stringify(lista);
}

/** Uma decisão salva parece íntegra? (defesa contra dado corrompido/adulterado) */
function pareceDecisao(d) {
  return (
    d &&
    typeof d === 'object' &&
    ehTextoPreenchido(d.numeroProcesso) &&
    TIPOS_LIDE_SLUGS.includes(d.tipoLide)
  );
}

/**
 * Lê decisões a partir do texto guardado. É a fronteira de segurança do app:
 * NUNCA lança erro. Texto vazio, inválido ou adulterado devolve []. Também
 * descarta itens que não parecem uma decisão.
 */
function lerDecisoesDe(texto) {
  if (typeof texto !== 'string' || texto.trim() === '') return [];
  try {
    const dados = JSON.parse(texto);
    if (!Array.isArray(dados)) return [];
    return dados.filter(pareceDecisao);
  } catch (_erro) {
    return []; // JSON quebrado não pode derrubar o app
  }
}

/* ---------------------------------------------------------------------------
 * Lista: ordenação por prioridade e agrupamento por fase recursal.
 * "Hoje" é INJETADO (hojeISO) para as funções continuarem puras e testáveis —
 * nada de ler o relógio aqui dentro.
 * ------------------------------------------------------------------------- */

/** Converte 'YYYY-MM-DD' em milissegundos UTC (meia-noite). null se inválido. */
function parseDataISO(iso) {
  if (typeof iso !== 'string') return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return null;
  return Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

/** Dias entre hoje e o prazo (negativo = vencido; null se não há prazo/inválido). */
function diasEntre(hojeISO, prazoISO) {
  const hoje = parseDataISO(hojeISO);
  const prazo = parseDataISO(prazoISO);
  if (hoje === null || prazo === null) return null;
  return Math.round((prazo - hoje) / 86400000);
}

/**
 * Prioridade de atuação de uma decisão salva, recalculada (nunca lida de campo
 * gravado — assim dado adulterado não engana a ordenação). Decisão sem dados
 * suficientes pontua 0.
 */
function prioridadeDaDecisao(decisao, hojeISO) {
  if (!decisao || !RESULTADOS.includes(decisao.resultado)) return 0;
  if (typeof decisao.valorCausa !== 'number' || decisao.valorCausa < 0) return 0;
  return pontuarPrioridade(
    decisao.valorCausa,
    decisao.resultado,
    diasEntre(hojeISO, decisao.prazoRecursalAte)
  );
}

/**
 * Ordena da maior para a menor prioridade. Empate mantém a ordem original
 * (ordenação estável). Devolve NOVA lista (não muta a original).
 */
function ordenarPorPrioridade(lista, hojeISO) {
  return [...lista]
    .map((d, i) => ({ d, i, p: prioridadeDaDecisao(d, hojeISO) }))
    .sort((a, b) => b.p - a.p || a.i - b.i)
    .map((x) => x.d);
}

/**
 * Agrupa as decisões pelas fases recursais, na ORDEM fixa das fases, cada grupo
 * já ordenado por prioridade e com o total. Itens com fase desconhecida são
 * ignorados (defesa contra dado corrompido).
 */
function agruparPorFase(lista, hojeISO) {
  return FASES.map((fase) => {
    const itens = ordenarPorPrioridade(
      lista.filter((d) => d && d.faseRecursal === fase),
      hojeISO
    );
    return { fase, rotulo: FASE_ROTULO[fase], itens, total: itens.length };
  });
}

/* ---------------------------------------------------------------------------
 * Ciclo de fases recursais: avança na ordem e volta um passo (sem beco sem
 * saída). Transitar em julgado carimba a data; sair do trânsito limpa. "Agora"
 * é INJETADO para as funções continuarem puras.
 * ------------------------------------------------------------------------- */

/** Índice da fase na ordem; fase desconhecida é tratada como 1º grau (0). */
function indiceFase(fase) {
  const i = FASES.indexOf(fase);
  return i === -1 ? 0 : i;
}

/** Próxima fase (trava em "transitado" — última). */
function avancarFase(fase) {
  return FASES[Math.min(indiceFase(fase) + 1, FASES.length - 1)];
}

/** Fase anterior (trava em "primeiro-grau" — primeira). */
function voltarFase(fase) {
  return FASES[Math.max(indiceFase(fase) - 1, 0)];
}

/**
 * Devolve uma NOVA decisão na fase informada. Se a nova fase for "transitado",
 * carimba a data (agoraISO); qualquer outra fase LIMPA a data de trânsito
 * (reabrir volta a correr). Fase inválida lança erro.
 */
function definirFase(decisao, novaFase, agoraISO) {
  if (!FASES.includes(novaFase)) {
    throw new RangeError('fase inválida: ' + novaFase);
  }
  const transitou = novaFase === 'transitado';
  return {
    ...decisao,
    faseRecursal: novaFase,
    dataTransito: transitou ? agoraISO : null,
  };
}

/* ---------------------------------------------------------------------------
 * Painel do contencioso (dashboard): números-chave do conjunto de decisões.
 * ------------------------------------------------------------------------- */

/** Soma segura de um campo numérico (ignora ausente/negativo/estranho). */
function somaSegura(valor) {
  return typeof valor === 'number' && Number.isFinite(valor) && valor > 0 ? valor : 0;
}

/**
 * Resumo do contencioso. "Ativo" = ainda não transitou em julgado.
 *  - total: quantas decisões há;
 *  - prazoCorrendo: ativas com prazo recursal em aberto (dias >= 0);
 *  - transitados: já transitadas em julgado;
 *  - exposicaoAtiva: soma do VALOR DA CAUSA das ativas (o que ainda está em jogo).
 *    Quando TODAS transitaram, zera — não há mais nada "em disputa";
 *  - totalCondenado: soma do VALOR FINAL CONDENATÓRIO (a pagar) de todas;
 *  - percentDefendidos: % de improcedentes (casos em que a empresa se defendeu);
 *  - destaque: a ativa de maior prioridade ("aja por esta primeiro") ou null.
 */
function calcularResumo(lista, hojeISO) {
  const arr = Array.isArray(lista) ? lista : [];
  let total = 0;
  let prazoCorrendo = 0;
  let transitados = 0;
  let exposicaoAtiva = 0;
  let totalCondenado = 0;
  let improcedentes = 0;
  let destaque = null;

  for (const d of arr) {
    if (!d) continue; // item nulo não conta
    total += 1;
    totalCondenado += somaSegura(d.valorCondenacao);
    if (d.resultado === 'improcedente') improcedentes += 1;

    if (d.faseRecursal === 'transitado') {
      transitados += 1;
      continue; // transitada não entra na exposição "em disputa"
    }
    exposicaoAtiva += somaSegura(d.valorCausa);
    const dias = diasEntre(hojeISO, d.prazoRecursalAte);
    if (dias !== null && dias >= 0) prazoCorrendo += 1;

    const p = prioridadeDaDecisao(d, hojeISO);
    if (!destaque || p > destaque.prioridade) {
      destaque = { numeroProcesso: d.numeroProcesso, prioridade: p };
    }
  }

  const percentDefendidos = total === 0 ? 0 : Math.round((improcedentes / total) * 100);
  return {
    total,
    prazoCorrendo,
    transitados,
    exposicaoAtiva,
    totalCondenado,
    percentDefendidos,
    destaque,
  };
}

/* ---------------------------------------------------------------------------
 * Filtros / preferências (persistidos): por fase, por espécie (mérito) e por
 * resultado. Valor "todas"/"todos" = sem filtro.
 * ------------------------------------------------------------------------- */

const PREFS_PADRAO = { fase: 'todas', especie: 'todas', resultado: 'todos' };
const ESPECIES_FILTRO = ['todas', 'terminativa', 'definitiva'];

/**
 * Lê as preferências a partir do texto guardado, blindada: valor ausente,
 * corrompido ou desconhecido volta ao padrão (nunca lança).
 */
function lerPreferencias(texto) {
  const prefs = { ...PREFS_PADRAO };
  if (typeof texto !== 'string' || texto.trim() === '') return prefs;
  try {
    const dados = JSON.parse(texto);
    if (!dados || typeof dados !== 'object') return prefs;
    if (dados.fase === 'todas' || FASES.includes(dados.fase)) prefs.fase = dados.fase;
    if (ESPECIES_FILTRO.includes(dados.especie)) prefs.especie = dados.especie;
    if (dados.resultado === 'todos' || RESULTADOS.includes(dados.resultado)) {
      prefs.resultado = dados.resultado;
    }
    return prefs;
  } catch (_erro) {
    return prefs; // preferência corrompida cai no padrão
  }
}

/** Filtra a lista pelas preferências (fase, espécie/mérito e resultado). */
function filtrarDecisoes(lista, prefs) {
  const p = { ...PREFS_PADRAO, ...(prefs || {}) };
  return (Array.isArray(lista) ? lista : []).filter((d) => {
    if (!d) return false;
    if (p.fase !== 'todas' && d.faseRecursal !== p.fase) return false;
    if (p.especie !== 'todas') {
      const merito = d.resolveuMerito ? 'definitiva' : 'terminativa';
      if (merito !== p.especie) return false;
    }
    if (p.resultado !== 'todos' && d.resultado !== p.resultado) return false;
    return true;
  });
}

/**
 * Monta o rótulo amigável da espécie (para a prévia da tela). Ex.:
 * { merito:'definitiva', carga:'condenatoria', orgao:'plurima' } ->
 * "Definitiva · condenatória · plúrima (acórdão)". Função pura de apresentação.
 */
function rotuloEspecie(especie) {
  if (!especie || typeof especie !== 'object') return '';
  const CARGA_ROTULO = {
    declaratoria: 'declaratória',
    constitutiva: 'constitutiva',
    condenatoria: 'condenatória',
  };
  const ORGAO_ROTULO = {
    simples: 'simples',
    plurima: 'plúrima (acórdão)',
    complexa: 'complexa',
  };
  const partes = [];
  if (especie.merito) {
    partes.push(especie.merito === 'definitiva' ? 'Definitiva' : 'Terminativa');
  }
  if (especie.carga) partes.push(CARGA_ROTULO[especie.carga] || especie.carga);
  if (especie.orgao) partes.push(ORGAO_ROTULO[especie.orgao] || especie.orgao);
  return partes.join(' · ');
}

/* ---------------------------------------------------------------------------
 * Acessibilidade — contraste WCAG 2.1 (funções puras, alimentam o rodapé ao vivo).
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

/* ---------------------------------------------------------------------------
 * Espaçamento garantido por TESTE (não só pelo olho): mede a folga entre as
 * caixas dos elementos e exige distância > 0,5px, ignorando pares pai/filho.
 * ------------------------------------------------------------------------- */

/** Uma caixa contém a outra? (par pai/filho — devem se sobrepor de propósito) */
function umContemOutro(a, b) {
  const aDentroDeB =
    a.left >= b.left && a.top >= b.top && a.right <= b.right && a.bottom <= b.bottom;
  const bDentroDeA =
    b.left >= a.left && b.top >= a.top && b.right <= a.right && b.bottom <= a.bottom;
  return aDentroDeB || bDentroDeA;
}

/**
 * Recebe uma lista de caixas ({ id, left, top, right, bottom }) e verifica se
 * NENHUM par (que não seja pai/filho) está colado ou sobreposto. Considera colado
 * quando a folga entre as caixas é <= 0,5px em ambos os eixos (ou seja, elas se
 * tocam/invadem). Função pura: recebe os retângulos prontos (na tela vêm do
 * getBoundingClientRect) e devolve { ok, colisoes }.
 */
function validarEspacamento(caixas, folgaMinima = 0.5) {
  const lista = Array.isArray(caixas) ? caixas : [];
  const colisoes = [];
  for (let i = 0; i < lista.length; i++) {
    for (let j = i + 1; j < lista.length; j++) {
      const a = lista[i];
      const b = lista[j];
      if (umContemOutro(a, b)) continue; // pai/filho: ok se contêm
      // Folga entre as caixas em cada eixo (positiva = há espaço entre elas).
      const folgaX = Math.max(b.left - a.right, a.left - b.right);
      const folgaY = Math.max(b.top - a.bottom, a.top - b.bottom);
      // Só há SEPARAÇÃO real se houver folga suficiente em ALGUM eixo.
      const separadas = folgaX > folgaMinima || folgaY > folgaMinima;
      if (!separadas) {
        colisoes.push({ a: a.id, b: b.id, folgaX, folgaY });
      }
    }
  }
  return { ok: colisoes.length === 0, colisoes };
}

// ---------------------------------------------------------------------------
// Exporta a API tanto para o Node/Jest (module.exports) quanto para o navegador
// (window.Logica) — o mesmo arquivo roda nos dois lugares.
// ---------------------------------------------------------------------------

const api = {
  TIPOS_LIDE,
  TIPOS_LIDE_SLUGS,
  CARGAS,
  RESULTADOS,
  ORGAOS_JULGADORES,
  ORGAO_PARA_ESPECIE,
  FASES,
  ESPECIE_MERITO,
  FASE_ROTULO,
  ehTextoPreenchido,
  faixaValor,
  faixaPrazo,
  validarDecisao,
  classificarEspecie,
  pontuarPrioridade,
  adicionarDecisao,
  removerDecisao,
  montarExportacao,
  serializarDecisoes,
  lerDecisoesDe,
  PREFS_PADRAO,
  lerPreferencias,
  filtrarDecisoes,
  diasEntre,
  prioridadeDaDecisao,
  ordenarPorPrioridade,
  agruparPorFase,
  indiceFase,
  avancarFase,
  voltarFase,
  definirFase,
  calcularResumo,
  rotuloEspecie,
  hexParaRgb,
  luminancia,
  razaoContraste,
  nivelWcag,
  validarEspacamento,
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = api;
} else if (typeof window !== 'undefined') {
  window.Logica = api;
}
