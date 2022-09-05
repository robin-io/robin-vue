<script lang="tsx">
import { defineComponent, PropType, h } from 'vue-demi';
import './AlphabetBlock.css';

export default defineComponent({
  name: 'AlphabetBlock',
  props: {
    text: {
      type: String as PropType<string>,
      default: 'A'
    }
  },
  render() {
    return (
      <div class="robin-alphabet-block robin-flex robin-flex-align-center">
        {this.text}
      </div>
    );
  }
});
</script>
