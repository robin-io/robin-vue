import { render, fireEvent } from '@testing-library/vue'
import OptionButton from '../OptionButton.vue'

describe('OptionButton component', () => {
  test('should emit event', async () => {
    const { getByTestId, emitted } = render(OptionButton)

    await fireEvent.click(getByTestId('button'))

    expect(emitted().open).toHaveProperty('length', 1)
  })
})
