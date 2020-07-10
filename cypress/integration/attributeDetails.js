describe('Attribute Details', () => {
  before(() => {
    cy.server();
    cy.route({
      method: 'GET',
      url: 'http://hapi.fhir.org/baseR4/StructureDefinition/Patient/$snapshot',
      response: 'fixture:attributeDetails/patientSnapshot.json',
    }).as('getSnapshot');
    cy.route({
      method: 'GET',
      url:
        'http://hapi.fhir.org/baseR4/Patient?_profile:below=http://fhir.kidsfirst.org/StructureDefinition/Patient',
      response: 'fixture:attributeDetails/allPatients.json',
    }).as('getAll');
    cy.visit('/resources/Patient/all');
    cy.wait(['@getSnapshot', '@getAll']);
  });

  it('loads the attribute details into a table', () => {
    cy.url().should('include', '/resources/Patient/all');
    cy.get('.sortable-table')
      .children('table')
      .children('tbody')
      .children('tr')
      .should($x => {
        expect($x).to.have.length(3);
      });
  });

  it('formats dates properly', () => {
    cy.get('.sortable-table')
      .children('table')
      .children('tbody')
      .children('tr')
      .each(($el, index, $list) => {
        if (index === 0) {
          cy.contains('Unknown');
        } else {
          cy.contains('March 3, 2020');
        }
      });
  });

  it('goes to an ID detail page on row click', () => {
    cy.get('.sortable-table')
      .children('table')
      .children('tbody')
      .children('tr')
      .eq(0)
      .click();

    cy.url().should('include', '/resources/Patient/id=123');
  });
});
