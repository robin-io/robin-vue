describe('MessageContainer component', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/')
  })

  it('should load more messages on scroll to top', () => {
    let senderLength = 0
    let receiverLength = 0
    let prevMessagesLength = 0
    let newMessagesLength = 0

    cy.findByTestId('conversation-0').click()

    cy.get('[data-testid=message]').then((element) => {
      if (element.find('.robin-message-sender').length) {
        senderLength = element.find('.robin-message-sender').length
      }
      if (element.find('.robin-message-receiver').length) {
        receiverLength = element.find('.robin-message-receiver').length
      }

      prevMessagesLength = senderLength + receiverLength
    })

    cy.findByTestId('message').scrollTo(0, 0)
    cy.wait(2000)
    cy.findByTestId('message').scrollTo(0, 200)
    cy.wait(2000)
    cy.findByTestId('message').scrollTo(0, 0)
    cy.wait(2000)

    cy.get('[data-testid=message]').then((element) => {
      if (element.find('.robin-message-sender').length) {
        senderLength = element.find('.robin-message-sender').length
      }
      if (element.find('.robin-message-receiver').length) {
        receiverLength = element.find('.robin-message-receiver').length
      }

      newMessagesLength = senderLength + receiverLength

      cy.wrap(newMessagesLength).should('be.gte', prevMessagesLength)
    })
  })

  it('should scroll to bottom on scroll-to-bottom-button click', () => {
    cy.findByTestId('conversation-0').click()

    cy.findByTestId('message').scrollTo(0, 200)
    cy.wait(2000)
    cy.findByTestId('message').scrollTo(0, 120)
    cy.wait(2000)

    cy.get('[data-testid=message]').then((element) => {
      if (element.find('[data-testid=scroll-bottom-button]').length) {
        element.find('[data-testid=scroll-bottom-button]').click()
      }
    })
  })
})
