import { defineConfig } from 'vitest/config'
import { createVuePlugin } from 'vite-plugin-vue2'
import { resolve } from 'path'

// https://vitejs.dev/config /
export default defineConfig({
  test: {
    globals: true,
    setupFiles: 'src/setupTests.ts'
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  plugins: [
    createVuePlugin()
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/main.ts'),
      name: 'robin.io-vue2',
      fileName: (format) => `robin.io-vue2.${format}.js`
    },
    // brotliSize: false,
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ['vue', 'moment', 'mime', 'axios', 'v-lazy-image', 'v-emoji-picker', 'robin.io-js', 'vue-toast-notification', 'link-prevue', 'vue-clickaway'],
      output: {
        globals: {
          vue: 'Vue',
          moment: 'moment',
          mime: 'mime',
          axios: 'axios',
          'v-lazy-image': 'v-lazy-image',
          'v-emoji-picker': 'v-emoji-picker',
          'robin.io-js': 'robin.io-js',
          'vue-toast-notification': 'vue-toast-notification',
          'link-prevue': 'link-prevue',
          'vue-clickaway': 'vue-clickaway',
          cypress: 'cypress',
          '@testing-library/user-event': '@testing-library/user-event'
        }
      }
    }
  }
})
