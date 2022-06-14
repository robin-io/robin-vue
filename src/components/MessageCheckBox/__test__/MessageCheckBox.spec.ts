import { render, fireEvent } from '@testing-library/vue'
import MessageCheckBox from '../MessageCheckBox.vue'

describe('MessagCheckBox component', () => {
  test('should render checkbox', async () => {
    const { getByTestId } = render(MessageCheckBox)

    const input = getByTestId('checkbox') as HTMLInputElement

    await fireEvent.click(input)

    expect(input.checked).toBe(true)

    await fireEvent.click(input)

    expect(input.checked).toBe(false)
  })
})
