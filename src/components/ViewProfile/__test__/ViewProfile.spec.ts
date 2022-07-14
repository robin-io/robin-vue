import { render, fireEvent } from '@testing-library/vue'
import ViewProfile from '../ViewProfile.vue'

describe('ViewProfile component', () => {
  test('should switch media type', async () => {
    const { getByTestId } = render(ViewProfile)

    await fireEvent.click(getByTestId('doc-nav-button'))

    expect(getByTestId('doc-nav-button').classList[0]).toBe('active')
  })
})
