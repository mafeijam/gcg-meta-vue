import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  plugins: [
    AutoImport({
      imports: ['vue', 'vue-router'],
      dirs: ['./src/utils', './src/composables'],
      eslintrc: { enabled: true, filepath: './.dev/.eslintrc-auto-import.json' },
      vueTemplate: true,
      dts: './.dev/auto-imports.d.ts',
    }),
    Components({ dts: './.dev/components.d.ts' }),
    vue(),
    tailwindcss(),
  ],
})
