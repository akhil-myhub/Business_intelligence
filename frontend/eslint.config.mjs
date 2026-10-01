import coreWebVitals from 'eslint-config-next/core-web-vitals';
import globals from 'globals';

const config = [
  ...coreWebVitals,
  { ignores: ['.next*/**', 'node_modules/**', 'public/**', 'coverage/**'] },
  // dead code is a build error: unused imports, variables and parameters must be removed (prefix with _ to opt out)
  // undefined identifiers are a build error (they otherwise only surface at runtime)
  { languageOptions: { globals: { ...globals.browser, ...globals.node } }, rules: { 'no-undef': 'error' } },
  { rules: { 'no-unused-vars': ['error', { args: 'after-used', argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true }] } },
  {
    // react-three-fiber uses lowercase three.js element props (args, position, emissive…) that the DOM-only rule flags.
    files: ['src/three/**'],
    rules: { 'react/no-unknown-property': 'off' }
  }
];

export default config;
