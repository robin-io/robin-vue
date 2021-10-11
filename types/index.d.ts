import { Robin } from 'robin.io-js'
import store from './store/index'

declare module 'vue/types/vue' {
  // eslint-disable-next-line no-unused-vars
  interface Vue {
    $store: store
    $robin: Robin
    $conn: WebSocket
    $user_token: string
    $channel: string
    $robin_users: Array<any>
    $conversations: Array<any>
    $regularConversations: Array<any>
    $archivedConversations: Array<any>,
    $senderName: string
  }
}
