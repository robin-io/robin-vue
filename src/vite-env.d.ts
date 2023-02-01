/* eslint-disable no-unused-vars */

/* General types */

type ObjectType = Record<string, any>

/* Package declarations */

declare module '*.vue' {
  import Vue from 'vue'
  export default Vue
}

declare module 'mime'
declare module 'v-lazy-image/v2'
declare module 'audio-recorder-polyfill/mpeg-encoder'
declare module 'lodash.debounce'

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}
