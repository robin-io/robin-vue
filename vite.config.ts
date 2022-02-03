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
      external: ['vue', 'moment', 'mime', 'axios', 'vuex', 'vuex-class', 'v-lazy-image', 'v-emoji-picker', 'robin.io-js', 'vue-toast-notification', 'vue-inline-svg', 'link-prevue', 'vue-clickaway'],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          vue: 'Vue',
          moment: 'moment',
          mime: 'mime',
          axios: 'axios',
          vuex: 'vuex',
          'vuex-class': 'vuex-class',
          'v-lazy-image': 'v-lazy-image',
          'v-emoji-picker': 'v-emoji-picker',
          'robin.io-js': 'robin.io-js',
          'vue-toast-notification': 'vue-toast-notification',
          'vue-inline-svg': 'vue-inline-svg',
          'link-prevue': 'link-prevue',
          'vue-clickaway': 'vue-clickaway'
        }
      }
    }
  }
})
