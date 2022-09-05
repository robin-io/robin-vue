<script lang="tsx">
import { defineComponent, PropType, ref } from 'vue-demi';
import Button from '../Button/Button.vue';
import 'ReactionPopOver.css';

export default defineComponent({
  name: 'ReactionPopOver',
  props: {
    id: {
      type: String as PropType<string>,
      default: ''
    },
    message: {
      type: [Object, Array],
      default: () => {}
    }
  },
  setup() {
    const popUpBody = ref();

    return { popUpBody };
  },
  render() {
    return (
      <div class="robin-reaction-popover robin-zoomIn" ref={this.popUpBody}>
        <div class="robin-reaction-container">
          <Button
            font-size={18}
            emit="click"
            onClick={() => this.$emit('reaction', '❤️')}
            data-testid="heart"
          >
            {() => '❤️'}
          </Button>
          <Button
            font-size={18}
            emit="click"
            onClick={() => this.$emit('reaction', '👍')}
            data-testid="thumbs-up"
          >
            {() => '👍'}
          </Button>
          <Button
            font-size={18}
            emit="click"
            onClick={() => this.$emit('reaction', '👎')}
            data-testid="thumbs-down"
          >
            {() => '👎'}
          </Button>
          <Button
            font-size={18}
            emit="click"
            onClick={this.$emit('reaction', '😂')}
            data-testid="laughter"
          >
            {() => '😂'}
          </Button>
          <Button
            font-size={18}
            color="initial"
            emit="click"
            onClick={this.$emit('reaction', '⁉️')}
            data-testid="question"
          >
            {() => '⁉️'}
          </Button>
        </div>
      </div>
    );
  }
});
</script>
