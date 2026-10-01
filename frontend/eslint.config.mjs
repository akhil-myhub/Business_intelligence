import coreWebVitals from 'eslint-config-next/core-web-vitals';

const config = [
  ...coreWebVitals,
  { ignores: ['.next*/**', 'node_modules/**', 'public/**', 'coverage/**'] },
  {
    // react-three-fiber uses lowercase three.js element props (args, position, emissive…) that the DOM-only rule flags.
    files: ['src/three/**'],
    rules: { 'react/no-unknown-property': 'off' }
  }
];

export default config;
