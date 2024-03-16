import loguxConfig from '@logux/eslint-config'

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  ...loguxConfig.map(i => ({ ...i, languageOptions: {} })),
  {
    languageOptions: {
      globals: {}
    }
  }
]
