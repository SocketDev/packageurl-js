'use strict'

const path = require('node:path')

const {
  convertIgnorePatternToMinimatch,
  includeIgnoreFile
} = require('@eslint/compat')
const js = require('@eslint/js')
const importXPlugin = require('eslint-plugin-import-x')
const nodePlugin = require('eslint-plugin-n')
const sortDestructureKeysPlugin = require('eslint-plugin-sort-destructure-keys')
const unicornPlugin = require('eslint-plugin-unicorn')

const constants = require('@socketsecurity/registry/lib/constants')
const { BIOME_JSON, GIT_IGNORE, LATEST } = constants

const rootPath = __dirname

const biomeConfigPath = path.join(rootPath, BIOME_JSON)
const gitignorePath = path.join(rootPath, GIT_IGNORE)

const biomeConfig = require(biomeConfigPath)

module.exports = [
  includeIgnoreFile(gitignorePath),
  {
    name: 'Imported biome.json ignore patterns',
    ignores: biomeConfig.files.ignore.map(convertIgnorePatternToMinimatch)
  },
  {
    files: ['**/*.{c,}js'],
    ...importXPlugin.flatConfigs.recommended,
    languageOptions: {
      ...importXPlugin.flatConfigs.recommended.languageOptions,
      ecmaVersion: LATEST,
      sourceType: 'script'
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'off'
    },
    rules: {
      ...importXPlugin.flatConfigs.recommended.rules,
      'import-x/extensions': [
        'error',
        'never',
        {
          cjs: 'ignorePackages',
          js: 'ignorePackages',
          json: 'always',
          mjs: 'ignorePackages'
        }
      ],
      'import-x/no-named-as-default-member': 'off',
      'import-x/no-unresolved': ['error', { commonjs: true }],
      'import-x/order': [
        'warn',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling', 'index'],
            'type'
          ],
          pathGroups: [
            {
              pattern: '@socket{registry,security}/**',
              group: 'internal'
            }
          ],
          pathGroupsExcludedImportTypes: ['type'],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc'
          }
        }
      ]
    }
  },
  {
    files: ['scripts/**/*.{c,}js', 'test/**/*.{c,}js'],
    ...nodePlugin.configs['flat/recommended-script'],
    rules: {
      ...nodePlugin.configs['flat/recommended-script'].rules,
      'n/exports-style': ['error', 'module.exports'],
      // The n/no-unpublished-bin rule does does not support non-trivial glob
      // patterns used in package.json "files" fields. In those cases we simplify
      // the glob patterns used.
      'n/no-unpublished-bin': 'error',
      'n/no-unsupported-features/es-builtins': 'error',
      'n/no-unsupported-features/es-syntax': 'error',
      'n/no-unsupported-features/node-builtins': [
        'error',
        {
          ignores: ['test', 'test.describe'],
          // Lazily access constants.maintainedNodeVersions.
          version: constants.maintainedNodeVersions.previous
        }
      ],
      'n/prefer-node-protocol': 'error'
    }
  },
  {
    files: ['scripts/**/*.{c,}js', 'test/**/*.{c,}js'],
    plugins: {
      'sort-destructure-keys': sortDestructureKeysPlugin,
      unicorn: unicornPlugin
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-await-in-loop': 'error',
      'no-control-regex': 'error',
      'no-empty': ['error', { allowEmptyCatch: true }],
      'no-new': 'error',
      'no-proto': 'error',
      'no-undef': 'error',
      'no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_|^this$', ignoreRestSiblings: true }
      ],
      'no-var': 'error',
      'no-warning-comments': ['warn', { terms: ['fixme'] }],
      'prefer-const': 'error',
      'sort-destructure-keys/sort-destructure-keys': 'error',
      'sort-imports': ['error', { ignoreDeclarationSort: true }],
      'unicorn/consistent-function-scoping': 'error'
    }
  }
]
