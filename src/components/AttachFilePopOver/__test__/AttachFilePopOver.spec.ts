import { render } from '@testing-library/vue'
import AttachFilePopOver from '../AttachFilePopOver.vue'

describe('AttachFilePopOver component', () => {
  test('should render mobile camera element', async () => {
    const { getAllByTestId } = render(AttachFilePopOver)
    const el = getAllByTestId('label') as any

    expect(el[0].childNodes.length === 3)
  })
})
