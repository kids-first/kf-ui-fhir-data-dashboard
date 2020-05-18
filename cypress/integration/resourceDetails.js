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
    cy.visit('/resources/Patient/id=123');
    cy.wait(['@getStructureDefinition', '@getResource']);
  });

  it('loads the resource details', () => {
    cy.url().should('include', '/resources/Patient/id=123');
  });

  it('loads resource references', () => {
    cy.server();
    cy.route({
      method: 'GET',
      url:
        'https://damp-castle-44220.herokuapp.com/http://hapi.fhir.org/baseR4/metadata',
      response: 'fixture:capabilityStatementReferences.json',
    }).as('getCapabilityStatementReferences');
    cy.route({
      method: 'GET',
      url:
        'https://damp-castle-44220.herokuapp.com/http://hapi.fhir.org/baseR4/Condition?patient=Patient/123',
      response: 'fixture:referenceDetails.json',
    }).as('getReferenceDetails');
    cy.route({
      method: 'GET',
      url:
        'https://damp-castle-44220.herokuapp.com/http://hapi.fhir.org/baseR4/StructureDefinition?url=http://fhir.kids-first.io/StructureDefinition/Condition',
      response: 'fixture:referenceStructureDefinition.json',
    }).as('getReferenceSD');
    cy.contains('References').click();
    cy.wait([
      '@getCapabilityStatementReferences',
      '@getReferenceDetails',
      '@getReferenceSD',
    ]);
    cy.contains('Resources that reference')
      .get('.sortable-table')
      .eq(0)
      .children('table')
      .children('tbody')
      .children('tr')
      .should($x => {
        expect($x).to.have.length(1);
      });
    cy.contains('Resources referenced by')
      .get('.sortable-table')
      .eq(1)
      .children('table')
      .children('tbody')
      .children('tr')
      .should($x => {
        expect($x).to.have.length(0);
      });
  });
});
