<script lang="tsx">
import { ref, defineComponent, PropType } from 'vue-demi';
import useEmitter from '@/utilities/index';
import './SearchBar.css';

export default defineComponent({
  name: 'SearchBar',
  emits: ['update:modelValue'],
  props: {
    placeholder: {
      type: String as PropType<string>,
      default: 'Search Messages...',
    },
    loading: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
  },
  setup() {
    const text = ref('');
    const { emit, listen } = useEmitter();

    const userTyping = (text: string): void => {
      emit('user-typing', text);
    };

    listen('search-text.reset', () => {
      userTyping('');
    });

    return {
      text,
      userTyping,
    };
  },
  render() {
    return (
      <div class="robin-search-bar">
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9.16667 15.8333C12.8486 15.8333 15.8333 12.8486 15.8333 9.16667C15.8333 5.48477 12.8486 2.5 9.16667 2.5C5.48477 2.5 2.5 5.48477 2.5 9.16667C2.5 12.8486 5.48477 15.8333 9.16667 15.8333Z"
            stroke="#9999BC"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M17.5 17.5L13.875 13.875"
            stroke="#9999BC"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>

        <input
          type="search"
          placeholder={this.placeholder}
          autocomplete="off"
          class="robin-input"
          onInput={(event) => {
            const element = event.target as HTMLInputElement;
            this.userTyping(element.value);
          }}
          onKeyup={(event) => {
            const element = event.target as HTMLInputElement;
            if (event.keyCode === 13) this.userTyping(element.value);
          }}
        />
        <div class="robin-spinner" v-show={this.loading}></div>
      </div>
    );
  },
});
</script>
