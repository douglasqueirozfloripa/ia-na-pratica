/*
 * repositorio.js — A "gaveta" das decisões no navegador (localStorage).
 *
 * Aqui mora o que NÃO é puro: ler/escrever no localStorage e gerar id, data de
 * criação e a fase inicial (que dependem do relógio/aleatoriedade do mundo real).
 * A regra de COMO serializar/ler com segurança está na logica.js (pura e testada
 * no Jest); este arquivo só faz a ponte com o armazenamento do navegador.
 *
 * Coberto de ponta a ponta por: e2e/app.spec.js (Playwright, Prompt 11).
 */
(function () {
  'use strict';

  const L = window.Logica;
  const CHAVE = 'instancia:decisoes'; // gaveta das decisões
  const CHAVE_PREFS = 'instancia:prefs'; // gaveta dos filtros/preferências

  /** Lê todas as decisões salvas (tolera gaveta vazia ou dado corrompido -> []). */
  function carregar() {
    return L.lerDecisoesDe(localStorage.getItem(CHAVE));
  }

  /** Grava a lista inteira de decisões. */
  function salvar(lista) {
    localStorage.setItem(CHAVE, L.serializarDecisoes(lista));
  }

  /** Lê as preferências de filtro (tolera corrompido -> padrão). */
  function carregarPrefs() {
    return L.lerPreferencias(localStorage.getItem(CHAVE_PREFS));
  }

  /** Grava as preferências de filtro. */
  function salvarPrefs(prefs) {
    localStorage.setItem(CHAVE_PREFS, JSON.stringify(prefs));
  }

  /** Apaga só as decisões (usado no exportar/limpar do Prompt 10). */
  function limpar() {
    localStorage.removeItem(CHAVE);
  }

  /** Apaga TUDO — decisões e preferências (usado no "Reiniciar experiência"). */
  function limparTudo() {
    localStorage.removeItem(CHAVE);
    localStorage.removeItem(CHAVE_PREFS);
  }

  /**
   * Cria uma decisão nova a partir dos dados do formulário, carimbando id, data
   * de criação e a fase inicial. Id e data vêm do "mundo externo" — por isso
   * ficam aqui, fora das funções puras.
   */
  function novaDecisao(dados) {
    const id =
      typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'id-' + Date.now();
    return {
      id,
      criadoEm: new Date().toISOString(),
      faseRecursal: 'primeiro-grau', // toda decisão nasce no 1º grau
      dataTransito: null, // carimbada só ao transitar em julgado (Prompt 6)
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
    limpar,
    limparTudo,
    novaDecisao,
  };
})();
