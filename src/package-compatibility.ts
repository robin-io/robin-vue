import { isVue2 } from 'vue-demi';
import Vue3LazyImage from 'v-lazy-image';
import Vue2LazyImage from 'v-lazy-image/v2';
import { mixin as Vue3Clickaway } from 'vue3-click-away';
import { mixin as Vue2Clickaway } from 'vue-clickaway';

const VLazyImage = !isVue2 ? Vue3LazyImage : Vue2LazyImage;
const VueClickaway = !isVue2 ? Vue3Clickaway : Vue2Clickaway;

export {
  VLazyImage,
  VueClickaway
}