<script lang="tsx">
import {
  defineComponent,
  ref,
  PropType,
  onMounted,
  computed,
  useSlots,
  CSSProperties
} from 'vue-demi';
import './Button.css';

export default defineComponent({
  name: 'Button',
  props: {
    color: {
      type: String as PropType<string>,
      default: '#15AE73'
    },
    fontSize: {
      type: Number as PropType<number>,
      default: 16
    },
    fontWeight: {
      type: String as PropType<string>,
      default: 'normal'
    },
    emit: {
      type: String as PropType<string>,
      default: 'archived'
    }
  },
  setup(props) {
    const slots = useSlots();
    const root = ref(null as null | HTMLElement);

    const getStyles = computed(() => {
      let rootFontSize = 16 as number;
      let fontSize = `${props.fontSize / rootFontSize + 'rem'}`;

      if (root.value && root.value.style.fontSize !== '') {
        rootFontSize = parseInt(root.value.style.fontSize);
      }

      if (props.fontSize === 16) {
        fontSize = `clamp(0.3rem, 5vw, ${
          props.fontSize / rootFontSize + 'rem'
        })`;
      } else if (props.fontSize === 14) {
        fontSize = `clamp(0.3rem, 3.5vw, ${
          props.fontSize / rootFontSize + 'rem'
        })`;
      } else if (props.fontSize === 17) {
        fontSize = `clamp(0.3rem, 7vw, ${
          props.fontSize / rootFontSize + 'rem'
        })`;
      }

      return {
        'font-size': fontSize,
        color: props.color,
        'font-weight': props.fontWeight
      } as CSSProperties;
    });

    onMounted(() => {
      root.value = document.documentElement;
    });

    return {
      slots,
      getStyles
    };
  },
  render() {
    return (
      <button
        class="robin-button"
        onClick={() => this.$emit(this.emit)}
        style={this.getStyles}
        data-testid="button"
      >
        {this.slots.default?.('Archived')}
      </button>
    );
  }
});
</script>
