describe('Resource ID Details page', () => {
  before(() => {
    cy.server();
    cy.route({
      method: 'GET',
      url: 'http://hapi.fhir.org/baseR4/StructureDefinition/**',
      response: {type: 'Observation'},
    }).as('getStructureDefinition');
    cy.route({
      method: 'GET',
      url: 'http://hapi.fhir.org/baseR4/Observation/123',
      response: 'fixture:resourceIdDetails/resourceDetails.json',
    }).as('getResource');
    cy.route({
      method: 'GET',
      url: 'http://hapi.fhir.org/baseR4/metadata',
      response: 'fixture:resourceIdDetails/capabilityStatementReferences.json',
    }).as('getCapabilityStatementReferences');
    cy.route({
      method: 'GET',
      url: 'http://hapi.fhir.org/baseR4/Patient?observation=Observation/123',
      response: 'fixture:resourceIdDetails/patientDetails.json',
    }).as('getPatientDetails');
    cy.route({
      method: 'GET',
      url:
        'http://hapi.fhir.org/baseR4/StructureDefinition?url=http://fhir.kids-first.io/StructureDefinition/Patient',
      response: 'fixture:resourceIdDetails/patientStructureDefinition.json',
    }).as('getPatientSD');
    cy.route({
      method: 'GET',
      url: 'http://hapi.fhir.org/baseR4/Condition?observation=Observation/123',
      response: 'fixture:resourceIdDetails/conditionDetails.json',
    }).as('getConditionDetails');
    cy.route({
      method: 'GET',
      url:
        'http://hapi.fhir.org/baseR4/StructureDefinition?url=http://fhir.kids-first.io/StructureDefinition/Condition',
      response: 'fixture:resourceIdDetails/conditionStructureDefinition.json',
    }).as('getConditionSD');
    cy.visit('/resources/Observation/id=123');
    cy.wait([
      '@getStructureDefinition',
      '@getResource',
      '@getCapabilityStatementReferences',
      '@getPatientDetails',
      '@getPatientSD',
      '@getConditionDetails',
      '@getConditionSD',
    ]);
  });

  it('loads the resource details', () => {
    cy.url().should('include', '/resources/Observation/id=123');
    cy.contains('Payload');
  });

  it('loads resource references', () => {
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
        expect($x).to.have.length(3);
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

    cy.get('th')
      .eq(0)
      .click();

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

    cy.url().should('include', '/resources/Patient/id=456');
  });
});
