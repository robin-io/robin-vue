import { render, fireEvent } from '@testing-library/vue'
import NewGroupChatList from '../NewGroupChatList.vue'
import { robinUsers } from '@/data'

describe('NewGroupChatList component', () => {
  test('should render username', () => {
    const { getByText } = render(NewGroupChatList, {
      props: {
        robinUsers
      }
    })

    getByText('Enoch Chejieh')
  })

  test('should check all checkboxes', async () => {
    const { getByTestId, queryAllByTestId } = render(NewGroupChatList, {
      props: {
        robinUsers
      }
    })

    await fireEvent.click(getByTestId('select-all-button'))

    queryAllByTestId('checkbox').forEach((checkbox: any) => {
      if (checkbox.checked !== undefined) { expect(checkbox.checked).toBe(true) }
    })
  })

  test('should uncheck all checkboxes', async () => {
    const { getByTestId, queryAllByTestId } = render(NewGroupChatList, {
      props: {
        robinUsers
      }
    })

    await fireEvent.click(getByTestId('select-all-button'))

    queryAllByTestId('checkbox').forEach((checkbox: any) => {
      if (checkbox.checked !== undefined) { expect(checkbox.checked).toBe(true) }
    })

    await fireEvent.click(getByTestId('select-all-button'))

    queryAllByTestId('checkbox').forEach((checkbox: any) => {
      if (checkbox.checked !== undefined) { expect(checkbox.checked).toBe(false) }
    })
  })
})
