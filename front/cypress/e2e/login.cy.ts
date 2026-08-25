describe('Login spec', () => {
  it('Login successfull', () => {
    cy.visit('/login')

    cy.intercept('POST', '/api/auth/login', {
      body: {
        id: 1,
        username: 'userName',
        firstName: 'firstName',
        lastName: 'lastName',
        admin: true
      },
    })

    cy.intercept(
      {
        method: 'GET',
        url: '/api/session',
      },
      []
    ).as('session')

    cy.getByTestid('email-input').type("yoga@studio.com")
    cy.getByTestid('password-input').type(`${"test!1234"}{enter}{enter}`)

    cy.wait('@session')
    cy.url().should('include', '/sessions')
  })
});