import { mount } from '@vue/test-utils'
import RGroupMessagePopOver from '../RGroupMessagePopOver.vue'
import RText from '@/components/ChatList/RText/RText.vue'

describe('RGroupMessagePopOver', () => {
  it('should have RText Component in parent component', () => {
    const wrapper = mount(RGroupMessagePopOver)
    const childComponent = wrapper.findComponent(RText)

    expect(childComponent.exists()).toBe(true)
  })
})
