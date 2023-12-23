import { isPackageExists } from 'local-pkg'
import { ensurePackages, interopDefault } from '../utils'
import type { FlatConfigItem, OptionsFiles, OptionsHasTypeScript, OptionsOverrides, OptionsReact } from '../types'
import { GLOB_JSX, GLOB_TSX } from '../globs'

// react refresh
const ReactRefreshAllowConstantExportPackages = [
  'vite',
]

export async function react(
  options: OptionsReact & OptionsHasTypeScript & OptionsOverrides & OptionsFiles = {},
): Promise<FlatConfigItem[]> {
  const {
    files = [GLOB_JSX, GLOB_TSX],
    native = false,
    next = false,
    overrides = {},
    typescript = true,
  } = options

  await ensurePackages([
    'eslint-plugin-react',
    'eslint-plugin-react-hooks',
    'eslint-plugin-react-refresh',
    '@next/eslint-plugin-next',
    '@react-native/eslint-plugin',
  ])

  const [
    pluginReact,
    pluginReactHooks,
    pluginReactRefresh,
    pluginNextJs,
    pluginReactNative,
  ] = await Promise.all([
    interopDefault(import('eslint-plugin-react')),
    interopDefault(import('eslint-plugin-react-hooks')),
    interopDefault(import('eslint-plugin-react-refresh')),
    interopDefault(import('@next/eslint-plugin-next')),
    interopDefault(import('@react-native/eslint-plugin')),
  ] as const)

  const isAllowConstantExport = ReactRefreshAllowConstantExportPackages.some(
    i => isPackageExists(i),
  )

  return [
    {
      name: 'antfu:react:setup',
      plugins: {
        ...(next ? { '@next/next': pluginNextJs } : {}),
        ...(native ? { 'react-native': pluginReactNative } : {}),
        'react': pluginReact,
        'react-hooks': pluginReactHooks,
        'react-refresh': pluginReactRefresh,
      },
      settings: {
        react: {
          version: 'detect',
        },
      },
    },
    {
      files,
      languageOptions: {
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
          sourceType: 'module',
        },
      },
      name: 'antfu:react:rules',
      rules: {
        ...pluginReactHooks.configs.recommended.rules,
        // recommended rules react-hooks
        'react-hooks/exhaustive-deps': 'warn',
        'react-hooks/rules-of-hooks': 'error',

        // react refresh
        'react-refresh/only-export-components': [
          'warn',
          { allowConstantExport: isAllowConstantExport },
        ],

        // recommended rules react
        'react/display-name': 'error',
        'react/jsx-key': 'error',
        'react/jsx-no-comment-textnodes': 'error',
        'react/jsx-no-duplicate-props': 'error',
        'react/jsx-no-target-blank': 'error',
        'react/jsx-no-undef': 'error',
        'react/jsx-uses-react': 'error',
        'react/jsx-uses-vars': 'error',
        'react/no-children-prop': 'error',
        'react/no-danger-with-children': 'error',
        'react/no-deprecated': 'error',
        'react/no-direct-mutation-state': 'error',
        'react/no-find-dom-node': 'error',
        'react/no-is-mounted': 'error',
        'react/no-render-return-value': 'error',
        'react/no-string-refs': 'error',
        'react/no-unescaped-entities': 'error',
        'react/no-unknown-property': 'error',
        'react/no-unsafe': 'off',
        'react/prop-types': 'error',
        'react/react-in-jsx-scope': 'off',
        'react/require-render-return': 'error',

        ...typescript
          ? {
              'react/jsx-no-undef': 'off',
              'react/prop-type': 'off',
            }
          : {},
        ...next
          ? {
              ...pluginNextJs.configs.recommended.rules,
              ...pluginNextJs.configs['core-web-vitals'].rules,
            }
          : {},

        ...native
          ? {
              'react-native/platform-colors': 'error',
              ...pluginReactNative.rules,
            }
          : {},

        // overrides
        ...overrides,
      },
    },
  ]
}