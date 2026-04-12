import toolkit from '@vfourny/node-toolkit/eslint/vue'

export default [
  ...toolkit,
  {
    rules: {
      // Le projet utilise des exports default (router, stores, vues)
      'import/no-default-export': 'off',
      // Le projet utilise des imports relatifs (pas d'alias @/)
      'no-restricted-imports': 'off',
      // Permet les composants avec un seul mot
      'vue/multi-word-component-names': 'off',
    },
  },
]
