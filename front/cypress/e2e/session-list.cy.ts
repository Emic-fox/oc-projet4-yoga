describe('Session list spec', () => {
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

  const sessions = [
    {
      id: 1,
      name: 'Yoga session',
      description: 'A relaxing yoga session',
      date: '2026-10-15T00:00:00.000Z',
      teacher_id: 1,
      users: [],
    },
    {
      id: 2,
      name: 'Cardio session',
      description: 'An intense cardio session',
      date: '2026-11-20T00:00:00.000Z',
      teacher_id: 2,
      users: [],
    },
  ]

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

  const visitSessions = (overridesessions: typeof sessions = sessions) => {
    cy.intercept('GET', '/api/session', overridesessions).as('sessions')

    cy.visit('/sessions')

    cy.wait('@sessions')
  }

  const navigatesToSessionDetail = () => {
    it('Navigates to the detail page of the selected session', () => {
      cy.intercept('GET', '/api/session/2', sessions[1]).as('sessionDetail')
      cy.intercept('GET', '/api/teacher/2', { id: 2, firstName: 'Hélène', lastName: 'THIERCELIN' }).as('teacher')

      cy.getByTestid('detail-session-button').eq(1).click()
      cy.wait(['@sessionDetail', '@teacher'])

      cy.url().should('include', '/sessions/detail/2')
    })
  }

  it('Displays every session with its name, date and description', () => {
    login(user)
    visitSessions()

    cy.getByTestid('session-card').should('have.length', sessions.length)

    cy.getByTestid('session-card').eq(0).within(() => {
      cy.getByTestid('session-name').should('contain.text', 'Yoga session')
      cy.contains('October 15, 2026').should('be.visible')
      cy.getByTestid('session-description').should('contain.text', 'A relaxing yoga session')
    })

    cy.getByTestid('session-card').eq(1).within(() => {
      cy.getByTestid('session-name').should('contain.text', 'Cardio session')
      cy.contains('November 20, 2026').should('be.visible')
      cy.getByTestid('session-description').should('contain.text', 'An intense cardio session')
    })
  })

  it('Displays an empty list when there are no sessions', () => {
    login(user)
    visitSessions([])

    cy.getByTestid('session-card').should('have.length', 0)
  })

  describe('As an admin', () => {
    beforeEach(() => {
      login(admin)
      visitSessions()
    })

    it('Displays the create button and an detail/edit buttons on each session', () => {
      cy.getByTestid('create-session-button').should('be.visible')
      cy.getByTestid('detail-session-button').should('have.length', sessions.length)
      cy.getByTestid('edit-session-button').should('have.length', sessions.length)
    })

    it('Navigates to the create session page', () => {
      const teachers = [
        { id: 1, firstName: 'Margot', lastName: 'DELAHAYE' },
        { id: 2, firstName: 'Hélène', lastName: 'THIERCELIN' },
      ]
      cy.intercept('GET', '/api/teacher', teachers).as('teachers')

      cy.getByTestid('create-session-button').click()
      cy.wait('@teachers')

      cy.url().should('include', '/sessions/create')
    })

    it('Navigates to the update session page', () => {
      const teachers = [
        { id: 1, firstName: 'Margot', lastName: 'DELAHAYE' },
        { id: 2, firstName: 'Hélène', lastName: 'THIERCELIN' },
      ]
      cy.intercept('GET', '/api/teacher', teachers).as('teachers')
      cy.intercept('GET', '/api/session/1', sessions[0]).as('sessionDetail')

      cy.getByTestid('edit-session-button').eq(0).click()
      cy.wait(['@sessionDetail', '@teachers'])

      cy.url().should('include', '/sessions/update/1')
    })

    navigatesToSessionDetail()
  })

  describe('As a non-admin user', () => {
    beforeEach(() => {
      login(user)
      visitSessions()
    })

    it('Does not display the create button nor the edit buttons', () => {
      cy.getByTestid('create-session-button').should('not.exist')
      cy.getByTestid('edit-session-button').should('not.exist')
    })

    it('Still displays the detail button on each session', () => {
      cy.getByTestid('detail-session-button').should('have.length', sessions.length)
    })

    navigatesToSessionDetail()
  })
})
