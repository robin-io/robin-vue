import { render, fireEvent } from '@testing-library/vue'
import PersonalMessagePopOver from '../PersonalMessagePopOver.vue'

describe('PersonalMessagePopOver component', () => {
  test('should emit event', async () => {
    const { getByText, emitted } = render(PersonalMessagePopOver)

    await fireEvent.click(getByText('Contact Info'))

    expect(emitted()['view-profile']).toHaveProperty('length', 1)
  })
})
