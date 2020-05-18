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
    cy.contains('Payload');
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
      response: 'fixture:conditionDetails.json',
    }).as('getConditionDetails');
    cy.route({
      method: 'GET',
      url:
        'https://damp-castle-44220.herokuapp.com/http://hapi.fhir.org/baseR4/StructureDefinition?url=http://fhir.kids-first.io/StructureDefinition/Condition',
      response: 'fixture:conditionStructureDefinition.json',
    }).as('getConditionSD');
    cy.route({
      method: 'GET',
      url:
        'https://damp-castle-44220.herokuapp.com/http://hapi.fhir.org/baseR4/Observation?patient=Patient/123',
      response: 'fixture:observationDetails.json',
    }).as('getObservationDetails');
    cy.route({
      method: 'GET',
      url:
        'https://damp-castle-44220.herokuapp.com/http://hapi.fhir.org/baseR4/StructureDefinition?url=http://fhir.kids-first.io/StructureDefinition/Observation',
      response: 'fixture:observationStructureDefinition.json',
    }).as('getObservationSD');
    cy.contains('References').click();
    cy.wait([
      '@getCapabilityStatementReferences',
      '@getConditionDetails',
      '@getConditionSD',
      '@getObservationSD',
    ]);
    cy.get('.sortable-table')
      .eq(0)
      .children('table')
      .children('tbody')
      .children('tr')
      .should($x => {
        expect($x).to.have.length(2);
      })
      .eq(0)
      .click();
    cy.get('.sortable-table')
      .eq(0)
      .children('table')
      .children('tbody')
      .children('tr')
      .should($x => {
        expect($x).to.have.length(4);
      });
    cy.get('.sortable-table')
      .eq(1)
      .children('table')
      .children('tbody')
      .children('tr')
      .should($x => {
        expect($x).to.have.length(0);
      });

    // reset table so all rows are closed
    cy.get('.sortable-table')
      .eq(0)
      .children('table')
      .children('tbody')
      .children('tr')
      .eq(0)
      .click();
  });

  it('sorts the rows', () => {
    cy.get('.sortable-table')
      .eq(0)
      .children('table')
      .children('tbody')
      .children('tr')
      .eq(0)
      .contains('Condition');
    cy.get('.sortable-table')
      .eq(0)
      .children('table')
      .children('tbody')
      .children('tr')
      .eq(1)
      .contains('Observation');

    cy.get('th')
      .eq(0)
      .click();

    cy.get('.sortable-table')
      .eq(0)
      .children('table')
      .children('tbody')
      .children('tr')
      .eq(0)
      .contains('Observation');
    cy.get('.sortable-table')
      .eq(0)
      .children('table')
      .children('tbody')
      .children('tr')
      .eq(1)
      .contains('Condition');
  });

  it('redirects to a reference detail page', () => {
    cy.get('.sortable-table')
      .eq(0)
      .children('table')
      .children('tbody')
      .children('tr')
      .eq(0)
      .click();
    cy.get('.sortable-table')
      .eq(0)
      .children('table')
      .children('tbody')
      .children('tr')
      .eq(1)
      .click();

    cy.url().should('include', '/resources/TestObservation/id=321');
  });
});
