describe('Ontologies', () => {
  before(() => {
    cy.server();
    cy.route({
      method: 'GET',
      url:
        'https://damp-castle-44220.herokuapp.com/http://hapi.fhir.org/baseR4/CodeSystem',
      response: 'fixture:ontologies/ontologies.json',
    }).as('getOntologies');

    cy.visit('/ontologies');
    cy.wait('@getOntologies');
  });

  it('loads ontologies', () => {
    cy.url().should('include', '/ontologies');
    cy.contains('3 total');
  });

  it('filters results on input', () => {
    cy.get('.prompt').type('Code');
    cy.get('.ui.search>.results .result').should($x => {
      expect($x).to.have.length(3);
    });
  });

  it('filters results on select', () => {
    cy.get('.prompt').clear();
    cy.get('tr').should($x => {
      expect($x).to.have.length(4);
    });
    cy.get('.prompt').type('Code');
    cy.get('.ui.search>.results .result')
      .should($x => {
        expect($x).to.have.length(3);
      })
      .contains('Code1')
      .click();
    cy.get('tr').should($x => {
      expect($x).to.have.length(2);
    });
  });

  it('selects an ontology', () => {
    cy.get('tr')
      .contains('Code1')
      .click();
    cy.url().should('eq', 'http://localhost:3000/dashboard/ontologies/Code1');
  });
});
