describe('Homepage', () => {
  before(() => {
    cy.server();
    cy.route({
      method: 'GET',
      url: 'https://damp-castle-44220.herokuapp.com/http://hapi.fhir.org/**',
      response: 'fixture:homepage/resources.json',
    }).as('getResources');
    cy.visit('/resources');
    cy.wait('@getResources');
  });

  beforeEach(() => {
    cy.get('.header__controls-view')
      .children('i')
      .get('.grid')
      .click();
    cy.get('.ui.card').should('exist');
    cy.get('.sortable-table').should('not.exist');
    cy.get('.prompt').clear();
  });

  it('loads resources', () => {
    cy.url().should('include', '/resources');
    cy.contains('8 total');
  });

  it('filters search results on input', () => {
    cy.get('.prompt').type('Pa');
    cy.get('.ui.search>.results .result').should($x => {
      expect($x).to.have.length(1);
    });
  });

  it('filters results on search', () => {
    cy.get('.ui.card').should($x => {
      expect($x).to.have.length(8);
    });
    cy.get('.prompt').type('Patient');
    cy.get('.ui.search>.results .result')
      .should($x => {
        expect($x).to.have.length(1);
      })
      .click();
    cy.get('.ui.card').should($x => {
      expect($x).to.have.length(1);
    });
  });

  it('selects the correct icons for various resource types', () => {
    cy.contains('Base type: Patient')
      .children('div')
      .should('have.class', 'content')
      .children('div')
      .should('have.class', 'description')
      .children('div')
      .should('have.id', 'homepage__card-description')
      .children('i')
      .should('have.class', 'user');
    cy.contains('Base type: Specimen')
      .children('div')
      .should('have.class', 'content')
      .children('div')
      .should('have.class', 'description')
      .children('div')
      .should('have.id', 'homepage__card-description')
      .children('i')
      .should('have.class', 'lab');
    cy.contains('Base type: Group')
      .children('div')
      .should('have.class', 'content')
      .children('div')
      .should('have.class', 'description')
      .children('div')
      .should('have.id', 'homepage__card-description')
      .children('i')
      .should('have.class', 'users');
    cy.contains('Base type: Condition')
      .children('div')
      .should('have.class', 'content')
      .children('div')
      .should('have.class', 'description')
      .children('div')
      .should('have.id', 'homepage__card-description')
      .children('i')
      .should('have.class', 'bug');
    cy.contains('Base type: Observation')
      .children('div')
      .should('have.class', 'content')
      .children('div')
      .should('have.class', 'description')
      .children('div')
      .should('have.id', 'homepage__card-description')
      .children('i')
      .should('have.class', 'eye');
    cy.contains('Base type: Practitioner')
      .children('div')
      .should('have.class', 'content')
      .children('div')
      .should('have.class', 'description')
      .children('div')
      .should('have.id', 'homepage__card-description')
      .children('i')
      .should('have.class', 'doctor');
    cy.contains('Base type: Encounter')
      .children('div')
      .should('have.class', 'content')
      .children('div')
      .should('have.class', 'description')
      .children('div')
      .should('have.id', 'homepage__card-description')
      .children('i')
      .should('have.class', 'clipboard');
  });

  it('toggles between grid and list views', () => {
    cy.get('.ui.card').should('exist');
    cy.get('.sortable-table').should('not.exist');
    cy.get('.header__controls-view')
      .children('i')
      .get('.list')
      .click();
    cy.get('.ui.card').should('not.exist');
    cy.get('.homepage')
      .children('div')
      .should('have.class', 'sortable-table');
  });

  it('selects a resource', () => {
    cy.get('.ui.card')
      .contains('TestEncounter')
      .click();
    cy.url().should(
      'eq',
      'http://localhost:3000/dashboard/resources/TestEncounter',
    );
  });
});
