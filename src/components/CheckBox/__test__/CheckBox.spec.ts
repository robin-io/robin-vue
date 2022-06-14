import { render, fireEvent } from '@testing-library/vue'
import CheckBox from '../CheckBox.vue'

describe('CheckBox component', () => {
  test('should render checkbox', async () => {
    const { getByTestId } = render(CheckBox)

    const input = getByTestId('checkbox') as HTMLInputElement

    await fireEvent.click(input)

    expect(input.checked).toBe(true)

    await fireEvent.click(input)

    expect(input.checked).toBe(false)
  })

  test('should emit event when checkbox is clicked', async () => {
    const { getByTestId, emitted } = render(CheckBox)

    const input = getByTestId('checkbox')

    await fireEvent.click(input)

    expect(emitted().clicked).toHaveProperty('length', 1)
  })
})
