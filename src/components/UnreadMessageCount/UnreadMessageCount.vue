<script lang="ts">
import { defineComponent, PropType, h } from 'vue-demi'
import './UnreadMessageCount.css'

export default defineComponent({
  name: 'UnreadMessageCount',
  props: {
    unread: {
      type: [Number, String],
      default: 0,
    },
    backgroundColor: {
      type: String as PropType<string>,
      default: '#15AE73',
    },
  },
  render() {
    let unreadMessages

    if (this.unread > 0 && this.unread <= 9) {
      unreadMessages = h(
        'div',
        {
          class: 'robin-unread-message-count',
          style: {
            'background-color': this.backgroundColor,
          },
          'data-testid': 'unread-count',
        },
        this.unread
      )
    } else if (this.unread > 9) {
      unreadMessages = h(
        'div',
        {
          class: 'robin-unread-message-count',
          style: {
            'background-color': this.backgroundColor,
          },
          'data-testid': 'unread-count',
        },
        '9+'
      )
    } else {
      unreadMessages = h(
        'div',
        {
          class: 'robin-unread-message-count',
          style: {
            'background-color': this.backgroundColor,
          },
          'data-testid': 'unread-count',
        },
        ''
      )
    }

    return h(
      'div',
      {
        class: 'robin-flex robin-flex-align-center',
      },
      [unreadMessages]
    )
  },
})
</script>
