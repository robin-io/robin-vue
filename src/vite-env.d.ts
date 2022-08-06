/* eslint-disable no-unused-vars */

declare module '*.vue' {
  import Vue from 'vue'
  export default Vue
}

declare module 'mime'
declare module 'v-lazy-image/v2'
declare module 'base64-url'
declare module 'link-prevue'
declare module 'audio-recorder-polyfill/mpeg-encoder'

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}
