import { env } from 'node:process';

import antfu from '@antfu/eslint-config';

export default antfu(
  {
    isInEditor: false,
    stylistic: {
      indent: 2,
      quotes: 'single',
      semi: true,
    },
    vue: {
      a11y: true,
    },
    typescript: true,
  },

  {
    rules: {
      'style/array-bracket-spacing': [ 'error', 'always' ],
      'style/arrow-parens': [ 'error', 'always' ],
      'style/brace-style': [ 'error', '1tbs', {
        allowSingleLine: true,
      } ],
      'style/comma-dangle': [ 'error', 'always-multiline' ],
      'style/computed-property-spacing': [ 'error', 'always' ],
      'style/indent': [ 'error', 2, { SwitchCase: 1 } ],
      'style/key-spacing': [ 'error', {
        beforeColon: false,
        afterColon: true,
        mode: 'strict',
      } ],
      'style/keyword-spacing': 'error',
      'style/linebreak-style': [ 'error', 'unix' ],
      'style/member-delimiter-style': [ 'error', {
        multiline: {
          delimiter: 'semi',
          requireLast: true,
        },
        multilineDetection: 'brackets',
        singleline: {
          delimiter: 'semi',
          requireLast: true,
        },
      } ],
      'style/no-extra-semi': [ 'error' ],
      'style/object-curly-spacing': [ 'error', 'always', {
        arraysInObjects: true,
        objectsInObjects: true,
      } ],
      'style/quote-props': [ 'error', 'as-needed' ],
      'style/quotes': [
        'error',
        'single',
        {
          allowTemplateLiterals: 'always',
          avoidEscape: true,
        },
      ],
      'style/semi': [ 'error', 'always' ],
      'style/space-in-parens': [ 'error', 'never' ],
      'style/template-curly-spacing': [ 'error', 'always' ],
      'style/type-annotation-spacing': 'error',

      'arrow-body-style': [ 'error', 'as-needed' ],
      curly: [ 'error', 'all' ],
      eqeqeq: [ 'error', 'smart' ],
      'id-match': 'error',
      'no-console': env.NODE_ENV === 'production' ? [ 'error', { allow: [ 'info', 'warn', 'error' ] } ] : 'off',
      'no-debugger': env.NODE_ENV === 'production' ? 'error' : 'off',
      'no-undef': 'error',
      'no-void': 'error',

      'ts/no-explicit-any': [
        'error',
        {
          fixToUnknown: true,
          ignoreRestArgs: true,
        },
      ],
      'ts/no-namespace': [ 'error', { allowDeclarations: true } ],

      'unicorn/consistent-function-scoping': [ 'error', { checkArrowFunctions: false } ],

      'perfectionist/sort-imports': [ 'error', {
        type: 'natural',
        order: 'asc',
        ignoreCase: true,
        newlinesBetween: 1,
        groups: [
          'type',
          'builtin',
          'external',
          'internal-type',
          'internal',
          [ 'type-parent', 'type-sibling', 'type-index' ],
          [ 'parent', 'sibling', 'index' ],
          'side-effect',
          'style',
          'unknown',
        ],
        customGroups: [
          {
            groupName: 'style',
            elementNamePattern: '.*\\.css$',
          },
          {
            groupName: 'internal-type',
            elementNamePattern: '^#\/.*|^\\$dev/.*|^\\$lib/.*',
            modifiers: [ 'type' ],
          },
          {
            groupName: 'internal',
            elementNamePattern: '^#\/.*|^\\$dev/.*|^\\$lib/.*',
          },
        ],
      } ],

      'perfectionist/sort-exports': 'off',

      'unused-imports/no-unused-vars': [ 'error', {
        caughtErrorsIgnorePattern: '^ignore',
        argsIgnorePattern: '^_',
      } ],

      'prefer-promise-reject-errors': 'off',
    },
  },
  {
    files: [ '**/*.vue' ],
    languageOptions: {
      globals: {
        defineModel: 'readonly',
        defineOptions: 'readonly',
      },
    },
    rules: {
      'vue/html-self-closing': [
        'error',
        {
          html: {
            component: 'always',
            normal: 'always',
            void: 'always',
          },
          math: 'always',
          svg: 'always',
        },
      ],
      'vue/max-attributes-per-line': [
        'error',
        {
          multiline: 1,
          singleline: 4,
        },
      ],
      'vue/multi-word-component-names': [
        'error',
        { ignores: [ '+Head', '+Page', '+Layout' ] },
      ],
      'vue/mustache-interpolation-spacing': [ 'error', 'always' ],
      'vue/no-multi-spaces': 'error',
      'vue/script-indent': [
        'error',
        2,
        {
          baseIndent: 0,
          ignores: [],
          switchCase: 1,
        },
      ],
      'vue/singleline-html-element-content-newline': 'off',
      'vue/no-unused-refs': 'off', // TODO: remove when fixed for useTemplateRef
      'vue/template-curly-spacing': [ 'error', 'always' ],
      'vue-a11y/label-has-for': [ 'error', {
        components: [ 'label' ],
        controlComponents: [ 'input', 'meter', 'progress', 'select', 'textarea' ],
        required: {
          some: [ 'nesting', 'id' ],
        },
        allowChildren: true,
      } ],
      'vue-a11y/media-has-caption': 'off',
    },
  },
);
