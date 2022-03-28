import { Robin } from 'robin.io-js'

declare module 'vue/types/vue' {
  // eslint-disable-next-line no-unused-vars
  interface Vue {
    $robin: Robin
    $conn: WebSocket
    $user_token: string
    $channel: string
    $robin_users: Array<any>
    $conversations: Array<any>
    $regularConversations: Array<any>
    $archivedConversations: Array<any>,
    $senderName: string,
    $apiKey: string
  }
}
