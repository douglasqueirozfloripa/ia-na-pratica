// logica.js — regras de negócio do app "Funil" em FUNÇÕES PURAS.
// Função pura = para a mesma entrada, sempre a mesma saída, e não mexe em nada
// externo (sem localStorage, sem DOM, sem data/hora). Isso torna tudo fácil de
// testar e à prova de erro de digitação.
// Testado por: logica.test.js  (rode com: npm test)

// --- Constantes do domínio -------------------------------------------------

// Ordem oficial das etapas do funil (Lead é o topo largo; Fechado é a saída).
// Exportada para a tela e os testes usarem a MESMA fonte da verdade.
const ETAPAS = ['lead', 'qualificacao', 'proposta', 'negociacao', 'fechado'];

// Probabilidade-base de fechamento POR ETAPA: quanto mais fundo no funil, maior.
// Números didáticos, no espírito da prática de pipeline (sobem a cada degrau).
const PROBABILIDADE_POR_ETAPA = {
  lead: 0.1,
  qualificacao: 0.25,
  proposta: 0.5,
  negociacao: 0.75,
  fechado: 1, // negócio já fechado (Ganho) vale 100%; o desfecho Perdido entra no Prompt 6
};

// Critérios BANT (qualificação). Cada um atendido empurra a chance um pouco acima.
const CRITERIOS_BANT = ['orcamento', 'autoridade', 'necessidade', 'prazo'];

// Quanto cada critério BANT atendido soma na probabilidade (5% cada => até +20%).
const BONUS_POR_CRITERIO = 0.05;

// --- Utilitário interno ----------------------------------------------------

// Arredonda para 2 casas (dinheiro), evitando o "ruído" de ponto flutuante.
function arredondar2(numero) {
  return Math.round(numero * 100) / 100;
}

// --- Funções puras (o coração do app) --------------------------------------

// Probabilidade-base de uma etapa. Lança erro se a etapa não existir — assim um
// valor inválido aparece já nos testes em vez de virar cálculo silencioso errado.
function probabilidadeDaEtapa(etapa) {
  if (!Object.hasOwn(PROBABILIDADE_POR_ETAPA, etapa)) {
    throw new Error(`Etapa desconhecida: "${etapa}". Use uma de: ${ETAPAS.join(', ')}.`);
  }
  return PROBABILIDADE_POR_ETAPA[etapa];
}

// Conta quantos critérios BANT foram atendidos (0 a 4). Entrada ausente, nula ou
// não-objeto conta como 0; chaves desconhecidas são ignoradas (robusto de propósito).
function pontuarQualificacao(bant) {
  if (!bant || typeof bant !== 'object') return 0;
  return CRITERIOS_BANT.reduce((total, criterio) => (bant[criterio] ? total + 1 : total), 0);
}

// Probabilidade FINAL do negócio: a base da etapa + o empurrão do BANT (nunca > 100%).
// Um negócio já "fechado" fica em 100% (o BANT não o move mais).
function probabilidadeDeFechamento(etapa, bant) {
  const base = probabilidadeDaEtapa(etapa);
  if (etapa === 'fechado') return 1;
  const bonus = pontuarQualificacao(bant) * BONUS_POR_CRITERIO;
  return arredondar2(Math.min(1, base + bonus));
}

// Valor ponderado = valor do negócio × probabilidade de fechamento.
// É o "quanto realisticamente cabe no bolso" — o critério que ordena o foco.
// Lança erro se o valor não for um número positivo (a validação de campo é do
// validarNegocio, mas o cálculo também se protege).
function valorPonderado(valor, etapa, bant) {
  if (typeof valor !== 'number' || !Number.isFinite(valor) || valor <= 0) {
    throw new Error(`Valor inválido: "${valor}". Informe um número maior que zero.`);
  }
  return arredondar2(valor * probabilidadeDeFechamento(etapa, bant));
}

// Valida um negócio ANTES de salvar. Não lança: devolve um relatório
// { valido, erros } para a tela mostrar as mensagens ao usuário.
function validarNegocio(negocio) {
  const erros = [];
  const n = negocio || {};

  // nome/contato: obrigatório e não pode ser só espaço em branco.
  if (typeof n.nome !== 'string' || n.nome.trim() === '') {
    erros.push('Informe o nome do negócio ou contato.');
  }
  // valor: obrigatório, número finito e maior que zero.
  if (typeof n.valor !== 'number' || !Number.isFinite(n.valor) || n.valor <= 0) {
    erros.push('Informe um valor maior que zero.');
  }
  // etapa: obrigatória e tem que ser uma das etapas oficiais do funil.
  if (!ETAPAS.includes(n.etapa)) {
    erros.push(`Escolha uma etapa válida (${ETAPAS.join(', ')}).`);
  }

  return { valido: erros.length === 0, erros };
}

// --- Acessibilidade: contraste de cores (funções puras, padrão WCAG) --------
// Ficam aqui, junto do resto, para o rodapé da tela medir o contraste AO VIVO
// e para os testes cobrirem o cálculo. Regras baseadas no WCAG 2.x.

// Converte "#rrggbb" (ou "#rgb") nos três canais 0–255. Lança se o hex for inválido.
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

// Luminância relativa de uma cor (0 = preto, 1 = branco), fórmula do WCAG.
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

// Classifica a razão no padrão WCAG. `textoGrande` afrouxa os limites (título grande
// precisa de menos contraste que texto miúdo). Retorna 'AAA', 'AA' ou 'reprovado'.
function nivelWcag(razao, textoGrande = false) {
  const limiteAA = textoGrande ? 3 : 4.5;
  const limiteAAA = textoGrande ? 4.5 : 7;
  if (razao >= limiteAAA) return 'AAA';
  if (razao >= limiteAA) return 'AA';
  return 'reprovado';
}

// --- Ciclo de etapas do funil (funções puras) -------------------------------
// A DATA de fechamento é passada de fora (`agora`), para a função continuar pura
// (mesma entrada => mesma saída) e testável. A tela injeta o horário real.

const DESFECHOS = ['ganho', 'perdido'];

// Próxima etapa na ordem do funil (fica em 'fechado' se já estiver no fim).
function proximaEtapa(etapa) {
  const i = ETAPAS.indexOf(etapa);
  if (i < 0) throw new Error(`Etapa desconhecida: "${etapa}".`);
  return i < ETAPAS.length - 1 ? ETAPAS[i + 1] : etapa;
}

// Etapa anterior na ordem (fica em 'lead' se já estiver no topo).
function etapaAnterior(etapa) {
  const i = ETAPAS.indexOf(etapa);
  if (i < 0) throw new Error(`Etapa desconhecida: "${etapa}".`);
  return i > 0 ? ETAPAS[i - 1] : etapa;
}

// Avança um passo. Ao entrar em 'fechado', EXIGE desfecho (ganho/perdido) e
// carimba a data. Não muda o negócio original (devolve uma cópia).
function avancarNegocio(negocio, opts = {}) {
  if (negocio.etapa === 'fechado') return negocio; // já no fim: nada muda
  const proxima = proximaEtapa(negocio.etapa);
  const novo = { ...negocio, etapa: proxima };
  if (proxima === 'fechado') {
    if (!DESFECHOS.includes(opts.desfecho)) {
      throw new Error('Fechar exige desfecho "ganho" ou "perdido".');
    }
    novo.desfecho = opts.desfecho;
    novo.fechadoEm = opts.agora ?? null; // carimbo da data (vem de fora)
  }
  return novo;
}

// Volta um passo. Reabrir (sair de 'fechado') LIMPA desfecho e data. Copia, não muta.
function voltarNegocio(negocio) {
  if (negocio.etapa === 'lead') return negocio; // topo: não volta
  const novo = { ...negocio, etapa: etapaAnterior(negocio.etapa) };
  if (negocio.etapa === 'fechado') {
    delete novo.desfecho;
    delete novo.fechadoEm;
  }
  return novo;
}

// Probabilidade REAL do negócio já considerando o desfecho: Ganho = 100%,
// Perdido = 0%, senão a probabilidade da etapa + BANT.
function probabilidadeDoNegocio(negocio) {
  if (negocio.desfecho === 'ganho') return 1;
  if (negocio.desfecho === 'perdido') return 0;
  return probabilidadeDeFechamento(negocio.etapa, negocio.bant);
}

// Valor ponderado do negócio considerando o desfecho (Perdido zera).
function valorPonderadoDoNegocio(negocio) {
  return Math.round(negocio.valor * probabilidadeDoNegocio(negocio) * 100) / 100;
}

// --- Organização da lista (funções puras) -----------------------------------

// Ordena uma lista de negócios do MAIOR para o menor valor ponderado (o foco
// primeiro). Não altera a lista original (devolve uma cópia ordenada).
function ordenarPorValorPonderado(lista) {
  return [...lista].sort((a, b) => valorPonderadoDoNegocio(b) - valorPonderadoDoNegocio(a));
}

// Agrupa os negócios pelas etapas do funil, na ORDEM oficial (Lead → … → Fechado).
// Cada grupo traz os itens já ordenados por valor ponderado, a quantidade e a
// soma de valor. Etapas sem negócio aparecem vazias (para a tela mostrar 0).
function agruparPorEtapa(lista) {
  return ETAPAS.map((etapa) => {
    const itens = ordenarPorValorPonderado(lista.filter((n) => n.etapa === etapa));
    const somaValor = itens.reduce((soma, n) => soma + n.valor, 0);
    return { etapa, itens, quantidade: itens.length, somaValor };
  });
}

// --- Persistência: só a parte PURA (a tela cuida do localStorage) -----------
// O acesso ao localStorage é efeito colateral e fica na tela; aqui ficam as
// funções puras que ela usa, testáveis no Jest.

// Transforma a lista de negócios em texto para guardar. Lista ausente vira "[]".
function serializarNegocios(lista) {
  return JSON.stringify(Array.isArray(lista) ? lista : []);
}

// Lê o texto guardado COM SEGURANÇA: null, texto vazio, JSON inválido ou algo que
// não seja uma lista de objetos **não quebra o app** — vira uma lista vazia.
function desserializarNegocios(texto) {
  if (typeof texto !== 'string' || texto.trim() === '') return [];
  try {
    const dado = JSON.parse(texto);
    if (!Array.isArray(dado)) return [];
    // mantém só itens que parecem um negócio (objeto), descartando lixo
    return dado.filter((item) => item && typeof item === 'object' && !Array.isArray(item));
  } catch {
    return []; // JSON corrompido: ignora e segue com lista vazia
  }
}

// --- Exportar dados do usuário (LGPD) — parte PURA --------------------------
// O download em si (Blob/link) é efeito colateral e fica na tela; aqui monta-se
// o conteúdo do arquivo, testável. A data de exportação vem de fora (`agora`).

function montarExportacao(lista, agora) {
  const negocios = Array.isArray(lista) ? lista : [];
  return { app: 'Funil', versao: 1, exportadoEm: agora ?? null, total: negocios.length, negocios };
}

// Conteúdo do arquivo .json (identado, para ficar legível se o usuário abrir).
function exportarJson(lista, agora) {
  return JSON.stringify(montarExportacao(lista, agora), null, 2);
}

// --- Layout: guarda contra elementos "colados"/sobrepostos (funções puras) ---
// Recebem CAIXAS no formato do getBoundingClientRect ({ left, right, top, bottom }),
// então a mesma função roda no Jest (com caixas de mentira) e no navegador (com as
// caixas reais dos elementos). Serve para o print de tela pegar quebra de layout.

// Uma caixa contém a outra? (relação pai/filho — sobreposição INTENCIONAL, ex.: o
// checkbox dentro do seu rótulo). Esses pares são ignorados na validação.
function caixaContem(externa, interna) {
  return (
    externa.left <= interna.left &&
    externa.right >= interna.right &&
    externa.top <= interna.top &&
    externa.bottom >= interna.bottom
  );
}

// Distância, em px, entre duas caixas: > 0 há folga; = 0 encostadas; < 0 sobrepostas.
function distanciaEntreCaixas(a, b) {
  const folgaX = Math.max(b.left - a.right, a.left - b.right);
  const folgaY = Math.max(b.top - a.bottom, a.top - b.bottom);
  const arred = (n) => Math.round(n * 100) / 100;
  if (folgaX > 0 && folgaY > 0) return arred(Math.hypot(folgaX, folgaY)); // separadas na diagonal
  if (folgaX > 0) return arred(folgaX);
  if (folgaY > 0) return arred(folgaY);
  return arred(Math.max(folgaX, folgaY)); // <= 0: encostadas (0) ou sobrepostas (negativo)
}

// Valida que nenhum par de elementos "irmãos" fica colado ou sobreposto: exige
// folga MAIOR que `minPx` (padrão 0,5px). `caixas` = [{ nome, caixa }]. Pares em
// que uma caixa contém a outra (pai/filho) são ignorados. Devolve um relatório
// { valido, minPx, violacoes } — não lança, para a tela/os testes só reportarem.
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

// Exporto tudo em CommonJS para o Jest (Node) e — de forma segura — no navegador,
// onde `module` não existe: aí penduro as funções em `window.Logica`.
const API = {
  ETAPAS,
  PROBABILIDADE_POR_ETAPA,
  CRITERIOS_BANT,
  BONUS_POR_CRITERIO,
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
  DESFECHOS,
  proximaEtapa,
  etapaAnterior,
  avancarNegocio,
  voltarNegocio,
  probabilidadeDoNegocio,
  valorPonderadoDoNegocio,
  montarExportacao,
  exportarJson,
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = API; // Node / Jest
}
if (typeof window !== 'undefined') {
  window.Logica = API; // Navegador
}
