<script lang="tsx">
import { defineComponent, PropType, CSSProperties } from 'vue-demi';
import './UnreadMessageCount.css';

export default defineComponent({
  name: 'UnreadMessageCount',
  props: {
    unread: {
      type: [Number, String],
      default: 0
    },
    backgroundColor: {
      type: String as PropType<string>,
      default: '#15AE73'
    }
  },
  setup(props) {
    return {
      styles: { 'background-color': props.backgroundColor } as CSSProperties
    };
  },
  render() {
    return (
      <div class="robin-flex robin-flex-align-center">
        <div
          class="robin-unread-message-count"
          data-testid="unread-count"
          style={this.styles}
        >
          {this.unread > 0 && this.unread <= 9
            ? this.unread
            : this.unread > 9
            ? '+9'
            : ''}
        </div>
      </div>
    );
  }
});
</script>
