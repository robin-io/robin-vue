import { defineConfig } from 'vitest/config';
import { resolve } from 'path';
import { isVue2 } from 'vue-demi';

let vue;
let vueJsx;

if (isVue2) {
  const { createVuePlugin } = require('vite-plugin-vue2');
  vueJsx = require('@vitejs/plugin-vue2-jsx');
  vue = createVuePlugin;
} else {
  vue = require('@vitejs/plugin-vue');
  vueJsx = require('@vitejs/plugin-vue-jsx');
}

export default defineConfig({
  plugins: [vue(), vueJsx()],
  optimizeDeps: {
    exclude: ['vue-demi']
  },
  test: {
    globals: true,
    setupFiles: 'src/setupTests.ts'
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    },
    dedupe: ['vue']
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/main.ts'),
      name: 'robin-vue',
      fileName: (format) => {
        if (isVue2) `robin-vue.${format}2.js`;

        return `robin-vue.${format}.js`;
      }
    },
    rollupOptions: {
      external: ['vue', 'vue-demi', 'robin.io-js', 'moment'],
      output: {
        globals: {
          vue: 'Vue',
          'vue-demi': 'VueDemi',
          'robin.io-js': 'robin.io-js',
          moment: 'moment'
        }
      }
    }
  }
});
