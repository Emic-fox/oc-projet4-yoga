describe('Session detail spec', () => {
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

  const teacher = {
    id: 2,
    firstName: 'Hélène',
    lastName: 'THIERCELIN',
  }

  const buildSession = (overrides: Record<string, unknown> = {}) => ({
    id: 1,
    name: 'Yoga session',
    description: 'A relaxing yoga session',
    date: '2026-10-15T00:00:00.000Z',
    teacher_id: 2,
    users: [],
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

  const visitDetail = (session: ReturnType<typeof buildSession>) => {
    cy.intercept('GET', '/api/session/1', session).as('sessionDetail')
    cy.intercept('GET', '/api/teacher/2', teacher).as('teacher')

    cy.visit('/sessions/detail/1')

    cy.wait(['@sessionDetail', '@teacher'])
  }

  it('Displays the session name, teacher, description, date and attendees count', () => {
    login(user)
    visitDetail(buildSession({ users: [2, 3] }))

    cy.getByTestid('page-title').should('contain.text', 'Yoga Session')
    cy.getByTestid('teacher-name').should('contain.text', 'Hélène THIERCELIN')
    cy.getByTestid('session-description').should('contain.text', 'A relaxing yoga session')
    cy.getByTestid('attendees-count').should('contain.text', '2 attendees')
    cy.getByTestid('session-date').should('contain.text', 'October 15, 2026')
  })

  describe('As an admin', () => {
    beforeEach(() => {
      login(admin)
      visitDetail(buildSession())
    })

    it('Displays the delete button and not the participate buttons', () => {
      cy.getByTestid('delete-session-button').should('be.visible')
      cy.getByTestid('participate-button').should('not.exist')
      cy.getByTestid('unparticipate-button').should('not.exist')
    })

    it('Deletes the session and redirects to the session list', () => {
      cy.intercept('DELETE', '/api/session/1', {}).as('deleteSession')

      cy.getByTestid('delete-session-button').click()
      cy.wait('@deleteSession')

      cy.contains('Session deleted !').should('be.visible')
      cy.url().should('match', /\/sessions$/)
    })
  })

  describe('As a non-admin user who is not participating', () => {
    beforeEach(() => {
      login(user)
      visitDetail(buildSession({ users: [] }))
    })

    it('Displays the participate button and not the delete/unparticipate buttons', () => {
      cy.getByTestid('participate-button').should('be.visible')
      cy.getByTestid('delete-session-button').should('not.exist')
      cy.getByTestid('unparticipate-button').should('not.exist')
    })

    it('Participates in the session and refreshes the attendees count', () => {
      cy.intercept('POST', '/api/session/1/participate/2', {}).as('participate')
      cy.intercept('GET', '/api/session/1', buildSession({ users: [2] })).as('sessionDetailUpdated')

      cy.getByTestid('participate-button').click()
      cy.wait(['@participate', '@sessionDetailUpdated'])

      cy.getByTestid('unparticipate-button').should('be.visible')
      cy.getByTestid('participate-button').should('not.exist')
      cy.getByTestid('attendees-count').should('contain.text', '1 attendees')
    })
  })

  describe('As a non-admin user who is already participating', () => {
    beforeEach(() => {
      login(user)
      visitDetail(buildSession({ users: [2] }))
    })

    it('Displays the unparticipate button', () => {
      cy.getByTestid('unparticipate-button').should('be.visible')
      cy.getByTestid('participate-button').should('not.exist')
    })

    it('Unparticipates from the session and refreshes the attendees count', () => {
      cy.intercept('DELETE', '/api/session/1/participate/2', {}).as('unParticipate')
      cy.intercept('GET', '/api/session/1', buildSession({ users: [] })).as('sessionDetailUpdated')

      cy.getByTestid('unparticipate-button').click()
      cy.wait(['@unParticipate', '@sessionDetailUpdated'])

      cy.getByTestid('participate-button').should('be.visible')
      cy.getByTestid('unparticipate-button').should('not.exist')
      cy.getByTestid('attendees-count').should('contain.text', '0 attendees')
    })
  })
})
