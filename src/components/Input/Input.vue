<script lang="tsx">
import {
  defineComponent,
  PropType,
  computed,
  CSSProperties,
  ref,
  watch
} from 'vue-demi';
import './Input.css';

export default defineComponent({
  name: 'Input',
  props: {
    placeholder: {
      type: String as PropType<string>,
      default: 'Choose a group chat name'
    },
    borderRadius: {
      type: Number as PropType<number>,
      default: 4
    },
    height: {
      type: Number as PropType<number>,
      default: 44
    },
    width: {
      type: [String, Number] as PropType<string | number>,
      default: 'fullWidth',
      validator: (value: string) => {
        const regex = /^\d+$/;
        return regex.test(value) || value.includes('fullWidth');
      }
    },
    text: {
      type: String as PropType<string>,
      default: ''
    },
    reset: {
      type: Boolean as PropType<boolean>,
      default: false
    }
  },
  setup(props, context) {
    const input = ref();
    const text = ref(props.text);
    const reset = ref(props.reset);

    const getStyles = computed((): CSSProperties => {
      return {
        'border-radius': props.borderRadius + 'px',
        'min-height': props.height + 'px',
        width: props.width === 'fullWidth' ? '100%' : props.width + 'px'
      };
    });

    watch([text, reset], ([text, reset]) => {
      if (text === '' || reset) {
        resetTyping();
      }
    });

    const userTyping = (val: string): void => {
      context.emit('user-typing', val);
    };

    const resetTyping = (): void => {
      const inputElement = input.value as any;
      inputElement.value = '';
    };

    return { input, userTyping, getStyles };
  },
  render() {
    return (
      <input
        type="text"
        placeholder={this.placeholder}
        onInput={(event) => {
          const element = event.target as HTMLInputElement;
          this.userTyping(element.value);
        }}
        autocomplete="off"
        class="robin-input"
        ref={this.input}
        style={this.getStyles}
        data-testid="input"
      />
    );
  }
});
</script>
