describe('Session form spec', () => {
  const admin = {
    id: 1,
    username: 'admin',
    firstName: 'Admin',
    lastName: 'Admin',
    admin: true,
  }

  const teachers = [
    { id: 1, firstName: 'Margot', lastName: 'DELAHAYE' },
    { id: 2, firstName: 'Hélène', lastName: 'THIERCELIN' },
  ]

  const existingSession = {
    id: 1,
    name: 'Existing session',
    description: 'An existing session description',
    date: '2026-08-25T19:30:15.000Z',
    teacher_id: 2,
    users: [],
  }

  const fillValidForm = () => {
    cy.getByTestid('name-input').type('Yoga session')
    cy.getByTestid('date-input').type('2026-10-15')
    cy.getByTestid('teacher-select').click()
    cy.get('mat-option').contains('Margot DELAHAYE').click()
    cy.getByTestid('description-textarea').type('A great yoga session')
  }

  // Connexion en tant qu'admin avant chaque test
  beforeEach(() => {
    cy.intercept('POST', '/api/auth/login', { body: admin })
    cy.intercept('GET', '/api/teacher', teachers).as('teachers')
    cy.intercept('GET', '/api/session', [existingSession]).as('sessions')

    cy.visit('/login')
    cy.getByTestid('email-input').type('yoga@studio.com')
    cy.getByTestid('password-input').type('test!1234{enter}')

    cy.wait('@sessions')
  })

  describe('Create session', () => {
    // Chargement de la page de création et attente du chargement des teachers
    beforeEach(() => {
      cy.getByTestid('create-session-button').click()
      cy.wait('@teachers')
      cy.url().should('include', '/sessions/create')
    })

    it('Create session successfull', () => {
      cy.intercept('POST', '/api/session', {
        statusCode: 200,
        body: { ...existingSession, id: 2 },
      }).as('createSession')

      fillValidForm()
      cy.getByTestid('submit-button').click()

      cy.wait('@createSession').its('request.body').should('deep.include', {
        name: 'Yoga session',
        teacher_id: 1,
        description: 'A great yoga session',
      })
      cy.url().should('include', '/sessions').and('not.include', 'create')
      cy.contains('Session created !').should('be.visible')
    })
  })

  describe('Update session', () => {
    // Chargement de la page d'édition de la session existante et attente du chargement des teachers
    beforeEach(() => {
      cy.intercept('GET', '/api/session/1', existingSession).as('sessionDetail')

      cy.getByTestid('edit-session-button').click()
      cy.wait(['@sessionDetail', '@teachers'])
      cy.url().should('include', '/sessions/update/1')
    })

    it('Prefills the form with the session data', () => {
      cy.getByTestid('name-input').should('have.value', existingSession.name)
      cy.getByTestid('date-input').should('have.value', '2026-08-25')
      cy.getByTestid('description-textarea').should('have.value', existingSession.description)
    })

    it('Update session successfull', () => {
      cy.intercept('PUT', '/api/session/1', {
        statusCode: 200,
        body: existingSession,
      }).as('updateSession')

      cy.getByTestid('name-input').clear().type('Updated session name')
      cy.getByTestid('submit-button').click()

      cy.wait('@updateSession').its('request.body').should('deep.include', {
        name: 'Updated session name',
        teacher_id: existingSession.teacher_id,
      })
      cy.url().should('include', '/sessions').and('not.include', 'update')
      cy.contains('Session updated !').should('be.visible')
    })
  })

  describe('Form validation', () => {
    beforeEach(() => {
      cy.getByTestid('create-session-button').click()
      cy.wait('@teachers')
      cy.url().should('include', '/sessions/create')
      
      cy.intercept('POST', '/api/session').as('createAttempt')
    })

    const assertFormCannotBeSubmitted = () => {
      cy.getByTestid('submit-button').should('be.disabled')
      cy.getByTestid('name-input').type('{enter}')
      cy.get('@createAttempt.all').should('have.length', 0)
    }

    it('Form can be submitted when all fields are valid', () => {
      fillValidForm()

      cy.getByTestid('submit-button').should('be.enabled')
      cy.getByTestid('name-input').should('have.class', 'ng-valid')
      cy.getByTestid('date-input').should('have.class', 'ng-valid')
      cy.getByTestid('teacher-select').should('have.class', 'ng-valid')
      cy.getByTestid('description-textarea').should('have.class', 'ng-valid')
    })

    describe('Name', () => {
      it("Form can't be submitted when name is missing", () => {
        fillValidForm()
        cy.getByTestid('name-input').clear()

        assertFormCannotBeSubmitted()
        cy.getByTestid('name-input').should('have.class', 'ng-invalid')
      })
    })

    describe('Date', () => {
      it("Form can't be submitted when date is missing", () => {
        fillValidForm()
        cy.getByTestid('date-input').clear()

        assertFormCannotBeSubmitted()
        cy.getByTestid('date-input').should('have.class', 'ng-invalid')
      })
    })

    describe('Teacher', () => {
      it("Form can't be submitted when teacher is missing", () => {
        cy.getByTestid('name-input').type('Yoga session')
        cy.getByTestid('date-input').type('2026-10-15')
        cy.getByTestid('description-textarea').type('A great yoga session')

        assertFormCannotBeSubmitted()
        cy.getByTestid('teacher-select').should('have.class', 'ng-invalid')
      })
    })

    describe('Description', () => {
      it("Form can't be submitted when description is missing", () => {
        fillValidForm()
        cy.getByTestid('description-textarea').clear()

        assertFormCannotBeSubmitted()
        cy.getByTestid('description-textarea').should('have.class', 'ng-invalid')
      })

      it("Form can't be submitted when description is too long", () => {
        fillValidForm()
        cy.getByTestid('description-textarea')
          .clear()
          .invoke('val', 'a'.repeat(2001))
          .trigger('input')

        assertFormCannotBeSubmitted()
        cy.getByTestid('description-textarea').should('have.class', 'ng-invalid')
      })
    })
  })
})
