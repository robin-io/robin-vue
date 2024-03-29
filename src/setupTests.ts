import Vue from 'vue'
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Runs in every test.

Vue.prototype.$robin_users = [
  {
    userToken: 'FefXITDgAeTVrghcOHiimDVB',
    profileImage: '',
    userName: 'Elvis Chuks'
  },
  {
    user_token: 'clpYwBMnDGdynSarEBZOuPWZ',
    profile_image: '',
    userName: 'Enoch Chejieh'
  },
  {
    userToken: 'tMgzcqdUUDsJndIHcJyJdmpi',
    profileImage: '',
    userName: 'Mike Scoffield'
  }
]

Vue.prototype.$user_token = 'FefXITDgAeTVrghcOHiimDVB'

Vue.prototype.$robin = {
  apiKey: 'NT-XmIzEmWUlsrQYypZOFRlogDFvQUsaEuxMfZf',
  tls: true,
  retries: 0,
  isConnected: false,
  baseUrl: 'https://api.robinapp.co/api/v1',
  wsUrl: 'wss://api.robinapp.co/ws',
  deleteMessages: vi.fn()
}

Vue.prototype.$toast = {
  open: vi.fn()
}

Vue.prototype.$apiKey = 'NT-XmIzEmWUlsrQYypZOFRlogDFvQUsaEuxMfZf'

Vue.prototype.$logo = ''

Vue.prototype.$channel = 'private_chat'

Vue.prototype.$conversations = [
  {
    _id: '6219fffd8ea69f0c83788f0a',
    created_at: '2022-02-26T10:25:01.732Z',
    updated_at: '2022-04-20T10:31:25.257Z',
    data: null,
    participants: null,
    is_group: false,
    name: '',
    group_icon: '',
    sender_name: 'Elvis',
    sender_token: 'clpYwBMnDGdynSarEBZOuPWZ',
    receiver_name: 'precious',
    receiver_token: 'HVxGcOqwUwHNHAxNwinzydpG',
    attachments: null,
    moderator: {
      user_token: '',
      is_moderator: false,
      meta_data: null
    },
    archived_for: [],
    last_message: {
      channel: 'private_chat',
      conversation_id: '6219fffd8ea69f0c83788f0a',
      is_attachment: false,
      msg: 'Hope say you bring something for me from Dubai 🌚.\n\nEven say nah princess i go collect  👐 ',
      receiver_token: 'HVxGcOqwUwHNHAxNwinzydpG',
      sender_token: 'clpYwBMnDGdynSarEBZOuPWZ',
      timestamp: '2022-04-20T10:31:24.845Z'
    },
    unread_messages: 0,
    owner_id: '61f842bb89ab0fca0f9af5f2',
    owner_email: 'hello@robinapp.co',
    app_id: '61f842cf89ab0fca0f9af5f4',
    app_name: 'Acumen App (Auth)',
    deleted_for: null,
    is_deleted: false
  },
  {
    _id: '626130780977c64eced9b7f8',
    created_at: '2022-04-21T10:22:48.568Z',
    updated_at: '2022-06-07T11:07:58.473Z',
    data: null,
    participants: [
      {
        user_token: 'FefXITDgAeTVrghcOHiimDVB',
        is_moderator: false,
        meta_data: { display_name: 'Elvis Chuks', profile_image: '' }
      }, { user_token: 'clpYwBMnDGdynSarEBZOuPWZ', is_moderator: true, meta_data: { display_name: 'Enoch Chejieh' } }],
    is_group: true,
    name: 'New group',
    group_icon: 'https://s3.us-east-2.amazonaws.com/robinapp.io/you%21.png',
    sender_name: '',
    sender_token: '',
    receiver_name: '',
    receiver_token: '',
    attachments: null,
    moderator: { user_token: 'clpYwBMnDGdynSarEBZOuPWZ', is_moderator: false, meta_data: { display_name: 'Enoch Chejieh' } },
    archived_for: [],
    last_message: { channel: 'private_chat', conversation_id: '626130780977c64eced9b7f8', is_attachment: false, local_id: 'f6fc48d4-dede-48d8-8328-ba205b1acbe6', msg: '🌚', sender_name: 'Elvis Chuks', sender_token: 'FefXITDgAeTVrghcOHiimDVB', timestamp: '2022-06-01T12:59:37.292527+01:00' },
    unread_messages: 0,
    owner_id: '61f842bb89ab0fca0f9af5f2',
    owner_email: 'hello@robinapp.co',
    app_id: '61f842cf89ab0fca0f9af5f4',
    app_name: 'Acumen App (Auth)',
    deleted_for: null,
    is_deleted: false
  }
]

Vue.prototype.$regularConversations = [
  {
    _id: '6219fffd8ea69f0c83788f0a',
    created_at: '2022-02-26T10:25:01.732Z',
    updated_at: '2022-04-20T10:31:25.257Z',
    data: null,
    participants: null,
    is_group: false,
    name: '',
    group_icon: '',
    sender_name: 'Enoch',
    sender_token: 'clpYwBMnDGdynSarEBZOuPWZ',
    receiver_name: 'precious',
    receiver_token: 'HVxGcOqwUwHNHAxNwinzydpG',
    attachments: null,
    moderator: {
      user_token: '',
      is_moderator: false,
      meta_data: null
    },
    archived_for: [],
    last_message: {
      channel: 'private_chat',
      conversation_id: '6219fffd8ea69f0c83788f0a',
      is_attachment: false,
      msg: 'Hope say you bring something for me from Dubai 🌚.\n\nEven say nah princess i go collect  👐 ',
      receiver_token: 'HVxGcOqwUwHNHAxNwinzydpG',
      sender_token: 'clpYwBMnDGdynSarEBZOuPWZ',
      timestamp: '2022-04-20T10:31:24.845Z'
    },
    unread_messages: 0,
    owner_id: '61f842bb89ab0fca0f9af5f2',
    owner_email: 'hello@robinapp.co',
    app_id: '61f842cf89ab0fca0f9af5f4',
    app_name: 'Acumen App (Auth)',
    deleted_for: null,
    is_deleted: false
  }
]

Vue.prototype.$archivedConversations = [
  {
    _id: '622f4032c4d773dd805e86ee',
    created_at: '2022-03-14T13:16:34.166Z',
    updated_at: '2022-04-19T07:21:38.748Z',
    data: null,
    participants: null,
    is_group: false,
    name: '',
    group_icon: '',
    sender_name: 'Enoch',
    sender_token: 'OykUCsrYJddWcJsDfHDQKKop',
    receiver_name: 'Enoch ',
    receiver_token: 'clpYwBMnDGdynSarEBZOuPWZ',
    attachments: null,
    moderator: {
      user_token: '',
      is_moderator: false,
      meta_data: null
    },
    archived_for: [
      'clpYwBMnDGdynSarEBZOuPWZ'
    ],
    last_message: {
      channel: 'private_chat',
      conversation_id: '622f4032c4d773dd805e86ee',
      is_attachment: false,
      msg: 'wew',
      receiver_token: 'clpYwBMnDGdynSarEBZOuPWZ',
      sender_token: 'OykUCsrYJddWcJsDfHDQKKop',
      timestamp: '2022-04-18T21:07:15.001Z'
    },
    unread_messages: {
      clpYwBMnDGdynSarEBZOuPWZ: {
        unread_count: 2
      }
    },
    owner_id: '61f842bb89ab0fca0f9af5f2',
    owner_email: 'hello@robinapp.co',
    app_id: '61f842cf89ab0fca0f9af5f4',
    app_name: 'Acumen App (Auth)',
    deleted_for: null,
    is_deleted: false
  }
]

Vue.prototype.$senderName = 'Enoch Chejieh'

// audio player mock
const MEDIA_ELEMENT = global.window.HTMLMediaElement.prototype as any
MEDIA_ELEMENT._mock = {
  paused: true,
  duration: NaN,
  _loaded: false,
  // Emulates the audio file loading
  _load: function audioInit (audio: { dispatchEvent: (arg0: Event) => void }) {
    // Note: we could actually load the file from this.src and get real duration.
    // and other metadata.
    audio.dispatchEvent(new Event('loadedmetadata'))
    audio.dispatchEvent(new Event('canplaythrough'))
  },
  // Reset audio object mock data to the initial state.
  _resetMock: function resetMock (audio: { _mock: any }) {
    audio._mock = Object.assign(
      {},
      MEDIA_ELEMENT._mock
    )
  }
}

// Get "paused" value, it is automatically set to true / false when we play / pause the audio.
Object.defineProperty(MEDIA_ELEMENT, 'paused', {
  get () {
    return this._mock.paused
  }
})

// Get and set audio duration.
Object.defineProperty(MEDIA_ELEMENT, 'duration', {
  get () {
    return this._mock.duration
  },
  set (value) {
    // Reset the mock state to initial (paused) when we set the duration.
    this._mock._resetMock(this)
    this._mock.duration = value
  }
})

// Start the playback.
MEDIA_ELEMENT.play = function playMock () {
  if (!this._mock._loaded) {
    // emulate the audio file load and metadata initialization.
    this._mock._load(this)
  }
  this._mock.paused = false
  this.dispatchEvent(new Event('play'))
}

// Pause the playback.
MEDIA_ELEMENT.pause = function pauseMock () {
  this._mock.paused = true
  this.dispatchEvent(new Event('pause'))
}

MEDIA_ELEMENT.srcObject = {
  getTracks: vi.fn(() => [{
    stop: vi.fn()
  }, {
    stop: vi.fn()
  }])
}

Object.defineProperty(global, 'MediaRecorder', {
  value: vi.fn(() => ({
    start: vi.fn(),
    addEventListener: vi.fn(),
    stream: {
      getTracks: vi.fn(() => [{
        stop: vi.fn()
      }, {
        stop: vi.fn()
      }])
    },
    stop: vi.fn()
  }))
})

Object.defineProperty(MediaRecorder, 'isTypeSupported', {
  value: () => true
})

Object.defineProperty(global.navigator, 'mediaDevices', {
  value: {
    getUserMedia: vi.fn(() => Promise.resolve())
  }
})
