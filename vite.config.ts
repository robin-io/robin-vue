import { defineConfig } from 'vite'
import { createVuePlugin } from 'vite-plugin-vue2'
import { resolve } from 'path'

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
      external: ['vue', 'moment', 'mime', 'v-lazy-image', 'v-emoji-picker', 'vue-toast-notification', 'cypress', 'lodash.debounce', 'audio-recorder-polyfill'],
      output: {
        globals: {
          vue: 'Vue',
          moment: 'moment',
          mime: 'mime',
          cypress: 'cypress',
          'v-lazy-image': 'v-lazy-image',
          'v-emoji-picker': 'v-emoji-picker',
          'vue-toast-notification': 'vue-toast-notification',
          'lodash.debounce': 'lodash.debounce',
          'audio-recorder-polyfill': 'audio-recorder-polyfill'
        }
      },
      treeshake: 'recommended'
    }
  }
})
