// Configuração do Jest (testes das regras de negócio — funções puras).
// O Jest cuida de `logica.test.js` (unidade). Quando o Playwright entrar (E2E),
// a pasta e2e/ fica ignorada aqui para os dois runners não se atropelarem.
module.exports = {
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/', '/e2e/'],
};
