import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import { coverageConfigDefaults } from 'vitest/config'

export default defineConfig({
  plugins: [
    dts({
      include: ['src'],
      copyDtsFiles: true,
      rollupTypes: true,
    }),
  ],
  test: {
    globals: true,
    // Default stays `node` so SSR specs see no `window`.
    // Client specs opt into `happy-dom` via file pragma.
    coverage: {
      include: ['src/**'],
      exclude: [
        '**/index.ts',
        ...coverageConfigDefaults.exclude,
      ],
    },
  },
  build: {
    minify: true,
    lib: {
      entry: {
        'use-head': resolve(__dirname, 'src/use-head/index.ts'),
      },
      formats: ['es', 'cjs'],
      fileName: (format, entryName) =>
        `${entryName}.${format === 'es' ? 'js' : 'cjs'}`,
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
})
