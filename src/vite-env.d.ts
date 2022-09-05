/// <reference types="vite/client" />
declare module '*.vue' {
  import type { defineComponent } from 'vue-demi';
  const component: defineComponent<Record<string, unknown>, Record<string, unknown>, unknown>;

  export default component;
}

declare module '.pnpm/vue@2.7.8/node_modules/vue/types/vnode.d.ts' {
  import { VNodeData } from '.pnpm/vue@2.7.10/node_modules/vue/types/vnode.d.ts';

  interface VNodeData {
    ref?: unknown;
  }
}

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

declare module 'mime';
declare module 'v-lazy-image'
declare module 'v-lazy-image/v2'
declare module 'audio-recorder-polyfill/mpeg-encoder';
declare module 'vue3-click-away'
declare module 'vue-click-away'