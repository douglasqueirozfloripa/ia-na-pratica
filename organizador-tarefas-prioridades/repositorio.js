/*
 * repositorio.js — A "gaveta" das tarefas no navegador (localStorage).
 *
 * Aqui mora o que NÃO é puro: ler/escrever no localStorage e gerar id e data de
 * criação (que dependem do relógio/aleatoriedade do mundo real). A regra de como
 * serializar/ler com segurança está em logica.js (puro e testado no Jest); este
 * arquivo só faz a ponte com o armazenamento do navegador.
 *
 * Coberto de ponta a ponta por: e2e/app.spec.js (Playwright, Prompt 11).
 */
(function () {
  'use strict';

  const L = window.Logica;
  const CHAVE = 'prioriza:tarefas'; // nome da "gaveta" das tarefas
  const CHAVE_PREFS = 'prioriza:prefs'; // gaveta das preferências (filtros/ordem)

  /** Lê todas as tarefas salvas (tolera gaveta vazia ou dado corrompido -> []). */
  function carregar() {
    return L.lerTarefasDe(localStorage.getItem(CHAVE));
  }

  /** Grava a lista inteira de tarefas. */
  function salvar(lista) {
    localStorage.setItem(CHAVE, L.serializarTarefas(lista));
  }

  /** Lê as preferências de filtro/ordenação (tolera corrompido -> padrão). */
  function carregarPrefs() {
    return L.lerPreferencias(localStorage.getItem(CHAVE_PREFS));
  }

  /** Grava as preferências de filtro/ordenação. */
  function salvarPrefs(prefs) {
    localStorage.setItem(CHAVE_PREFS, JSON.stringify(prefs));
  }

  /**
   * Cria uma tarefa nova a partir dos dados do formulário, carimbando id e data
   * de criação. Id e data vêm do "mundo externo" — por isso ficam aqui, fora das
   * funções puras.
   */
  function novaTarefa(dados) {
    const id =
      typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'id-' + Date.now();
    return {
      id,
      criadoEm: new Date().toISOString(),
      status: L.STATUS.A_FAZER, // toda tarefa nasce "a fazer"
      concluidoEm: null,
      ...dados,
    };
  }

  window.Repositorio = {
    CHAVE,
    CHAVE_PREFS,
    carregar,
    salvar,
    carregarPrefs,
    salvarPrefs,
    novaTarefa,
  };
})();
