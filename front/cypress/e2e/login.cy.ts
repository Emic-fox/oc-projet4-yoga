describe('Login spec', () => {
  beforeEach(() => {
    cy.visit('/login')
  })

  describe("Form submit", () => {
    it('Login successfull (with "enter" for submit)', () => {
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
      cy.getByTestid('password-input').type(`${"test!1234"}{enter}`)
  
      cy.wait('@session')
      cy.url().should('include', '/sessions')
    })

    it('Login failed with invalid credentials (with click on submit button)', () => {
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 401,
        body: { message: 'Bad credentials' },
      }).as('loginFailed')
  
      cy.getByTestid('email-input').type("yoga@studio.com")
      cy.getByTestid('password-input').type("wrongPassword")
      cy.getByTestid('submit-button').click()
  
      cy.wait('@loginFailed')
      cy.getByTestid('login-error-message').should('be.visible').and('contain.text', 'An error occurred')
      cy.url().should('include', '/login')
    })
  })

  describe('Form validation', () => {
    beforeEach(() => {
      cy.intercept('POST', '/api/auth/login').as('loginAttempt')
    })

    it("Form can't be submitted when email is missing", () => {
      cy.getByTestid('password-input').type('test!1234')

      cy.getByTestid('submit-button').should('be.disabled')

      cy.getByTestid('password-input').type('{enter}')

      cy.get('@loginAttempt.all').should('have.length', 0)
      cy.getByTestid('email-input').should('have.class', 'ng-invalid')
      cy.getByTestid('password-input').should('have.class', 'ng-valid')
    })

    it("Form can't be submitted when password is missing", () => {
      cy.getByTestid('email-input').type('yoga@studio.com')

      cy.getByTestid('submit-button').should('be.disabled')

      cy.getByTestid('email-input').type('{enter}')

      cy.get('@loginAttempt.all').should('have.length', 0)
      cy.getByTestid('password-input').should('have.class', 'ng-invalid')
      cy.getByTestid('email-input').should('have.class', 'ng-valid')
    })

    it("Form can't be submitted when email is invalid", () => {
      cy.getByTestid('email-input').type('not-an-email')
      cy.getByTestid('password-input').type('test!1234')

      cy.getByTestid('submit-button').should('be.disabled')

      cy.getByTestid('password-input').type('{enter}')

      cy.get('@loginAttempt.all').should('have.length', 0)
      cy.getByTestid('email-input').should('have.class', 'ng-invalid')
      cy.getByTestid('password-input').should('have.class', 'ng-valid')
    })
  })
});