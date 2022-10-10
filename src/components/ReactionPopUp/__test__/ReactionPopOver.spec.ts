import { render, fireEvent } from '@testing-library/vue'
import ReactionPopOver from '../ReactionPopUp.vue'

describe('ReactionPopOver component', () => {
  test('should emit reactions', async () => {
    const { getByText, emitted } = render(ReactionPopOver)

    await fireEvent.click(getByText('❤️'))
    await fireEvent.click(getByText('👍'))
    await fireEvent.click(getByText('👎'))
    await fireEvent.click(getByText('⁉️'))

    expect(emitted().reaction[0][0]).toBe('❤️')
    expect(emitted().reaction[1][0]).toBe('👍')
    expect(emitted().reaction[2][0]).toBe('👎')
    expect(emitted().reaction[3][0]).toBe('⁉️')
    expect(emitted().reaction).toHaveProperty('length', 4)
  })
})
