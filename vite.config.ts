import { defineConfig } from 'vite'
import { createVuePlugin } from 'vite-plugin-vue2'
import { resolve } from 'path'
import { dependencies } from './package.json'

// https://vitejs.dev/config /
export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  plugins: [createVuePlugin()],
  optimizeDeps: {
    disabled: false
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/main.ts'),
      name: 'robin-vue',
      fileName: (format) => `robin-vue.${format}.js`
    },
    // brotliSize: false,
    rollupOptions: {
      external: [...Object.keys(dependencies)],
      treeshake: 'recommended'
    }
  }
})
