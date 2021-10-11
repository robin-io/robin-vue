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
      name: 'robinapp-vue-sdk',
      fileName: (format) => `robinapp-vue-sdk.${format}.js`
    },
    brotliSize: false,
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ['vue', 'moment', 'mime', 'axios', 'vuex', 'vuex-class', 'vue-carousel-3d', 'vue-promised', 'v-viewer', 'v-lazy-image', 'v-emoji-picker', 'robin.io-js'],
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
          'vue-carousel-3d': 'vue-carousel-3d',
          'vue-promised': 'vue-promised',
          'v-viewer': 'v-viewer',
          'v-lazy-image': 'v-lazy-image',
          'v-emoji-picker': 'v-emoji-picker',
          'robin.io-js': 'robin.io-js'
        }
      }
    }
  }
})
