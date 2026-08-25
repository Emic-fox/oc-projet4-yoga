describe('Register spec', () => {
  beforeEach(() => {
    cy.visit('/register')
  })

  describe("Form submit", () => {
    it('Register successfull (with "enter" for submit)', () => {
      cy.intercept('POST', '/api/auth/register', {
        statusCode: 200,
        body: {},
      }).as('registerSuccess')

      cy.getByTestid('first-name-input').type('firstName')
      cy.getByTestid('last-name-input').type('lastName')
      cy.getByTestid('email-input').type('yoga@studio.com')
      cy.getByTestid('password-input').type(`${"test!1234"}{enter}`)

      cy.wait('@registerSuccess')
      cy.url().should('include', '/login')
    })

    it('Register failed (with click on submit button)', () => {
      cy.intercept('POST', '/api/auth/register', {
        statusCode: 400,
        body: { message: 'Error: Email is already taken!' },
      }).as('registerFailed')

      cy.getByTestid('first-name-input').type('firstName')
      cy.getByTestid('last-name-input').type('lastName')
      cy.getByTestid('email-input').type('yoga@studio.com')
      cy.getByTestid('password-input').type('test!1234')
      cy.getByTestid('submit-button').click()

      cy.wait('@registerFailed')
      cy.getByTestid('register-error-message').should('be.visible').and('contain.text', 'An error occurred')
      cy.url().should('include', '/register')
    })
  })

  describe('Form validation', () => {
    beforeEach(() => {
      cy.intercept('POST', '/api/auth/register').as('registerAttempt')
    })

    const fillValidForm = () => {
      cy.getByTestid('first-name-input').type('firstName')
      cy.getByTestid('last-name-input').type('lastName')
      cy.getByTestid('email-input').type('yoga@studio.com')
      cy.getByTestid('password-input').type('test!1234')
    }

    const assertFormCannotBeSubmitted = () => {
      cy.getByTestid('submit-button').should('be.disabled')
      cy.getByTestid('first-name-input').type('{enter}')
      cy.get('@registerAttempt.all').should('have.length', 0)
    }

    it('Form can be submitted when all fields are valid', () => {
      fillValidForm()

      cy.getByTestid('submit-button').should('be.enabled')
      cy.getByTestid('first-name-input').should('have.class', 'ng-valid')
      cy.getByTestid('last-name-input').should('have.class', 'ng-valid')
      cy.getByTestid('email-input').should('have.class', 'ng-valid')
      cy.getByTestid('password-input').should('have.class', 'ng-valid')
    })

    describe('First name', () => {
      it("Form can't be submitted when first name is missing", () => {
        fillValidForm();
        cy.getByTestid('first-name-input').clear()
  
        assertFormCannotBeSubmitted()
        cy.getByTestid('first-name-input').should('have.class', 'ng-invalid')
      })
  
      it("Form can't be submitted when first name is too short", () => {
        fillValidForm()
        cy.getByTestid('first-name-input').clear().type('ab')
  
        assertFormCannotBeSubmitted()
        cy.getByTestid('first-name-input').should('have.class', 'ng-invalid')
      })
  
      it("Form can't be submitted when first name is too long", () => {
        fillValidForm()
        cy.getByTestid('first-name-input').clear().type('a'.repeat(21))
  
        assertFormCannotBeSubmitted()
        cy.getByTestid('first-name-input').should('have.class', 'ng-invalid')
      })
    })

    describe("Last name", () => {
      it("Form can't be submitted when last name is missing", () => {
        fillValidForm()
        cy.getByTestid('last-name-input').clear()
  
        assertFormCannotBeSubmitted()
        cy.getByTestid('last-name-input').should('have.class', 'ng-invalid')
      })
  
      it("Form can't be submitted when last name is too short", () => {
        fillValidForm()
        cy.getByTestid('last-name-input').clear().type('ab')
  
        assertFormCannotBeSubmitted()
        cy.getByTestid('last-name-input').should('have.class', 'ng-invalid')
      })
  
      it("Form can't be submitted when last name is too long", () => {
        fillValidForm()
        cy.getByTestid('last-name-input').clear().type('a'.repeat(21))
  
        assertFormCannotBeSubmitted()
        cy.getByTestid('last-name-input').should('have.class', 'ng-invalid')
      })
    })

    describe("Email", () => {
      it("Form can't be submitted when email is missing", () => {
        fillValidForm()
        cy.getByTestid('email-input').clear()
  
        assertFormCannotBeSubmitted()
        cy.getByTestid('email-input').should('have.class', 'ng-invalid')
      })
  
      it("Form can't be submitted when email is invalid", () => {
        fillValidForm()
        cy.getByTestid('email-input').clear().type('not-an-email')
  
        assertFormCannotBeSubmitted()
        cy.getByTestid('email-input').should('have.class', 'ng-invalid')
      })
    })

    describe('Password', () => {
      it("Form can't be submitted when password is missing", () => {
        fillValidForm()
        cy.getByTestid('password-input').clear()

        assertFormCannotBeSubmitted()
        cy.getByTestid('password-input').should('have.class', 'ng-invalid')
      })
  
      it("Form can't be submitted when password is too short", () => {
        fillValidForm()
        cy.getByTestid('password-input').clear().type('ab')
  
        assertFormCannotBeSubmitted()
        cy.getByTestid('password-input').should('have.class', 'ng-invalid')
      })
  
      it("Form can't be submitted when password is too long", () => {
        fillValidForm()
        cy.getByTestid('password-input').clear().type('a'.repeat(41))
  
        assertFormCannotBeSubmitted()
        cy.getByTestid('password-input').should('have.class', 'ng-invalid')
      })
    })
  })
});
