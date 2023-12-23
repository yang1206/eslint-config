import { ensurePackages, interopDefault } from '../utils'
import type { FlatConfigItem } from '../types'

export async function tailwindcss(
): Promise<FlatConfigItem[]> {
  await ensurePackages([
    'eslint-plugin-tailwindcss',
  ])

  const [
    pluginTailwindcss,
  ] = await Promise.all([
    interopDefault(import('eslint-plugin-tailwindcss')),
  ] as const)

  return [
    {
      name: 'eslint:tailwindcss',
      plugins: {
        tailwindcss: pluginTailwindcss,
      },
      rules: {
        ...pluginTailwindcss.configs.recommended.rules,
      },
    },
  ]
}
