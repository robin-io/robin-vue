/// <reference types="vite/client" />
declare module '*.vue' {
  import type { defineComponent } from 'vue-demi'
  const component: defineComponent<{}, {}, any>
  export default component
}

declare module '*.json'