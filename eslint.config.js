import eslintPluginPrettier from 'eslint-plugin-prettier';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
    },
    plugins: {
      prettier: eslintPluginPrettier,
    },
    rules: {
      'prettier/prettier': 'warn',
      semi: ['warn', 'always'],
      quotes: ['warn', 'single'],
      'no-unused-vars': 'warn',
      'no-console': 'off',
    },
  },
  eslintConfigPrettier,
];
