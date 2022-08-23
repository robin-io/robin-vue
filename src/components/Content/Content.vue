<script lang="tsx">
import {
  ref,
  computed,
  defineComponent,
  PropType,
  onMounted,
  useSlots,
  CSSProperties
} from 'vue-demi';
import './Content.css';

export default defineComponent({
  name: 'Content',
  props: {
    as: {
      type: String as PropType<string>,
      default: 'h1',
      validator: (value: string) => {
        return ['h1', 'h2', 'h3', 'p', 'span', 'label'].includes(value);
      }
    },
    text: {
      type: String as PropType<string>,
      default: 'This is a text'
    },
    color: {
      type: String as PropType<string>,
      default: '#000000'
    },
    fontSize: {
      type: Number as PropType<number>,
      default: 16
    },
    fontWeight: {
      type: String as PropType<string>,
      default: 'normal'
    },
    lineHeight: {
      type: Number as PropType<number>,
      default: 0
    },
    textWrap: {
      type: String as PropType<string>,
      default: 'nowrap'
    },
    wordBreak: {
      type: String as PropType<string>,
      default: 'initial'
    },
    maxWidth: {
      type: String as PropType<string>,
      default: 'max-content'
    },
    textAlign: {
      type: String as PropType<string>,
      default: 'left'
    },
    // only needed for labels
    forRef: {
      type: String as PropType<string>,
      default: 'document-upload'
    }
  },
  setup(props) {
    const slots = useSlots();
    const root = ref(null as null | HTMLElement);
    const getStyle = computed(() => {
      let rootFontSize = 16 as number;
      let fontSize = `${props.fontSize / rootFontSize + 'rem'}`;

      if (root.value && root.value.style.fontSize !== '') {
        rootFontSize = parseInt(root.value.style.fontSize);
      }

      if (props.fontSize > 16) {
        fontSize = `clamp(0.3rem, 7vw, ${props.fontSize / rootFontSize}rem)`;
      } else if (props.fontSize === 16) {
        fontSize = `clamp(0.3rem, 5vw, ${props.fontSize / rootFontSize}rem)`;
      } else if (props.fontSize === 14) {
        fontSize = `clamp(0.3rem, 3.5vw, ${props.fontSize / rootFontSize}rem)`;
      } else {
        fontSize = `clamp(0.2rem, 3.5vw, ${props.fontSize / rootFontSize}rem)`;
      }

      return {
        'font-size': fontSize,
        color: props.color,
        'font-weight': props.fontWeight,
        'line-height':
          props.lineHeight === 0
            ? 'initial'
            : props.lineHeight / rootFontSize + 'rem',
        'white-space': props.textWrap,
        'word-break': props.wordBreak,
        'text-align': props.textAlign,
        'max-width': props.maxWidth
      } as CSSProperties;
    });

    onMounted(() => {
      root.value = document.documentElement;
    });

    return {
      slots,
      getStyle
    };
  },
  render() {
    let element;

    if (this.as === 'h1') {
      element = (
        <h1 class="robin-text" style={this.getStyle}>
          {this.slots.default?.()}
        </h1>
      );
    } else if (this.as === 'h2') {
      element = (
        <h2 class="robin-text" style={this.getStyle}>
          {this.slots.default?.()}
        </h2>
      );
    } else if (this.as === 'h3') {
      element = (
        <h3 class="robin-text" style={this.getStyle}>
          {this.slots.default?.()}
        </h3>
      );
    } else if (this.as === 'p') {
      element = (
        <p class="robin-text" style={this.getStyle}>
          {this.slots.default?.()}
        </p>
      );
    } else if (this.as === 'span') {
      element = (
        <span class="robin-text" style={this.getStyle}>
          {this.slots.default?.()}
        </span>
      );
    } else if (this.as === 'label') {
      element = (
        <label
          class="robin-text"
          style={this.getStyle}
          for={this.forRef}
          data-testid="label"
        >
          {this.slots.default?.()}
        </label>
      );
    }

    return element;
  }
});
</script>
