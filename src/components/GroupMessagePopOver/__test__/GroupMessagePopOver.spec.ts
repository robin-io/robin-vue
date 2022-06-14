import { render, fireEvent } from '@testing-library/vue'
import GroupMessagePopOver from '../GroupMessagePopOver.vue'

describe('GroupMessagePopOver component', () => {
  test('should emit event when group info is clicked', async () => {
    const { getByTestId, emitted } = render(GroupMessagePopOver)

    await fireEvent.click(getByTestId('view-group-profile'))

    expect(emitted()['view-group-profile']).toHaveProperty('length', 1)
  })
})
