/*
 * app.js — Cola entre a tela (index.html) e as regras puras (logica.js).
 * O app.js NÃO tem regra de negócio: ele lê o formulário, chama as funções
 * puras do window.Logica e desenha o resultado. (Persistência entra no Prompt 4.)
 */

(function () {
  'use strict';

  const L = window.Logica;
  const R = window.Repositorio;

  // -------------------------------------------------------------------------
  // Preenche o select de tipos de lide a partir dos domínios da lógica (fonte
  // única de verdade — nada de repetir a lista aqui).
  // -------------------------------------------------------------------------
  const selTipo = document.getElementById('tipoLide');
  for (const tipo of L.TIPOS_LIDE) {
    const opt = document.createElement('option');
    opt.value = tipo.slug;
    opt.textContent = tipo.rotulo;
    selTipo.appendChild(opt);
  }

  const form = document.getElementById('form-decisao');
  const selCarga = document.getElementById('cargaEficacia');
  const previaEspecie = document.getElementById('previa-especie');
  const previaPrioridade = document.getElementById('previa-prioridade');
  const previaErros = document.getElementById('previa-erros');
  const contadorSalvas = document.getElementById('contador-salvas');

  // Só mostramos a lista de erros DEPOIS que o usuário mexeu no formulário — assim
  // um formulário recém-limpo (após salvar) não aparece "cheio de erros".
  let mostrarErros = false;

  const listaFases = document.getElementById('lista-fases');
  const listaVazia = document.getElementById('lista-vazia');
  const painelTiles = document.getElementById('painel-tiles');
  const painelDestaque = document.getElementById('painel-destaque');
  const filtroFase = document.getElementById('filtro-fase');
  const filtroEspecie = document.getElementById('filtro-especie');
  const filtroResultado = document.getElementById('filtro-resultado');

  /** Lê os filtros escolhidos na tela como um objeto de preferências. */
  function lerFiltros() {
    return {
      fase: filtroFase.value,
      especie: filtroEspecie.value,
      resultado: filtroResultado.value,
    };
  }

  /** Aplica preferências salvas aos selects de filtro. */
  function aplicarFiltros(prefs) {
    filtroFase.value = prefs.fase;
    filtroEspecie.value = prefs.especie;
    filtroResultado.value = prefs.resultado;
  }

  /** "Hoje" em ISO (YYYY-MM-DD) — a fronteira com o relógio real fica aqui. */
  function hojeISO() {
    return new Date().toISOString().slice(0, 10);
  }

  /** Formata um número em Reais (pt-BR). */
  function emReais(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  /** Rótulo amigável do tipo de lide a partir do slug. */
  function rotuloTipoLide(slug) {
    const t = L.TIPOS_LIDE.find((x) => x.slug === slug);
    return t ? t.rotulo : slug;
  }

  /** Formata uma data ISO em dd/mm/aaaa (pt-BR). */
  function formatarData(iso) {
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('pt-BR');
  }

  /** Atualiza o contador "Decisões salvas: N" lendo a gaveta do navegador. */
  function atualizarContador() {
    const total = R.carregar().length;
    contadorSalvas.innerHTML = 'Decisões salvas: <strong>' + total + '</strong>';
  }

  /** Redesenha o "Painel do contencioso" com os números-chave. */
  function atualizarPainel() {
    const resumo = L.calcularResumo(R.carregar(), hojeISO());
    const tiles = [
      { rotulo: 'Total de decisões', valor: resumo.total },
      {
        rotulo: 'Prazo recursal correndo',
        valor: resumo.prazoCorrendo,
        atencao: resumo.prazoCorrendo > 0,
      },
      { rotulo: 'Transitadas em julgado', valor: resumo.transitados },
      { rotulo: 'Defendidos (improcedentes)', valor: resumo.percentDefendidos + '%' },
      { rotulo: 'Exposição em disputa', valor: emReais(resumo.exposicaoAtiva) },
      { rotulo: 'Total condenado (a pagar)', valor: emReais(resumo.totalCondenado) },
    ];
    painelTiles.innerHTML = '';
    for (const t of tiles) {
      const tile = document.createElement('div');
      tile.className = 'tile' + (t.atencao ? ' atencao' : '');
      const rotulo = document.createElement('span');
      rotulo.className = 'rotulo';
      rotulo.textContent = t.rotulo;
      const numero = document.createElement('span');
      numero.className = 'numero';
      numero.textContent = t.valor;
      tile.appendChild(rotulo);
      tile.appendChild(numero);
      painelTiles.appendChild(tile);
    }
    painelDestaque.textContent = resumo.destaque
      ? 'Aja por esta primeiro: ' +
        resumo.destaque.numeroProcesso +
        ' (prioridade ' +
        resumo.destaque.prioridade +
        ')'
      : '';
  }

  /** Avança ou volta a fase de uma decisão e persiste a mudança. */
  function mudarFase(id, direcao) {
    const lista = R.carregar();
    const idx = lista.findIndex((d) => d.id === id);
    if (idx === -1) return;
    const atual = lista[idx];
    const novaFase =
      direcao === 'avancar' ? L.avancarFase(atual.faseRecursal) : L.voltarFase(atual.faseRecursal);
    // "agora" (relógio real) só entra aqui, na borda; a regra em si é pura.
    lista[idx] = L.definirFase(atual, novaFase, new Date().toISOString());
    R.salvar(lista);
    atualizarLista();
    atualizarPainel();
  }

  /** Monta o cartão de uma decisão (espécie/prioridade recalculadas, puras). */
  function montarCard(decisao) {
    const card = document.createElement('article');
    card.className = 'decisao-card';
    card.dataset.testid = 'decisao-card';

    let especieTexto = '—';
    try {
      especieTexto = L.rotuloEspecie(
        L.classificarEspecie(decisao.resolveuMerito, decisao.cargaEficacia, decisao.orgaoJulgador)
      );
    } catch (_e) {
      especieTexto = '—';
    }
    const prioridade = L.prioridadeDaDecisao(decisao, hojeISO());

    const topo = document.createElement('div');
    topo.className = 'decisao-topo';
    const num = document.createElement('span');
    num.className = 'decisao-numero';
    num.textContent = decisao.numeroProcesso;
    const prio = document.createElement('span');
    prio.className = 'decisao-prioridade';
    prio.innerHTML = 'prioridade <strong>' + prioridade + '</strong>';
    topo.appendChild(num);
    topo.appendChild(prio);

    const meta = document.createElement('div');
    meta.className = 'decisao-meta';
    const partes = [
      rotuloTipoLide(decisao.tipoLide),
      especieTexto,
      'Resultado: ' + decisao.resultado,
    ];
    for (const p of partes) {
      const span = document.createElement('span');
      span.textContent = p;
      meta.appendChild(span);
    }
    const causa = document.createElement('span');
    causa.className = 'valor-risco';
    causa.textContent = 'Causa: ' + emReais(Number(decisao.valorCausa) || 0);
    meta.appendChild(causa);

    const condenacao = Number(decisao.valorCondenacao) || 0;
    if (condenacao > 0) {
      const cond = document.createElement('span');
      cond.className = 'valor-condenacao';
      cond.textContent = 'A pagar: ' + emReais(condenacao);
      meta.appendChild(cond);
    }

    card.appendChild(topo);
    card.appendChild(meta);

    // Controles do ciclo de fases recursais (Prompt 6).
    const acoes = document.createElement('div');
    acoes.className = 'decisao-acoes';

    const faseAtual = document.createElement('span');
    faseAtual.className = 'fase-atual';
    faseAtual.textContent =
      'Fase: ' + (L.FASE_ROTULO[decisao.faseRecursal] || decisao.faseRecursal);
    acoes.appendChild(faseAtual);

    if (decisao.faseRecursal === 'transitado' && decisao.dataTransito) {
      const selo = document.createElement('span');
      selo.className = 'selo-transito';
      selo.textContent = '✓ Transitado em ' + formatarData(decisao.dataTransito);
      acoes.appendChild(selo);
    }

    const btnVoltar = document.createElement('button');
    btnVoltar.type = 'button';
    btnVoltar.className = 'btn btn-contorno btn-sm';
    btnVoltar.textContent = '◀ Voltar fase';
    btnVoltar.dataset.testid = 'btn-voltar';
    btnVoltar.setAttribute('aria-label', 'Voltar a fase do processo ' + decisao.numeroProcesso);
    btnVoltar.disabled = decisao.faseRecursal === L.FASES[0];
    btnVoltar.addEventListener('click', () => mudarFase(decisao.id, 'voltar'));

    const btnAvancar = document.createElement('button');
    btnAvancar.type = 'button';
    btnAvancar.className = 'btn btn-primario btn-sm';
    btnAvancar.textContent = 'Avançar fase ▶';
    btnAvancar.dataset.testid = 'btn-avancar';
    btnAvancar.setAttribute('aria-label', 'Avançar a fase do processo ' + decisao.numeroProcesso);
    btnAvancar.disabled = decisao.faseRecursal === L.FASES[L.FASES.length - 1];
    btnAvancar.addEventListener('click', () => mudarFase(decisao.id, 'avancar'));

    const btnExcluir = document.createElement('button');
    btnExcluir.type = 'button';
    btnExcluir.className = 'btn btn-perigo btn-sm';
    btnExcluir.textContent = 'Excluir';
    btnExcluir.dataset.testid = 'btn-excluir';
    btnExcluir.setAttribute('aria-label', 'Excluir o processo ' + decisao.numeroProcesso);
    btnExcluir.addEventListener('click', () => excluirDecisao(decisao.id, decisao.numeroProcesso));

    acoes.appendChild(btnVoltar);
    acoes.appendChild(btnAvancar);
    acoes.appendChild(btnExcluir);
    card.appendChild(acoes);
    return card;
  }

  /** Exclui uma decisão (com confirmação — ação destrutiva). */
  function excluirDecisao(id, numero) {
    if (!window.confirm('Excluir a decisão ' + numero + '? Esta ação não pode ser desfeita.')) {
      return;
    }
    R.salvar(L.removerDecisao(R.carregar(), id));
    atualizarContador();
    atualizarPainel();
    atualizarLista();
  }

  /** Redesenha a lista agrupada por fase recursal, aplicando os filtros. */
  function atualizarLista() {
    const todas = R.carregar();
    const decisoes = L.filtrarDecisoes(todas, lerFiltros());
    listaFases.innerHTML = '';

    // Dois "vazios" diferentes: nada salvo x nada casa com o filtro.
    if (decisoes.length === 0) {
      listaVazia.hidden = false;
      listaVazia.textContent =
        todas.length === 0
          ? 'Nenhuma decisão salva ainda — cadastre uma acima.'
          : 'Nenhuma decisão corresponde aos filtros atuais.';
    } else {
      listaVazia.hidden = true;
    }

    const grupos = L.agruparPorFase(decisoes, hojeISO());
    for (const grupo of grupos) {
      const secao = document.createElement('div');
      secao.className = 'fase-grupo';

      const cab = document.createElement('div');
      cab.className = 'fase-cabecalho';
      const h3 = document.createElement('h3');
      h3.textContent = grupo.rotulo;
      const cont = document.createElement('span');
      cont.className = 'fase-contador';
      cont.textContent = grupo.total;
      cab.appendChild(h3);
      cab.appendChild(cont);
      secao.appendChild(cab);

      if (grupo.total === 0) {
        const vazio = document.createElement('p');
        vazio.className = 'fase-vazia';
        vazio.textContent = 'Nenhuma decisão nesta fase.';
        secao.appendChild(vazio);
      } else {
        const cards = document.createElement('div');
        cards.className = 'lista-cards';
        for (const decisao of grupo.itens) {
          cards.appendChild(montarCard(decisao));
        }
        secao.appendChild(cards);
      }
      listaFases.appendChild(secao);
    }
  }

  /** Lê o formulário e monta o objeto "decisao" no formato da lógica. */
  function lerFormulario() {
    const dados = new FormData(form);
    const resolveuMerito = dados.get('resolveuMerito') === 'sim';
    const causaTexto = dados.get('valorCausa');
    const condenacaoTexto = dados.get('valorCondenacao');
    return {
      numeroProcesso: (dados.get('numeroProcesso') || '').trim(),
      orgaoVara: (dados.get('orgaoVara') || '').trim(),
      tipoLide: dados.get('tipoLide') || '',
      orgaoJulgador: dados.get('orgaoJulgador') || '',
      resolveuMerito,
      // Sem mérito não há carga (a regra dura mora na lógica; aqui só não enviamos).
      cargaEficacia: resolveuMerito ? dados.get('cargaEficacia') : undefined,
      resultado: dados.get('resultado') || '',
      valorCausa: causaTexto === '' ? NaN : Number(causaTexto),
      // Condenação é opcional: vazio = 0 (empresa não condenada / defendida).
      valorCondenacao: condenacaoTexto === '' ? 0 : Number(condenacaoTexto),
      prazoRecursalAte: dados.get('prazoRecursalAte') || null,
    };
  }

  /** Converte a data-limite em dias a partir de hoje (reusa a regra pura). */
  function diasAtePrazo(prazoISO) {
    return L.diasEntre(hojeISO(), prazoISO);
  }

  /** Carga só faz sentido quando resolveu o mérito — desabilita quando não. */
  function sincronizarCarga() {
    const resolveu = form.querySelector('input[name="resolveuMerito"]:checked')?.value === 'sim';
    selCarga.disabled = !resolveu;
  }

  /** Redesenha a prévia (espécie + prioridade + erros) a cada mudança. */
  function atualizarPrevia() {
    sincronizarCarga();
    const decisao = lerFormulario();

    // Espécie — só classifica quando os campos que ela usa estão válidos.
    let textoEspecie = '—';
    let classeEspecie = 'tag';
    try {
      const especie = L.classificarEspecie(
        decisao.resolveuMerito,
        decisao.cargaEficacia,
        decisao.orgaoJulgador
      );
      textoEspecie = L.rotuloEspecie(especie);
      classeEspecie = 'tag ' + especie.merito;
    } catch (_e) {
      textoEspecie = '—';
    }
    previaEspecie.textContent = textoEspecie;
    previaEspecie.className = classeEspecie;

    // Prioridade — só quando valor e resultado são válidos.
    let textoPrioridade = '—';
    try {
      if (L.RESULTADOS.includes(decisao.resultado) && decisao.valorCausa >= 0) {
        textoPrioridade = String(
          L.pontuarPrioridade(
            decisao.valorCausa,
            decisao.resultado,
            diasAtePrazo(decisao.prazoRecursalAte)
          )
        );
      }
    } catch (_e) {
      textoPrioridade = '—';
    }
    previaPrioridade.textContent = textoPrioridade;

    // Erros de validação (amigáveis) — só depois que o usuário mexeu em algo.
    const relatorio = L.validarDecisao(decisao);
    previaErros.innerHTML = '';
    if (mostrarErros && !relatorio.valida) {
      for (const erro of relatorio.erros) {
        const li = document.createElement('li');
        li.textContent = erro;
        previaErros.appendChild(li);
      }
    }
  }

  // Qualquer edição do usuário passa a exibir os erros da prévia.
  function aoEditar() {
    mostrarErros = true;
    atualizarPrevia();
  }
  form.addEventListener('input', aoEditar);
  form.addEventListener('change', aoEditar);
  form.addEventListener('reset', () => {
    mostrarErros = false;
    setTimeout(atualizarPrevia, 0);
  });

  // "Classificar decisão" — valida e, se estiver ok, SALVA no localStorage
  // (persistência do Prompt 4). Se houver erro, a prévia mostra o que falta.
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const decisao = lerFormulario();
    const relatorio = L.validarDecisao(decisao);
    if (!relatorio.valida) {
      mostrarErros = true;
      atualizarPrevia(); // mostra os erros; não salva decisão inválida
      return;
    }
    const lista = R.carregar();
    R.salvar(L.adicionarDecisao(lista, R.novaDecisao(decisao)));
    atualizarContador();
    atualizarLista();
    atualizarPainel();
    mostrarErros = false; // acabou de salvar com sucesso — formulário limpo, sem erros
    form.reset();
    atualizarPrevia();
  });

  // "Reiniciar experiência" — ação destrutiva: apaga TODAS as decisões e volta os
  // filtros ao padrão (com confirmação).
  document.querySelector('[data-testid="btn-reiniciar"]').addEventListener('click', () => {
    if (
      !window.confirm('Reiniciar a experiência? Isso apaga TODAS as decisões salvas e os filtros.')
    ) {
      return;
    }
    R.limparTudo();
    form.reset();
    mostrarErros = false;
    aplicarFiltros(L.PREFS_PADRAO);
    atualizarContador();
    atualizarPainel();
    atualizarLista();
    atualizarPrevia();
  });

  // Exportar (LGPD): baixa um .json com todas as decisões (o dado é do usuário).
  document.querySelector('[data-testid="btn-exportar"]').addEventListener('click', () => {
    const pacote = L.montarExportacao(R.carregar(), new Date().toISOString());
    const blob = new Blob([JSON.stringify(pacote, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'instancia-decisoes.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });

  // Limpar meus dados (LGPD): apaga só as decisões (mantém as preferências).
  document.querySelector('[data-testid="btn-limpar-dados"]').addEventListener('click', () => {
    if (!window.confirm('Apagar TODAS as decisões salvas? Esta ação não pode ser desfeita.')) {
      return;
    }
    R.limpar();
    atualizarContador();
    atualizarPainel();
    atualizarLista();
  });

  // Filtros: qualquer mudança persiste a preferência e redesenha a lista.
  function aoFiltrar() {
    R.salvarPrefs(lerFiltros());
    atualizarLista();
  }
  filtroFase.addEventListener('change', aoFiltrar);
  filtroEspecie.addEventListener('change', aoFiltrar);
  filtroResultado.addEventListener('change', aoFiltrar);

  // -------------------------------------------------------------------------
  // Rodapé de contraste AO VIVO: lê os tokens de cor do CSS e mede cada par
  // pela fórmula WCAG 2.1 (funções puras da lógica).
  // -------------------------------------------------------------------------
  function corToken(nome) {
    return getComputedStyle(document.documentElement).getPropertyValue(nome).trim();
  }

  function montarRodapeContraste() {
    const pares = [
      { nome: 'Texto sobre fundo', frente: '--cor-texto', fundo: '--cor-fundo' },
      { nome: 'Texto sobre superfície', frente: '--cor-texto', fundo: '--cor-superficie' },
      { nome: 'Botão primário', frente: '--cor-texto-inverso', fundo: '--cor-primaria' },
      { nome: 'Cabeçalho', frente: '--cor-texto-inverso', fundo: '--cor-primaria-escura' },
      { nome: 'Sucesso', frente: '--cor-texto-inverso', fundo: '--cor-sucesso' },
      { nome: 'Perigo', frente: '--cor-texto-inverso', fundo: '--cor-perigo' },
      { nome: 'Texto suave', frente: '--cor-texto-suave', fundo: '--cor-fundo' },
    ];
    const tabela = document.getElementById('tabela-contraste');
    tabela.innerHTML = '';
    for (const par of pares) {
      const frente = corToken(par.frente);
      const fundo = corToken(par.fundo);
      const razao = L.razaoContraste(frente, fundo);
      const nivel = L.nivelWcag(razao);
      const aprovado = nivel === 'AA' || nivel === 'AAA';

      const linha = document.createElement('div');
      linha.className = 'par';

      const amostra = document.createElement('span');
      amostra.className = 'amostra';
      amostra.style.color = frente;
      amostra.style.background = fundo;
      amostra.textContent = par.nome;

      const valor = document.createElement('span');
      valor.className = 'valor';
      valor.textContent = razao.toFixed(2) + ':1';

      const selo = document.createElement('span');
      selo.className = 'selo ' + (aprovado ? 'ok' : 'reprovado');
      selo.textContent = aprovado ? nivel : 'Reprovado';

      linha.appendChild(amostra);
      linha.appendChild(valor);
      linha.appendChild(selo);
      tabela.appendChild(linha);
    }
  }

  montarRodapeContraste();
  aplicarFiltros(R.carregarPrefs()); // restaura os filtros salvos
  atualizarContador();
  atualizarPainel();
  atualizarLista();
  atualizarPrevia();
})();
