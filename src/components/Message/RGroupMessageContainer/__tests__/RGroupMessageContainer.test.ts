import { mount } from '@vue/test-utils'
import RGroupMessageContainer from '../RGroupMessageContainer.vue'
import RGroupChatHeader from '@/components/Message/RGroupChatHeader/RGroupChatHeader.vue'
import RMessageInputBar from '@/components/Message/RMessageInputBar/RMessageInputBar.vue'
import RVoiceRecorderButton from '@/components/Message/RVoiceRecorderButton/RVoiceRecorderButton.vue'
import RAttachFileButton from '@/components/Message/RAttachFileButton/RAttachFileButton.vue'
import RText from '@/components/ChatList/RText/RText.vue'
// import RUnreadMessageBar from '@/components/Message/RUnreadMessagesBar/RUnreadMessagesBar.vue'

describe('RGroupMessageContainer', () => {
  it('should have RGroupChatHeader Component in parent component', () => {
    const wrapper = mount(RGroupMessageContainer)
    const childComponent = wrapper.findComponent(RGroupChatHeader)

    expect(childComponent.exists()).toBe(true)
  })

  it('should have RMessageInputBar Component in parent component', () => {
    const wrapper = mount(RGroupMessageContainer)
    const childComponent = wrapper.findComponent(RMessageInputBar)

    expect(childComponent.exists()).toBe(true)
  })

  it('should have RVoiceRecorderButton Component in parent component', () => {
    const wrapper = mount(RGroupMessageContainer)
    const childComponent = wrapper.findComponent(RVoiceRecorderButton)

    expect(childComponent.exists()).toBe(true)
  })

  it('should have RAttachFileButton Component in parent component', () => {
    const wrapper = mount(RGroupMessageContainer)
    const childComponent = wrapper.findComponent(RAttachFileButton)

    expect(childComponent.exists()).toBe(true)
  })

  it('should have RText Component in parent component', () => {
    const wrapper = mount(RGroupMessageContainer)
    const childComponent = wrapper.findComponent(RText)

    expect(childComponent.exists()).toBe(true)
  })

  // it('should have RUnreadMessageBar Component in parent component', () => {
  //   const wrapper = mount(RGroupMessageContainer)
  //   const childComponent = wrapper.findComponent(RUnreadMessageBar)

  //   expect(childComponent.exists()).toBe(true)
  // })
})
