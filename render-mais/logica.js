// logica.js — regras de negócio do app "Render Mais" em FUNÇÕES PURAS.
// Função pura = para a mesma entrada, sempre a mesma saída, e não mexe em nada
// externo (sem localStorage, sem DOM, sem data/hora "de agora"). Isso torna tudo
// fácil de testar e à prova de erro de digitação.
// Testado por: logica.test.js  (rode com: npm test)

// --- Constantes do domínio -------------------------------------------------

// Categorias de produto que o app aceita. É a ÚNICA fonte da verdade — tela,
// testes e validação usam esta mesma lista (nada de string solta espalhada).
const CATEGORIAS = [
  'tesouro', // título público (ex.: Tesouro Selic/LFT)
  'cdb-pre', // CDB prefixado
  'cdb-di', // CDB pós-fixado (% do CDI)
  'letra', // LCI / LCA / LF
  'fundo', // fundo de renda fixa
  'poupanca', // poupança
  'multimercado', // fundo multimercado (renda variável)
  'acoes', // ações / fundos de ações (renda variável)
];

// Produtos ISENTOS de Imposto de Renda. Convenção calibrada pela lei: LCI/LCA e
// poupança não pagam IR — por isso um "% do CDI" menor pode render mais LÍQUIDO.
const CATEGORIAS_ISENTAS = ['letra', 'poupanca'];

// Renda VARIÁVEL: não rende "% do CDI" (não há garantia). Nessas categorias o
// usuário informa a RENTABILIDADE ESPERADA ao ano (líquida), e o app projeta com
// ela. É o que permite representar ações/multimercado ao lado da renda fixa.
const CATEGORIAS_RENDA_VARIAVEL = ['multimercado', 'acoes'];

// Nível de risco POR CATEGORIA. Rótulos são convenção interna, calibrada pelas
// referências (FGC, natureza do emissor / volatilidade):
// - Tesouro e Poupança: risco soberano/garantia estatal → muito baixo.
// - CDB e Letras: cobertos pelo FGC até o teto → baixo.
// - Fundo RF e Multimercado: marcação a mercado / come-cotas → médio.
// - Ações: renda variável, sem garantia e volátil → alto.
const RISCO_POR_CATEGORIA = {
  tesouro: 'muito baixo',
  poupanca: 'muito baixo',
  'cdb-pre': 'baixo',
  'cdb-di': 'baixo',
  letra: 'baixo',
  fundo: 'médio',
  multimercado: 'médio',
  acoes: 'alto',
};

// Ordem de prioridade dos níveis de risco (do mais seguro ao menos), para a lista
// e o dashboard agruparem sempre na mesma sequência.
const NIVEIS_DE_RISCO = ['muito baixo', 'baixo', 'médio', 'alto'];

// Ciclo de vida de um aporte, na ordem. Avança um passo por vez e volta um passo
// (nada é beco sem saída). É a ÚNICA fonte da verdade do ciclo.
const STATUS = ['planejado', 'aplicado', 'resgatavel', 'resgatado'];

// Perfis de investidor (suitability) e o TETO de risco médio de cada um
// (convenção interna, calibrada pelas referências): o eixo de aderência é a
// fatia de risco médio — quanto mais conservador, menor o teto tolerado.
const PERFIS = ['conservador', 'moderado', 'agressivo'];
const TETO_RISCO_MEDIO = { conservador: 0.15, moderado: 0.3, agressivo: 0.6 };

// Horizontes de prazo (dias corridos), para filtrar por "quando preciso do dinheiro".
const HORIZONTES = ['curto', 'medio', 'longo'];

// Teto de garantia do FGC: R$ 250 mil por CPF e por instituição. Acima disso, o
// excedente não está coberto. Categorias cobertas pelo FGC:
const TETO_FGC = 250000;
const CATEGORIAS_FGC = ['cdb-pre', 'cdb-di', 'letra', 'poupanca'];

// Base de dias do ano usada para "descompactar" a taxa anual em taxa diária.
// DECISÃO (convenção interna, simplificação didática): usamos DIAS CORRIDOS sobre
// 365. O mercado de renda fixa costuma compor em 252 dias ÚTEIS, mas manter tudo
// em dias corridos deixa o `dias` com UM significado só — o mesmo que a tabela de
// IR usa (os prazos 180/360/720 são corridos). Fica claro, consistente e testável.
const DIAS_NO_ANO = 365;

// --- Utilitários internos --------------------------------------------------

// Arredonda para 2 casas (dinheiro), evitando o "ruído" de ponto flutuante.
function arredondar2(numero) {
  return Math.round(numero * 100) / 100;
}

// --- Funções puras (o coração do app) --------------------------------------

// Nível de risco de uma categoria. Lança erro se a categoria não existir — assim
// um valor inválido aparece já nos testes, em vez de virar cálculo silencioso.
function nivelDeRisco(categoria) {
  const nivel = RISCO_POR_CATEGORIA[categoria];
  if (!nivel) {
    throw new Error(`Categoria desconhecida: "${categoria}"`);
  }
  return nivel;
}

// Uma categoria é isenta de IR? (LCI/LCA e poupança são.)
function ehIsento(categoria) {
  return CATEGORIAS_ISENTAS.includes(categoria);
}

// A categoria é de RENDA VARIÁVEL? (ações/multimercado — sem "% do CDI".)
function ehRendaVariavel(categoria) {
  return CATEGORIAS_RENDA_VARIAVEL.includes(categoria);
}

// Alíquota do IR regressivo pela tabela oficial (prazo em DIAS CORRIDOS):
// até 180 → 22,5% · 181–360 → 20% · 361–720 → 17,5% · acima de 720 → 15%.
// Quanto mais tempo o dinheiro fica parado, menos imposto sobre o ganho.
function aliquotaIR(dias) {
  if (dias <= 0) {
    throw new Error('O prazo (dias) deve ser maior que zero.');
  }
  if (dias <= 180) return 0.225;
  if (dias <= 360) return 0.2;
  if (dias <= 720) return 0.175;
  return 0.15;
}

// Rendimento BRUTO (só o ganho, sem o principal) de um aporte pós-fixado em % do
// CDI. Compomos a taxa diária do CDI, aplicamos o percentual do produto e
// capitalizamos pelos dias corridos. `cdiAnual` e `pctCDI` entram como DECIMAIS
// (ex.: CDI 10,65% a.a. = 0.1065; 110% do CDI = 1.10).
function rendimentoBruto(valor, pctCDI, cdiAnual, dias) {
  if (valor <= 0) throw new Error('O valor do aporte deve ser maior que zero.');
  if (pctCDI < 0) throw new Error('O percentual do CDI não pode ser negativo.');
  if (cdiAnual < 0) throw new Error('O CDI anual não pode ser negativo.');
  if (dias <= 0) throw new Error('O prazo (dias) deve ser maior que zero.');

  // Taxa diária do CDI (dias corridos) e a fatia que o produto paga dela.
  const fatorDiarioCDI = Math.pow(1 + cdiAnual, 1 / DIAS_NO_ANO);
  const taxaDiariaProduto = (fatorDiarioCDI - 1) * pctCDI;
  // Capitaliza (juros compostos) pelos dias e devolve só o ganho sobre o valor.
  const fatorProduto = Math.pow(1 + taxaDiariaProduto, dias);
  return arredondar2(valor * (fatorProduto - 1));
}

// Imposto sobre o GANHO, pela alíquota regressiva do prazo. Retorna 0 se o
// ganho for zero/negativo (não há imposto sobre prejuízo/nada).
function impostoRegressivo(ganho, dias) {
  if (ganho <= 0) return 0;
  return arredondar2(ganho * aliquotaIR(dias));
}

// Rendimento LÍQUIDO (o que sobra no bolso): ganho bruto menos o IR — a menos que
// a categoria seja isenta (LCI/LCA/poupança), quando o líquido == bruto.
function rendimentoLiquido(valor, pctCDI, cdiAnual, dias, categoria) {
  const bruto = rendimentoBruto(valor, pctCDI, cdiAnual, dias);
  const imposto = ehIsento(categoria) ? 0 : impostoRegressivo(bruto, dias);
  return arredondar2(bruto - imposto);
}

// IR da renda variável sobre o GANHO (simplificação didática, sem isenção de
// R$ 20 mil/mês em ações): AÇÕES = 15% fixo; MULTIMERCADO = tabela regressiva
// (como fundo). Prejuízo (ganho ≤ 0) não paga IR.
function impostoRendaVariavel(ganho, dias, categoria) {
  if (ganho <= 0) return 0;
  if (categoria === 'acoes') return arredondar2(ganho * 0.15);
  return impostoRegressivo(ganho, dias); // multimercado
}

// Rendimento líquido a partir de um APORTE (objeto), despachando por tipo:
// - Renda fixa: usa % do CDI + IR regressivo (função acima).
// - Renda variável: usa a `rentabilidadeAnual` ESPERADA (BRUTA) informada pelo
//   usuário, capitaliza pelos dias e desconta o IR da RV — sem garantia (estimativa).
function rendimentoLiquidoDeAporte(a) {
  if (ehRendaVariavel(a.categoria)) {
    if (!(a.valor > 0) || !(a.dias > 0)) return 0;
    const r = typeof a.rentabilidadeAnual === 'number' ? a.rentabilidadeAnual : 0;
    const ganho = a.valor * (Math.pow(1 + r, a.dias / DIAS_NO_ANO) - 1);
    return arredondar2(ganho - impostoRendaVariavel(ganho, a.dias, a.categoria));
  }
  return rendimentoLiquido(a.valor, a.pctCDI, a.cdiAnual, a.dias, a.categoria);
}

// Peso de um aporte na carteira (fração de 0 a 1). Divisão por zero blindada:
// carteira vazia → peso 0 (a tela formata como %). Nunca "quebra" a conta.
function pesoNaCarteira(valorAporte, totalCarteira) {
  if (totalCarteira <= 0) return 0;
  return valorAporte / totalCarteira;
}

// Valida um aporte antes de aceitar. Devolve { valido, erros } — a tela mostra a
// lista de erros; nada de valor derivado (rendimento, risco) é DIGITADO à mão.
function validarAporte(aporte) {
  const erros = [];
  const a = aporte || {};

  if (!a.produto || String(a.produto).trim() === '') {
    erros.push('Informe o nome do produto.');
  }
  if (!CATEGORIAS.includes(a.categoria)) {
    erros.push('Selecione uma categoria válida.');
  }
  if (typeof a.valor !== 'number' || !(a.valor > 0)) {
    erros.push('O valor deve ser um número maior que zero.');
  }
  if (ehRendaVariavel(a.categoria)) {
    // Renda variável: em vez de % do CDI, exige a rentabilidade esperada ao ano.
    if (typeof a.rentabilidadeAnual !== 'number') {
      erros.push('Informe a rentabilidade esperada (% ao ano).');
    }
  } else if (typeof a.pctCDI !== 'number' || a.pctCDI < 0) {
    erros.push('O percentual do CDI deve ser um número não negativo.');
  }
  if (typeof a.dias !== 'number' || !(a.dias > 0)) {
    erros.push('O prazo (dias) deve ser um número maior que zero.');
  }

  return { valido: erros.length === 0, erros };
}

// --- Organização da carteira (funções puras) -------------------------------

// Patrimônio total da carteira (soma dos valores aplicados).
function totalCarteira(lista) {
  return (Array.isArray(lista) ? lista : []).reduce((soma, a) => soma + (a.valor || 0), 0);
}

// Ordena por valor aplicado (maior primeiro). Como o peso é valor/total, ordenar
// por valor é o mesmo que ordenar por peso na carteira. Não muta a lista original.
function ordenarPorValor(lista) {
  return [...lista].sort((a, b) => b.valor - a.valor);
}

// Remove o aporte de dado id, devolvendo uma NOVA lista (não muta a original).
function removerAporte(lista, id) {
  return (Array.isArray(lista) ? lista : []).filter((a) => a.id !== id);
}

// Agrupa os aportes por NÍVEL DE RISCO, na ordem muito baixo → baixo → médio.
// Cada grupo traz seus itens (ordenados por valor), a quantidade, a soma e o
// PESO do grupo na carteira (fração de 0 a 1) — os indicadores por grupo.
function agruparPorRisco(lista) {
  const total = totalCarteira(lista);
  return NIVEIS_DE_RISCO.map((nivel) => {
    const itens = ordenarPorValor(lista.filter((a) => nivelDeRisco(a.categoria) === nivel));
    const somaValor = itens.reduce((soma, a) => soma + a.valor, 0);
    return {
      nivel,
      itens,
      quantidade: itens.length,
      somaValor,
      peso: pesoNaCarteira(somaValor, total),
    };
  });
}

// --- Dashboard: indicadores da carteira (funções puras) --------------------

// Rendimento líquido projetado da carteira inteira (soma do líquido de cada aporte).
function rendimentoLiquidoCarteira(lista) {
  const soma = (Array.isArray(lista) ? lista : []).reduce(
    (acc, a) => acc + rendimentoLiquidoDeAporte(a),
    0
  );
  return arredondar2(soma);
}

// Aderência a um PERFIL: compara a fatia ARRISCADA (médio + alto) com o teto do
// perfil. Aderente enquanto ela ficar dentro do teto (conservador ≤ 15%).
function aderenciaPerfil(lista, perfil = 'conservador') {
  const grupos = agruparPorRisco(lista);
  const peso = (nivel) => {
    const g = grupos.find((x) => x.nivel === nivel);
    return g ? g.peso : 0;
  };
  const pesoMedio = peso('médio');
  const pesoAlto = peso('alto');
  const pesoArriscado = pesoMedio + pesoAlto;
  const teto = TETO_RISCO_MEDIO[perfil] ?? TETO_RISCO_MEDIO.conservador;
  return { perfil, pesoMedio, pesoAlto, pesoArriscado, teto, aderente: pesoArriscado <= teto };
}

// Atalho para o eixo do app (perfil conservador) — mantém a API antiga.
function aderenciaConservador(lista) {
  return aderenciaPerfil(lista, 'conservador');
}

// DY (dividend yield) esperado acima disto é suspeito: dividendo alto demais
// costuma ser "yield trap" (preço caiu por problema, ou provento não recorrente).
const DY_ALTO_SUSPEITO = 0.15;
// Um único aporte acima desta fatia da carteira acende alerta de concentração.
const CONCENTRACAO_TETO = 0.3;

// Alertas do que exige atenção AGORA. Devolve objetos estruturados (a tela
// formata o texto): risco médio/alto acima do teto do perfil, aportes acima do
// teto do FGC, DY de ação alto demais (yield trap) e concentração num aporte.
function alertasCarteira(lista, perfil = 'conservador') {
  const alertas = [];
  const lst = Array.isArray(lista) ? lista : [];
  const ader = aderenciaPerfil(lst, perfil);
  if (!ader.aderente) {
    alertas.push({ tipo: 'risco-medio', peso: ader.pesoArriscado, teto: ader.teto });
  }
  const total = totalCarteira(lst);
  lst.forEach((a) => {
    if (CATEGORIAS_FGC.includes(a.categoria) && a.valor > TETO_FGC) {
      alertas.push({ tipo: 'fgc', produto: a.produto, valor: a.valor, teto: TETO_FGC });
    }
    if (a.categoria === 'acoes' && a.dyAnual > DY_ALTO_SUSPEITO) {
      alertas.push({ tipo: 'dy-alto', produto: a.produto, dyAnual: a.dyAnual });
    }
    const peso = pesoNaCarteira(a.valor, total);
    if (peso > CONCENTRACAO_TETO) {
      alertas.push({ tipo: 'concentracao', produto: a.produto, peso, teto: CONCENTRACAO_TETO });
    }
  });
  return alertas;
}

// --- Dividendos / renda passiva (funções puras) ----------------------------

// Renda anual de dividendos de uma posição: valor × dividend yield esperado.
function rendaDividendosAnual(valor, dyAnual) {
  if (!(valor > 0) || !(dyAnual > 0)) return 0;
  return arredondar2(valor * dyAnual);
}

// META de renda passiva: quanto é preciso ter investido para receber `metaMensal`
// de dividendos, a um DY médio, e quanto FALTA considerando a renda anual atual.
function metaRendaPassiva(metaMensal, dyAnual, rendaAnualAtual = 0) {
  if (!(metaMensal > 0) || !(dyAnual > 0)) {
    return { metaAnual: 0, capitalNecessario: 0, capitalFalta: 0, atingiu: false };
  }
  const metaAnual = arredondar2(metaMensal * 12);
  const capitalNecessario = arredondar2(metaAnual / dyAnual);
  const faltaRendaAnual = Math.max(0, metaAnual - rendaAnualAtual);
  const capitalFalta = arredondar2(faltaRendaAnual / dyAnual);
  return { metaAnual, capitalNecessario, capitalFalta, atingiu: rendaAnualAtual >= metaAnual };
}

// Renda passiva de dividendos da carteira (só ações com DY esperado informado):
// total anual, mensal e a quebra por ativo (maior primeiro).
function rendaPassivaCarteira(lista) {
  const acoes = (Array.isArray(lista) ? lista : []).filter(
    (a) => a.categoria === 'acoes' && a.dyAnual > 0
  );
  const porAtivo = acoes
    .map((a) => ({
      produto: a.produto,
      dyAnual: a.dyAnual,
      anual: rendaDividendosAnual(a.valor, a.dyAnual),
    }))
    .sort((x, y) => y.anual - x.anual);
  const anual = arredondar2(porAtivo.reduce((s, x) => s + x.anual, 0));
  return { anual, mensal: arredondar2(anual / 12), porAtivo, quantidade: porAtivo.length };
}

// --- Filtros da carteira (funções puras) -----------------------------------

// Em qual horizonte de prazo o aporte cai (dias corridos):
// curto ≤ 365 · médio 366–720 · longo > 720.
function horizonteDoAporte(dias) {
  if (dias <= 365) return 'curto';
  if (dias <= 720) return 'medio';
  return 'longo';
}

// Filtra a carteira por categoria, risco e horizonte. Campo vazio = "todos".
// Não muta a lista original.
function filtrarAportes(lista, filtros = {}) {
  const { categoria = '', risco = '', horizonte = '' } = filtros;
  return (Array.isArray(lista) ? lista : []).filter(
    (a) =>
      (!categoria || a.categoria === categoria) &&
      (!risco || nivelDeRisco(a.categoria) === risco) &&
      (!horizonte || horizonteDoAporte(a.dias) === horizonte)
  );
}

// --- Simulador de melhoria de rentabilidade (funções puras) ----------------
// O coração do app: apontar o que trocar para RENDER MAIS. Comparamos a
// rentabilidade líquida ANUALIZADA de cada aporte com alvos de referência e
// estimamos o ganho anual em reais.

// Produtos-alvo de referência (convenção interna, calibrada pelas fontes): um bom
// CDB pós e uma boa LCI isenta. A dica sempre compara com o MELHOR deles.
const ALVOS_MELHORIA = [
  { rotulo: 'CDB DI a 110% do CDI', categoria: 'cdb-di', pctCDI: 1.1 },
  { rotulo: 'LCI/LCA a 97% do CDI (isenta de IR)', categoria: 'letra', pctCDI: 0.97 },
];

// Rentabilidade líquida ANUALIZADA de um aporte (decimal, ex.: 0.11 = 11% a.a.).
// Anualiza o líquido do período para comparar produtos de prazos diferentes na
// mesma régua. Aporte inválido (valor/dias ≤ 0) rende 0.
function taxaLiquidaAnualizada(aporte) {
  const { valor, dias } = aporte;
  if (!(valor > 0) || !(dias > 0)) return 0;
  const liquido = rendimentoLiquidoDeAporte(aporte);
  return Math.pow(1 + liquido / valor, DIAS_NO_ANO / dias) - 1;
}

// Melhor alvo de troca para um aporte: reaplica os ALVOS com o mesmo valor/prazo/
// CDI do aporte e devolve o de maior taxa líquida anual. Com `manterRisco`, só
// considera alvos que NÃO aumentam o nível de risco do aporte (respeita o apetite).
function melhorAlvoMelhoria(aporte, opts = {}) {
  const nivelAtual = NIVEIS_DE_RISCO.indexOf(nivelDeRisco(aporte.categoria));
  const candidatos = ALVOS_MELHORIA.map((alvo) => ({
    rotulo: alvo.rotulo,
    categoria: alvo.categoria,
    pctCDI: alvo.pctCDI,
    taxa: taxaLiquidaAnualizada({ ...aporte, pctCDI: alvo.pctCDI, categoria: alvo.categoria }),
  })).filter(
    (c) => !opts.manterRisco || NIVEIS_DE_RISCO.indexOf(nivelDeRisco(c.categoria)) <= nivelAtual
  );
  return candidatos.reduce((melhor, c) => (c.taxa > melhor.taxa ? c : melhor), {
    rotulo: '',
    categoria: '',
    pctCDI: 0,
    taxa: -Infinity,
  });
}

// Dicas de rebalanceamento: para cada aporte cujo rendimento fica ABAIXO do melhor
// alvo por mais que o limiar (padrão 0,5 p.p. ao ano), sugere a troca e estima o
// ganho anual em reais. Ordenadas do maior ganho para o menor.
function sugestoesRebalanceamento(lista, opts = {}) {
  const { limiar = 0.005, manterRisco = false } = opts;
  const sugestoes = [];
  (Array.isArray(lista) ? lista : []).forEach((a) => {
    // Renda variável não entra no rebalanceamento (é outra classe de ativo).
    if (ehRendaVariavel(a.categoria)) return;
    const taxaAtual = taxaLiquidaAnualizada(a);
    const alvo = melhorAlvoMelhoria(a, { manterRisco });
    const ganhoTaxa = alvo.taxa - taxaAtual;
    if (ganhoTaxa > limiar) {
      // Risco: a troca pode SUBIR o nível (ex.: Tesouro "muito baixo" → LCI "baixo").
      const riscoAtual = nivelDeRisco(a.categoria);
      const riscoAlvo = nivelDeRisco(alvo.categoria);
      const subiuRisco = NIVEIS_DE_RISCO.indexOf(riscoAlvo) > NIVEIS_DE_RISCO.indexOf(riscoAtual);
      // IR descontado no período: hoje (produto atual) × no alvo (isento = 0).
      const brutoAtual = rendimentoBruto(a.valor, a.pctCDI, a.cdiAnual, a.dias);
      const irAtual = ehIsento(a.categoria) ? 0 : impostoRegressivo(brutoAtual, a.dias);
      const brutoAlvo = rendimentoBruto(a.valor, alvo.pctCDI, a.cdiAnual, a.dias);
      const irAlvo = ehIsento(alvo.categoria) ? 0 : impostoRegressivo(brutoAlvo, a.dias);
      sugestoes.push({
        id: a.id,
        produto: a.produto,
        categoria: a.categoria,
        taxaAtual,
        taxaAlvo: alvo.taxa,
        alvoRotulo: alvo.rotulo,
        ganhoTaxa,
        ganhoAnual: arredondar2(a.valor * ganhoTaxa),
        riscoAtual,
        riscoAlvo,
        subiuRisco,
        irAtual,
        irAlvo,
        economiaIR: arredondar2(irAtual - irAlvo),
      });
    }
  });
  return sugestoes.sort((x, y) => y.ganhoAnual - x.ganhoAnual);
}

// Resumo do simulador: as dicas e o ganho anual TOTAL estimado se todas forem
// aplicadas. Serve o cartão "como render mais" no painel.
function resumoMelhoria(lista, opts = {}) {
  const sugestoes = sugestoesRebalanceamento(lista, opts);
  const ganhoAnualTotal = arredondar2(sugestoes.reduce((s, x) => s + x.ganhoAnual, 0));
  return { sugestoes, ganhoAnualTotal, quantidade: sugestoes.length };
}

// Rentabilidade média anual da carteira (média das taxas ponderada pelo valor).
function rentabilidadeMediaAnual(lista) {
  const total = totalCarteira(lista);
  if (total <= 0) return 0;
  const soma = (Array.isArray(lista) ? lista : []).reduce(
    (s, a) => s + a.valor * taxaLiquidaAnualizada(a),
    0
  );
  return soma / total;
}

// Aplica as trocas sugeridas: devolve uma NOVA carteira em que cada aporte com
// dica passa a ser o melhor alvo (categoria + % do CDI). Não muta a original.
function aplicarMelhorias(lista, opts = {}) {
  const comDica = new Set(sugestoesRebalanceamento(lista, opts).map((s) => s.id));
  return (Array.isArray(lista) ? lista : []).map((a) => {
    if (!comDica.has(a.id)) return a;
    const alvo = melhorAlvoMelhoria(a, opts);
    return { ...a, categoria: alvo.categoria, pctCDI: alvo.pctCDI };
  });
}

// SIMULAÇÃO das trocas: compara a carteira ANTES × DEPOIS de aplicar as dicas —
// rentabilidade média anual, renda líquida anual em R$ e o ganho. Diz se melhora.
function simularMelhoria(lista, opts = {}) {
  const sugestoes = sugestoesRebalanceamento(lista, opts);
  const depois = aplicarMelhorias(lista, opts);
  const total = totalCarteira(lista);
  const rentAntes = rentabilidadeMediaAnual(lista);
  const rentDepois = rentabilidadeMediaAnual(depois);
  const rendaAnualAntes = arredondar2(total * rentAntes);
  const rendaAnualDepois = arredondar2(total * rentDepois);
  const ganhoAnual = arredondar2(rendaAnualDepois - rendaAnualAntes);
  return {
    trocas: sugestoes.map((s) => ({
      produto: s.produto,
      de: s.categoria,
      para: s.alvoRotulo,
      ganhoAnual: s.ganhoAnual,
    })),
    quantidade: sugestoes.length,
    rentAntes,
    rentDepois,
    rendaAnualAntes,
    rendaAnualDepois,
    ganhoAnual,
    melhora: ganhoAnual > 0,
  };
}

// --- Plano mensal de aportes (juros compostos) -----------------------------
// A 2ª alavanca do "Render Mais": aportar a cada mês faz os lucros crescerem em
// bola de neve (juros sobre juros). Cálculo por função pura, testável.

// Converte uma taxa ANUAL em MENSAL equivalente (ex.: 12% a.a. → ~0,95% a.m.).
function taxaMensalDeAnual(taxaAnual) {
  return Math.pow(1 + taxaAnual, 1 / 12) - 1;
}

// INVERSO do plano: quanto aportar POR MÊS para juntar `capitalAlvo` em `meses`,
// rendendo `taxaAnual`. Resolve a fórmula do valor futuro para o aporte mensal.
function aporteMensalParaMeta(capitalAlvo, taxaAnual, meses) {
  if (!(capitalAlvo > 0) || !(meses > 0)) return 0;
  const i = taxaMensalDeAnual(taxaAnual);
  if (i === 0) return arredondar2(capitalAlvo / meses);
  return arredondar2((capitalAlvo * i) / (Math.pow(1 + i, meses) - 1));
}

// Projeta um plano de aportes mensais por juros compostos. Devolve o total
// investido (só a soma dos aportes), o montante final (com juros) e o ganho.
// Fórmula do valor futuro de uma série de aportes no fim de cada mês.
function projetarPlanoMensal(aporteMensal, taxaAnual, meses) {
  if (!(aporteMensal > 0) || !(meses > 0)) {
    return { totalInvestido: 0, montanteFinal: 0, ganho: 0 };
  }
  const i = taxaMensalDeAnual(taxaAnual);
  const fator = i === 0 ? meses : (Math.pow(1 + i, meses) - 1) / i;
  const montanteFinal = arredondar2(aporteMensal * fator);
  const totalInvestido = arredondar2(aporteMensal * meses);
  return { totalInvestido, montanteFinal, ganho: arredondar2(montanteFinal - totalInvestido) };
}

// --- Ciclo de status do aporte (funções puras) -----------------------------
// A DATA do carimbo é passada de fora (`opts.agora`), para a função continuar
// pura (mesma entrada => mesma saída) e testável. A tela injeta o horário real.

// Próximo status na ordem (fica em 'resgatado' se já estiver no fim).
function proximoStatus(status) {
  const i = STATUS.indexOf(status);
  if (i < 0) throw new Error(`Status desconhecido: "${status}".`);
  return i < STATUS.length - 1 ? STATUS[i + 1] : status;
}

// Status anterior na ordem (fica em 'planejado' se já estiver no início).
function statusAnterior(status) {
  const i = STATUS.indexOf(status);
  if (i < 0) throw new Error(`Status desconhecido: "${status}".`);
  return i > 0 ? STATUS[i - 1] : status;
}

// Avança um passo. Ao entrar em 'aplicado' carimba a data de aplicação; ao entrar
// em 'resgatado' carimba a data de resgate. Não muda o aporte original (copia).
function avancarAporte(aporte, opts = {}) {
  const atual = aporte.status || STATUS[0];
  if (atual === STATUS.at(-1)) return aporte; // já no fim: nada muda
  const proximo = proximoStatus(atual);
  const novo = { ...aporte, status: proximo };
  if (proximo === 'aplicado') novo.aplicadoEm = opts.agora ?? null;
  if (proximo === 'resgatado') novo.resgatadoEm = opts.agora ?? null;
  return novo;
}

// Volta um passo. Ao sair de 'aplicado' limpa a data de aplicação; ao sair de
// 'resgatado' limpa a data de resgate. Copia, não muta.
function voltarAporte(aporte) {
  const atual = aporte.status || STATUS[0];
  if (atual === STATUS[0]) return aporte; // início: não volta
  const novo = { ...aporte, status: statusAnterior(atual) };
  if (atual === 'aplicado') delete novo.aplicadoEm;
  if (atual === 'resgatado') delete novo.resgatadoEm;
  return novo;
}

// --- Persistência: serialização blindada (funções puras) -------------------
// A tela guarda os aportes no localStorage. Estas funções só transformam
// lista <-> texto; quem lê/grava o localStorage é a tela (efeito colateral).

// Lista de aportes -> texto JSON para salvar. Não-lista vira lista vazia.
function serializarAportes(lista) {
  return JSON.stringify(Array.isArray(lista) ? lista : []);
}

// Monta o pacote de EXPORTAÇÃO (LGPD: o dado é do usuário). Objeto simples com a
// carteira e as preferências — a data do export vem de fora (função pura).
function montarExportacao(aportes, prefs, exportadoEm = null) {
  return {
    app: 'Render Mais',
    versao: 1,
    exportadoEm,
    aportes: Array.isArray(aportes) ? aportes : [],
    prefs: prefs || {},
  };
}

// Serializa o pacote de exportação em JSON legível (identado) para baixar.
function exportarJson(aportes, prefs, exportadoEm = null) {
  return JSON.stringify(montarExportacao(aportes, prefs, exportadoEm), null, 2);
}

// Texto JSON -> lista de aportes, BLINDADO: texto vazio, JSON quebrado ou
// formato inesperado devolvem lista vazia em vez de derrubar o app.
function desserializarAportes(texto) {
  if (typeof texto !== 'string' || texto.trim() === '') return [];
  try {
    const dado = JSON.parse(texto);
    if (!Array.isArray(dado)) return [];
    // mantém só o que parece um aporte (objeto), descartando lixo
    return dado.filter((item) => item && typeof item === 'object' && !Array.isArray(item));
  } catch {
    return []; // JSON corrompido: ignora e segue com lista vazia
  }
}

// --- Acessibilidade: contraste de cores (funções puras) --------------------
// Base da auditoria WCAG ao vivo no rodapé. Fórmulas oficiais da WCAG 2.1.

// Converte "#rrggbb" (ou "#rgb") em [r, g, b] de 0 a 255. Erro em cor inválida.
function hexParaRgb(hex) {
  if (typeof hex !== 'string') throw new Error(`Cor inválida: "${hex}".`);
  let h = hex.trim().replace(/^#/, '');
  if (h.length === 3)
    h = h
      .split('')
      .map((c) => c + c)
      .join(''); // #abc -> #aabbcc
  if (!/^[0-9a-fA-F]{6}$/.test(h)) throw new Error(`Cor inválida: "${hex}".`);
  return [0, 2, 4].map((i) => Number.parseInt(h.slice(i, i + 2), 16));
}

// Luminância relativa de uma cor (0 = preto, 1 = branco), pela fórmula da WCAG.
function luminancia(hex) {
  const canais = hexParaRgb(hex).map((valor255) => {
    const c = valor255 / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  const [r, g, b] = canais;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Razão de contraste entre duas cores: de 1:1 (igual) a 21:1 (preto × branco).
function razaoContraste(corA, corB) {
  const lA = luminancia(corA);
  const lB = luminancia(corB);
  const clara = Math.max(lA, lB);
  const escura = Math.min(lA, lB);
  return Math.round(((clara + 0.05) / (escura + 0.05)) * 100) / 100;
}

// Classifica a razão no padrão WCAG. `textoGrande` afrouxa os limites (título
// grande precisa de menos contraste que texto miúdo). Retorna 'AAA', 'AA' ou
// 'reprovado'.
function nivelWcag(razao, textoGrande = false) {
  const limiteAA = textoGrande ? 3 : 4.5;
  const limiteAAA = textoGrande ? 4.5 : 7;
  if (razao >= limiteAAA) return 'AAA';
  if (razao >= limiteAA) return 'AA';
  return 'reprovado';
}

// --- Qualidade visual: espaçamento entre elementos (funções puras) ---------
// Garante por TESTE a regra "nada colado": mede a folga entre as caixas dos
// elementos (getBoundingClientRect) e exige distância > 0,5px, ignorando pares
// pai/filho (que se contêm de propósito).

// Uma caixa contém a outra? (par pai/filho, que não deve reprovar o teste.)
function caixaContem(externa, interna) {
  return (
    externa.left <= interna.left &&
    externa.right >= interna.right &&
    externa.top <= interna.top &&
    externa.bottom >= interna.bottom
  );
}

// Menor folga entre duas caixas. 0 = encostadas; negativo = sobrepostas.
function distanciaEntreCaixas(a, b) {
  const folgaX = Math.max(b.left - a.right, a.left - b.right);
  const folgaY = Math.max(b.top - a.bottom, a.top - b.bottom);
  const arred = (n) => Math.round(n * 100) / 100;
  if (folgaX > 0 && folgaY > 0) return arred(Math.hypot(folgaX, folgaY)); // diagonal
  if (folgaX > 0) return arred(folgaX);
  if (folgaY > 0) return arred(folgaY);
  return arred(Math.max(folgaX, folgaY)); // <= 0: encostadas (0) ou sobrepostas (negativo)
}

// Verifica uma lista de caixas nomeadas: reprova se algum par (não pai/filho)
// estiver a <= minPx de distância. Devolve as violações para o teste apontar.
function validarEspacamento(caixas, minPx = 0.5) {
  const violacoes = [];
  for (let i = 0; i < caixas.length; i++) {
    for (let j = i + 1; j < caixas.length; j++) {
      const A = caixas[i];
      const B = caixas[j];
      if (caixaContem(A.caixa, B.caixa) || caixaContem(B.caixa, A.caixa)) continue;
      const distancia = distanciaEntreCaixas(A.caixa, B.caixa);
      if (distancia <= minPx) violacoes.push({ a: A.nome, b: B.nome, distancia });
    }
  }
  return { valido: violacoes.length === 0, minPx, violacoes };
}

// --- Export dual: Node/Jest e navegador ------------------------------------

const API = {
  CATEGORIAS,
  CATEGORIAS_ISENTAS,
  CATEGORIAS_RENDA_VARIAVEL,
  RISCO_POR_CATEGORIA,
  NIVEIS_DE_RISCO,
  STATUS,
  PERFIS,
  TETO_RISCO_MEDIO,
  HORIZONTES,
  TETO_FGC,
  DIAS_NO_ANO,
  nivelDeRisco,
  ehIsento,
  ehRendaVariavel,
  aliquotaIR,
  rendimentoBruto,
  impostoRegressivo,
  rendimentoLiquido,
  rendimentoLiquidoDeAporte,
  impostoRendaVariavel,
  pesoNaCarteira,
  validarAporte,
  hexParaRgb,
  luminancia,
  razaoContraste,
  nivelWcag,
  caixaContem,
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
  aderenciaPerfil,
  aderenciaConservador,
  alertasCarteira,
  rendaDividendosAnual,
  rendaPassivaCarteira,
  metaRendaPassiva,
  horizonteDoAporte,
  filtrarAportes,
  taxaLiquidaAnualizada,
  melhorAlvoMelhoria,
  sugestoesRebalanceamento,
  resumoMelhoria,
  rentabilidadeMediaAnual,
  aplicarMelhorias,
  simularMelhoria,
  taxaMensalDeAnual,
  projetarPlanoMensal,
  aporteMensalParaMeta,
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = API; // Node / Jest
}
if (typeof window !== 'undefined') {
  window.Logica = API; // Navegador
}
