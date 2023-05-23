import { Robin } from 'robin.io-js'

declare module 'vue/types/vue' {
  // eslint-disable-next-line no-unused-vars
  interface Vue {
    $robin: Robin;
    $conn: WebSocket;
    $user_token: string;
    $logo: string;
    $channel: string;
    $robin_users: Array<Record<string, any>>;
    $conversations: Array<Record<string, any>>;
    $regularConversations: Array<Record<string, any>>;
    $archivedConversations: Array<Record<string, any>>;
    $senderName: string;
    $apiKey: string;
    $sessionKey: string;
  }
}
