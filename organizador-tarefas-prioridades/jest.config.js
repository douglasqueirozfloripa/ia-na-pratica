// Configuração do Jest (testes das regras de negócio — funções puras).
// O Jest e o Playwright NÃO se misturam: o Jest cuida de `logica.test.js`
// (unidade) e o Playwright cuida de `e2e/` (interface/E2E, via `npm run test:e2e`).
// Por padrão o Jest também casaria arquivos `.spec.js`, então ele tentava rodar
// `e2e/app.spec.js` e quebrava ("did not expect test.beforeEach()"). Ignorando a
// pasta e2e/, cada runner fica com o que é seu.
module.exports = {
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/', '/e2e/'],
};
