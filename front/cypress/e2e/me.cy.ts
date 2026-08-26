describe('Me spec', () => {
  const admin = {
    id: 1,
    username: 'admin',
    firstName: 'Admin',
    lastName: 'Admin',
    admin: true,
  }

  const user = {
    id: 2,
    username: 'user',
    firstName: 'User',
    lastName: 'User',
    admin: false,
  }

  const buildUserDetail = (overrides: Record<string, unknown> = {}) => ({
    id: 2,
    email: 'yoga@studio.com',
    firstName: 'User',
    lastName: 'User',
    admin: false,
    password: 'test!1234',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
    ...overrides,
  })

  const login = (account: typeof admin | typeof user) => {
    cy.session(account.username, () => {
      cy.intercept('POST', '/api/auth/login', { body: account })
      cy.intercept('GET', '/api/session', []).as('sessions')

      cy.visit('/login')
      cy.getByTestid('email-input').type('yoga@studio.com')
      cy.getByTestid('password-input').type('test!1234{enter}')

      cy.wait('@sessions')
    })
  }

  const visitMe = (userDetail: ReturnType<typeof buildUserDetail>) => {
    cy.intercept('GET', `/api/user/${userDetail.id}`, userDetail).as('userDetail')

    cy.visit('/sessions')
    cy.getByTestid('account-link').click()

    cy.wait('@userDetail')
  }

  it('Displays the user name, email and creation date', () => {
    login(user)
    visitMe(buildUserDetail())

    cy.getByTestid('user-name').should('contain.text', 'Name: User USER')
    cy.getByTestid('user-email').should('contain.text', 'Email: yoga@studio.com')
    cy.getByTestid('created-at').should('contain.text', 'January 1, 2026')
    cy.getByTestid('updated-at').should('contain.text', 'January 2, 2026')
  })

  describe('As an admin', () => {
    beforeEach(() => {
      login(admin)
      visitMe(buildUserDetail({ id: 1, admin: true, firstName: 'Admin', lastName: 'Admin' }))
    })

    it('Displays the admin message and not the delete button', () => {
      cy.getByTestid('admin-message').should('be.visible').and('contain.text', 'You are admin')
      cy.getByTestid('delete-account-button').should('not.exist')
    })
  })

  describe('As a non-admin user', () => {
    beforeEach(() => {
      login(user)
      visitMe(buildUserDetail())
    })

    it('Displays the delete button and not the admin message', () => {
      cy.getByTestid('delete-account-button').should('be.visible')
      cy.getByTestid('admin-message').should('not.exist')
    })

    it('Deletes the account, logs out and redirects to login', () => {
      cy.intercept('DELETE', '/api/user/2', {}).as('deleteAccount')

      cy.getByTestid('delete-account-button').click()
      cy.wait('@deleteAccount')

      cy.contains('Your account has been deleted !').should('be.visible')
      cy.url().should('match', /\/login$/)
    })
  })

  it('Navigates back to the sessions list with the back button', () => {
    login(user)
    visitMe(buildUserDetail())

    cy.getByTestid('back-button').click()
    cy.url().should('match', /\/sessions$/)
  })
})
