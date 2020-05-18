describe('Homepage', () => {
  before(() => {
    cy.server();
    cy.route({
      method: 'GET',
      url:
        'https://damp-castle-44220.herokuapp.com/http://hapi.fhir.org/baseR4/StructureDefinition/**',
      response: {type: 'Patient'},
    }).as('getStructureDefinition');
    cy.route({
      method: 'GET',
      url:
        'https://damp-castle-44220.herokuapp.com/http://hapi.fhir.org/baseR4/Patient/123',
      response: 'fixture:resourceDetails.json',
    }).as('getResource');
    cy.route({
      method: 'GET',
      url:
        'https://damp-castle-44220.herokuapp.com/http://hapi.fhir.org/baseR4/metadata',
      response: 'fixture:capabilityStatementReferences.json',
    }).as('getCapabilityStatementReferences');
    cy.route({
      method: 'GET',
      url:
        'https://damp-castle-44220.herokuapp.com/http://hapi.fhir.org/baseR4/Condition?subject=Patient/123',
      response: {name: 'Condition'},
    }).as('getReferences');
    cy.visit('/resources/Patient/id=123');
    cy.wait(['@getStructureDefinition', '@getResource']);
  });

  it('loads the resource details', () => {
    cy.url().should('include', '/resources/Patient/id=123');
  });

  it('loads resource references', () => {
    cy.contains('References').click();
  });
});
