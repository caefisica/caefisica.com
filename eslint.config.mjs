import pluginJs from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    {
        ignores: [
            'assets/js/vendor/**',
            'node_modules/**',
            'public/**',
        ],
    },
    pluginJs.configs.recommended,
    tseslint.configs.recommended,
    {
        files: ['**/*.js'],
        rules: {
            '@typescript-eslint/no-require-imports': 'off',
        },
    },
    {
        files: ['**/*.{js,ts}'],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
                Atomics: 'readonly',
                SharedArrayBuffer: 'readonly',
            },
            ecmaVersion: 2020,
            sourceType: 'module',
        },
        rules: {
            'no-console': 0,
            'quotes': ['error', 'double', { avoidEscape: true, allowTemplateLiterals: false }],
            'semi': ['error', 'always'],
            'multiline-ternary': ['error', 'always-multiline'],
            'no-multi-spaces': ['error'],
            'array-element-newline': ['error', 'consistent'],
        },
    }
);
