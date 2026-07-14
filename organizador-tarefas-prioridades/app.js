/*
 * app.js — Liga a tela (index.html) às regras puras (logica.js).
 *
 * Regra do projeto: a tela NÃO tem regra de negócio. Ela só lê os campos, chama
 * as funções puras (validar/decorar) e desenha o resultado. Assim o comportamento
 * já está testado no Jest e aqui é só apresentação.
 *
 * Persistência (Prompt 4) e lista organizada (Prompt 5) ainda não existem.
 */
(function () {
  'use strict';

  const L = window.Logica;
  const Repo = window.Repositorio;

  // Estado em memória: a "verdade" é o localStorage; aqui guardamos a cópia atual
  // carregada, para não ficar lendo o storage a cada ação.
  let tarefas = Repo.carregar();
  let prefs = Repo.carregarPrefs(); // filtros/ordenação persistidos

  // Rótulos em português para cada quadrante de Eisenhower (convenção do projeto).
  const ROTULO_QUADRANTE = {
    'faca-agora': 'Faça agora',
    'agende': 'Agende',
    'delegue': 'Delegue',
    'elimine': 'Elimine',
  };

  // Cor (token CSS) de cada quadrante, para pintar o selo da prévia.
  const COR_QUADRANTE = {
    'faca-agora': '--q-faca-agora',
    'agende': '--q-agende',
    'delegue': '--q-delegue',
    'elimine': '--q-elimine',
  };

  // Rótulos em português para cada status do ciclo de vida.
  const ROTULO_STATUS = {
    'a-fazer': 'A fazer',
    'fazendo': 'Fazendo',
    'concluida': 'Concluída',
  };

  // Traduz os códigos de erro da validação em mensagens amigáveis para a tela.
  const MENSAGEM_ERRO = {
    'titulo-obrigatorio': 'Dê um título para a tarefa.',
    'urgencia-invalida': 'Escolha uma urgência de 1 a 5.',
    'importancia-invalida': 'Escolha uma importância de 1 a 5.',
  };

  const form = document.getElementById('form-tarefa');
  const campoTitulo = document.querySelector('[data-testid="campo-titulo"]');
  const campoUrgencia = document.querySelector('[data-testid="campo-urgencia"]');
  const campoImportancia = document.querySelector('[data-testid="campo-importancia"]');
  const listaErros = document.querySelector('[data-testid="erros"]');
  const previa = document.querySelector('[data-testid="previa"]');
  const previaQuadrante = document.querySelector('[data-testid="previa-quadrante"]');
  const previaNota = document.querySelector('[data-testid="previa-nota"]');
  const btnReiniciar = document.querySelector('[data-testid="btn-reiniciar"]');
  const btnExportar = document.querySelector('[data-testid="btn-exportar"]');
  const btnLimpar = document.querySelector('[data-testid="btn-limpar"]');
  const contadorNum = document.querySelector('[data-testid="contador-num"]');
  const lista = document.querySelector('[data-testid="lista"]');
  const painel = document.querySelector('[data-testid="painel"]');
  const filtroQuadrante = document.querySelector('[data-testid="filtro-quadrante"]');
  const filtroStatus = document.querySelector('[data-testid="filtro-status"]');
  const filtroOrdem = document.querySelector('[data-testid="filtro-ordem"]');

  function token(nome) {
    return getComputedStyle(document.documentElement).getPropertyValue(nome).trim();
  }

  /** Lê o formulário e devolve uma tarefa "crua" (strings viram números). */
  function lerFormulario() {
    return {
      titulo: campoTitulo.value,
      urgencia: Number.parseInt(campoUrgencia.value, 10),
      importancia: Number.parseInt(campoImportancia.value, 10),
    };
  }

  /** Mostra a lista de erros (ou esconde, se não houver). */
  function mostrarErros(erros) {
    listaErros.innerHTML = '';
    if (erros.length === 0) {
      listaErros.classList.remove('visivel');
      return;
    }
    for (const codigo of erros) {
      const li = document.createElement('li');
      li.textContent = MENSAGEM_ERRO[codigo] || codigo;
      listaErros.appendChild(li);
    }
    listaErros.classList.add('visivel');
  }

  /** Mostra a prévia com o quadrante e a nota CALCULADOS pela lógica pura. */
  function mostrarPrevia(tarefa) {
    const decorada = L.decorarTarefa(tarefa);
    previaQuadrante.textContent = ROTULO_QUADRANTE[decorada.quadrante];
    previaQuadrante.style.background = token(COR_QUADRANTE[decorada.quadrante]);
    previaNota.textContent =
      'Prioridade calculada: ' + decorada.prioridade + ' de 15 ' +
      '(urgência ' + tarefa.urgencia + ' × importância ' + tarefa.importancia + ').';
    previa.classList.add('visivel');
  }

  /** Atualiza o contador de tarefas salvas na tela. */
  function atualizarContador() {
    contadorNum.textContent = String(tarefas.length);
  }

  /** Cria um cartão numérico do painel (número grande + rótulo). */
  function criarTileNumero(rotulo, numero, variante, testid) {
    const tile = document.createElement('div');
    tile.className = 'tile' + (variante ? ' tile--' + variante : '');
    const num = document.createElement('span');
    num.className = 'tile__num';
    num.setAttribute('data-testid', testid);
    num.textContent = numero;
    const rot = document.createElement('span');
    rot.className = 'tile__rotulo';
    rot.textContent = rotulo;
    tile.appendChild(num);
    tile.appendChild(rot);
    return tile;
  }

  /** Desenha o painel "Foco do dia" a partir do resumo (lógica pura). */
  function renderPainel() {
    // "hoje" (AAAA-MM-DD) é do mundo externo; a conta em si é pura e testada.
    const hojeISO = new Date().toISOString().slice(0, 10);
    const r = L.calcularResumo(tarefas, hojeISO);

    painel.innerHTML = '';
    painel.appendChild(criarTileNumero('Total de tarefas', r.total, '', 'painel-total'));
    painel.appendChild(
      criarTileNumero('Faça agora (pendentes)', r.fazAgora, r.fazAgora > 0 ? 'destaque' : '', 'painel-fazagora')
    );
    painel.appendChild(criarTileNumero('Concluídas hoje', r.concluidasHoje, 'ok', 'painel-hoje'));

    // Tile de destaque "Comece por": a tarefa pendente de maior prioridade.
    const tileAtencao = document.createElement('div');
    tileAtencao.className = 'tile tile--atencao';
    const rotulo = document.createElement('span');
    rotulo.className = 'tile__rotulo';
    rotulo.textContent = 'Comece por';
    const titulo = document.createElement('span');
    titulo.className = 'tile__titulo';
    titulo.setAttribute('data-testid', 'painel-atencao');
    tileAtencao.appendChild(rotulo);
    tileAtencao.appendChild(titulo);

    if (r.atencao) {
      titulo.textContent = r.atencao.titulo;
      const quad = L.classificarQuadrante(r.atencao.urgencia, r.atencao.importancia);
      const badge = document.createElement('span');
      badge.className = 'tile__quadrante';
      badge.style.background = token(COR_QUADRANTE[quad]);
      badge.textContent = ROTULO_QUADRANTE[quad];
      tileAtencao.appendChild(badge);
    } else {
      titulo.textContent = 'Tudo em dia 🎉';
    }
    painel.appendChild(tileAtencao);
  }

  /** Redesenha tudo que depende das tarefas (contador, painel e lista). */
  function atualizarTela() {
    atualizarContador();
    renderPainel();
    renderLista();
  }

  /** Cria o cartão visual de uma tarefa (pintado pela cor do quadrante do grupo). */
  function criarCartaoTarefa(tarefa, quadrante) {
    const cor = token(COR_QUADRANTE[quadrante]);
    const status = tarefa.status || L.STATUS.A_FAZER; // dado antigo sem status = a fazer

    const item = document.createElement('div');
    item.className = 'tarefa' + (status === L.STATUS.CONCLUIDA ? ' tarefa--concluida' : '');
    item.style.borderLeftColor = cor;
    item.setAttribute('data-testid', 'tarefa');

    const info = document.createElement('div');
    const titulo = document.createElement('div');
    titulo.className = 'tarefa__titulo';
    titulo.textContent = tarefa.titulo;
    const meta = document.createElement('div');
    meta.className = 'tarefa__meta';
    meta.textContent = 'urgência ' + tarefa.urgencia + ' × importância ' + tarefa.importancia;
    info.appendChild(titulo);
    info.appendChild(meta);
    info.appendChild(criarLinhaStatus(tarefa, status));

    const prioridade = document.createElement('span');
    prioridade.className = 'tarefa__prioridade';
    prioridade.title = 'Prioridade (3 a 15)';
    // Recalcula a nota (não confia no campo salvo) — mesma fonte que a ordenação.
    prioridade.textContent = L.pontuarPrioridade(tarefa.urgencia, tarefa.importancia);

    item.appendChild(info);
    item.appendChild(prioridade);
    return item;
  }

  /** Linha de status: rótulo atual + botões Voltar/Avançar (travados nas pontas). */
  function criarLinhaStatus(tarefa, status) {
    const linha = document.createElement('div');
    linha.className = 'status';

    const rotulo = document.createElement('span');
    rotulo.className = 'status__rotulo status__rotulo--' + status;
    rotulo.setAttribute('data-testid', 'status');
    rotulo.textContent = ROTULO_STATUS[status];
    linha.appendChild(rotulo);

    const voltar = document.createElement('button');
    voltar.type = 'button';
    voltar.className = 'btn--mini';
    voltar.setAttribute('data-testid', 'btn-voltar');
    voltar.textContent = '◀ Voltar';
    voltar.disabled = status === L.STATUS.A_FAZER; // trava: nada antes de "a fazer"
    voltar.setAttribute('aria-label', 'Voltar status de: ' + tarefa.titulo);
    voltar.addEventListener('click', () => mudarStatus(tarefa.id, 'voltar'));

    const avancar = document.createElement('button');
    avancar.type = 'button';
    avancar.className = 'btn--mini';
    avancar.setAttribute('data-testid', 'btn-avancar');
    avancar.textContent = 'Avançar ▶';
    avancar.disabled = status === L.STATUS.CONCLUIDA; // trava: nada depois de "concluída"
    avancar.setAttribute('aria-label', 'Avançar status de: ' + tarefa.titulo);
    avancar.addEventListener('click', () => mudarStatus(tarefa.id, 'avancar'));

    const excluir = document.createElement('button');
    excluir.type = 'button';
    excluir.className = 'btn--mini btn--perigo';
    excluir.setAttribute('data-testid', 'btn-excluir');
    excluir.textContent = 'Excluir';
    excluir.setAttribute('aria-label', 'Excluir tarefa: ' + tarefa.titulo);
    excluir.addEventListener('click', () => excluirTarefa(tarefa.id, tarefa.titulo));

    linha.appendChild(voltar);
    linha.appendChild(avancar);
    linha.appendChild(excluir);

    // Quando concluída, mostra desde quando (data carimbada pela lógica pura).
    if (status === L.STATUS.CONCLUIDA && tarefa.concluidoEm) {
      const data = document.createElement('span');
      data.className = 'status__data';
      data.textContent = 'concluída em ' + new Date(tarefa.concluidoEm).toLocaleDateString('pt-BR');
      linha.appendChild(data);
    }
    return linha;
  }

  /**
   * Muda o status de uma tarefa (avançar/voltar), carimba/limpa a data via lógica
   * pura, PERSISTE e redesenha. A data de "agora" é injetada aqui (mundo externo).
   */
  function mudarStatus(id, direcao) {
    const idx = tarefas.findIndex((t) => t.id === id);
    if (idx === -1) return;
    const atual = tarefas[idx].status || L.STATUS.A_FAZER;
    const novo = direcao === 'avancar' ? L.avancarStatus(atual) : L.voltarStatus(atual);
    const atualizada = L.definirStatus(tarefas[idx], novo, new Date().toISOString());
    tarefas = tarefas.map((t, i) => (i === idx ? atualizada : t));
    Repo.salvar(tarefas);
    atualizarTela();
  }

  /**
   * Exclui uma tarefa — AÇÃO DESTRUTIVA, só com confirmação (usabilidade sem
   * surpresas). Cancelar mantém tudo; confirmar remove pela lógica pura e persiste.
   */
  function excluirTarefa(id, titulo) {
    const ok = window.confirm('Excluir "' + titulo + '"? Essa ação não pode ser desfeita.');
    if (!ok) return; // (negativo) cancelou -> mantém
    tarefas = L.removerTarefa(tarefas, id);
    Repo.salvar(tarefas);
    atualizarTela();
  }

  /** Cria um parágrafo de "estado vazio" para a lista. */
  function mensagemVazia(texto) {
    const p = document.createElement('p');
    p.className = 'lista__vazio';
    p.setAttribute('data-testid', 'lista-vazia');
    p.textContent = texto;
    return p;
  }

  /**
   * Desenha a lista agrupada por quadrante. A ordenação e o agrupamento vêm da
   * lógica pura (já testada); aqui é só montar o DOM.
   */
  function renderLista() {
    lista.innerHTML = '';

    // Aplica o filtro persistido; a ordenação escolhida vai para o agrupamento.
    const filtradas = L.filtrarTarefas(tarefas, prefs);
    const temFiltroAtivo = prefs.quadrante !== 'todos' || prefs.status !== 'todos';

    if (tarefas.length === 0) {
      lista.appendChild(mensagemVazia('Nenhuma tarefa ainda. Adicione a primeira acima.'));
      return;
    }
    if (filtradas.length === 0) {
      lista.appendChild(mensagemVazia('Nenhuma tarefa com esses filtros. Ajuste acima.'));
      return;
    }

    for (const grupo of L.agruparPorQuadrante(filtradas, prefs.ordem)) {
      // Com filtro ativo, não polui a tela com grupos vazios.
      if (grupo.tarefas.length === 0 && temFiltroAtivo) continue;
      const bloco = document.createElement('section');
      bloco.className = 'grupo';

      const cabecalho = document.createElement('div');
      cabecalho.className = 'grupo__cabecalho';

      const ponto = document.createElement('span');
      ponto.className = 'grupo__ponto';
      ponto.style.background = token(COR_QUADRANTE[grupo.quadrante]);
      ponto.setAttribute('aria-hidden', 'true');

      const titulo = document.createElement('h3');
      titulo.className = 'grupo__titulo';
      titulo.textContent = ROTULO_QUADRANTE[grupo.quadrante];

      const contador = document.createElement('span');
      contador.className = 'grupo__contador';
      contador.style.background = token(COR_QUADRANTE[grupo.quadrante]);
      contador.textContent = grupo.tarefas.length;

      cabecalho.appendChild(ponto);
      cabecalho.appendChild(titulo);
      cabecalho.appendChild(contador);
      bloco.appendChild(cabecalho);

      if (grupo.tarefas.length === 0) {
        const vazio = document.createElement('p');
        vazio.className = 'grupo__vazio';
        vazio.textContent = 'nenhuma tarefa aqui';
        bloco.appendChild(vazio);
      } else {
        const itens = document.createElement('div');
        itens.className = 'grupo__itens';
        for (const tarefa of grupo.tarefas) itens.appendChild(criarCartaoTarefa(tarefa, grupo.quadrante));
        bloco.appendChild(itens);
      }

      lista.appendChild(bloco);
    }
  }

  form.addEventListener('submit', function (evento) {
    evento.preventDefault();
    const dados = lerFormulario();
    const { valida, erros } = L.validarTarefa(dados);
    mostrarErros(erros);
    if (!valida) {
      previa.classList.remove('visivel');
      campoTitulo.focus(); // leva o usuário direto ao problema mais comum
      return;
    }

    // Cria a tarefa (id/data pelo repositório), acrescenta pela lógica pura e
    // PERSISTE no localStorage — assim sobrevive ao recarregar a página.
    const nova = Repo.novaTarefa(dados);
    tarefas = L.adicionarTarefa(tarefas, nova);
    Repo.salvar(tarefas);

    mostrarPrevia(dados);
    atualizarTela();
    form.reset();
    campoTitulo.focus();
  });

  /** Zera tarefas e preferências (usado por "Reiniciar" e por "Limpar meus dados"). */
  function zerarDados() {
    tarefas = [];
    prefs = { ...L.PREFS_PADRAO };
    Repo.salvar(tarefas);
    Repo.salvarPrefs(prefs);
    form.reset();
    mostrarErros([]);
    previa.classList.remove('visivel');
    sincronizarFiltros();
    atualizarTela();
  }

  // "Reiniciar experiência": AÇÃO DESTRUTIVA — apaga TODAS as tarefas e volta os
  // filtros ao padrão, só com confirmação. Cancelar mantém tudo como está.
  btnReiniciar.addEventListener('click', function () {
    const ok = window.confirm(
      'Reiniciar a experiência? Isso apaga TODAS as tarefas e volta os filtros ao padrão.'
    );
    if (!ok) return; // (negativo) cancelou -> mantém
    zerarDados();
    campoTitulo.focus();
  });

  /**
   * Exportar (LGPD): baixa um .json com todas as tarefas. Monta o pacote pela
   * lógica pura e usa um link temporário para o download (sem servidor).
   */
  btnExportar.addEventListener('click', function () {
    const pacote = L.montarExportacao(tarefas, new Date().toISOString());
    const conteudo = JSON.stringify(pacote, null, 2);
    const blob = new Blob([conteudo], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'prioriza-tarefas.json';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  });

  // Limpar meus dados (LGPD): apaga tudo com confirmação (mesmo efeito do reiniciar).
  btnLimpar.addEventListener('click', function () {
    const ok = window.confirm('Apagar TODAS as suas tarefas deste navegador? Não dá para desfazer.');
    if (!ok) return; // (negativo) cancelou -> mantém
    zerarDados();
  });

  /* -------------------------------------------------------------------------
   * Relatório de contraste AO VIVO: lê as cores reais dos design tokens (CSS)
   * e classifica cada par com as funções puras do logica.js. Se um token mudar,
   * o relatório muda junto — a acessibilidade fica visível o tempo todo.
   * ---------------------------------------------------------------------- */
  function montarRelatorioContraste() {
    const alvo = document.querySelector('[data-testid="relatorio-contraste"]');
    // [rótulo, cor de frente, cor de fundo, é texto grande?]
    const pares = [
      ['Texto sobre superfície', token('--cor-texto'), token('--cor-superficie'), false],
      ['Texto suave sobre branco', token('--cor-texto-suave'), token('--cor-superficie'), false],
      ['Branco sobre botão primário', '#ffffff', token('--cor-primaria'), false],
      ['Branco sobre acento (gravata)', '#ffffff', token('--cor-acento'), false],
      ['Texto sobre fundo', token('--cor-texto'), token('--cor-fundo'), false],
    ];

    alvo.innerHTML = '';
    for (const [rotulo, frente, fundo, grande] of pares) {
      const razao = L.razaoContraste(frente, fundo);
      const nivel = L.nivelWcag(razao, grande);

      const li = document.createElement('li');
      const nome = document.createElement('span');
      nome.textContent = rotulo + ' — ' + razao.toFixed(2) + ':1';
      const selo = document.createElement('span');
      selo.className = 'selo selo--' + nivel;
      selo.textContent = nivel;

      li.appendChild(nome);
      li.appendChild(selo);
      alvo.appendChild(li);
    }
  }

  /** Deixa os selects mostrando a preferência salva (ao abrir o app). */
  function sincronizarFiltros() {
    filtroQuadrante.value = prefs.quadrante;
    filtroStatus.value = prefs.status;
    filtroOrdem.value = prefs.ordem;
  }

  /** Quando um filtro muda: atualiza a preferência, PERSISTE e redesenha a lista. */
  function aoMudarFiltro() {
    prefs = {
      quadrante: filtroQuadrante.value,
      status: filtroStatus.value,
      ordem: filtroOrdem.value,
    };
    Repo.salvarPrefs(prefs);
    renderLista();
  }

  filtroQuadrante.addEventListener('change', aoMudarFiltro);
  filtroStatus.addEventListener('change', aoMudarFiltro);
  filtroOrdem.addEventListener('change', aoMudarFiltro);

  montarRelatorioContraste();
  sincronizarFiltros(); // reflete, ao abrir, os filtros salvos
  atualizarTela();      // reflete, ao abrir, o que já estava salvo no localStorage
})();
