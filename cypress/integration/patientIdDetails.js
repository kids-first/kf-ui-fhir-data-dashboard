describe('Resource ID Details page - Patient resources', () => {
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
      response: 'fixture:resourceIdDetails/patientResourceDetails.json',
    }).as('getResource');
    cy.visit('/resources/Patient/id=123');
    cy.wait(['@getStructureDefinition', '@getResource']);
  });

  it('loads the resource details', () => {
    cy.url().should('include', '/resources/Patient/id=123');
    cy.contains('Payload');
  });

  it('loads timeline', () => {
    cy.server();
    cy.route({
      method: 'GET',
      url:
        'https://damp-castle-44220.herokuapp.com/http://hapi.fhir.org/baseR4/metadata',
      response: 'fixture:resourceIdDetails/capabilityStatementReferences.json',
    }).as('getCapabilityStatementReferences');
    cy.route({
      method: 'GET',
      url:
        'https://damp-castle-44220.herokuapp.com/http://hapi.fhir.org/baseR4/Condition?patient=Patient/123',
      response: 'fixture:resourceIdDetails/conditionDetails.json',
    }).as('getConditionDetails');
    cy.route({
      method: 'GET',
      url:
        'https://damp-castle-44220.herokuapp.com/http://hapi.fhir.org/baseR4/StructureDefinition?url=http://fhir.kids-first.io/StructureDefinition/Condition',
      response: 'fixture:resourceIdDetails/conditionStructureDefinition.json',
    }).as('getConditionSD');
    cy.route({
      method: 'GET',
      url:
        'https://damp-castle-44220.herokuapp.com/http://hapi.fhir.org/baseR4/Observation?patient=Patient/123',
      response: 'fixture:resourceIdDetails/observationDetails.json',
    }).as('getObservationDetails');
    cy.route({
      method: 'GET',
      url:
        'https://damp-castle-44220.herokuapp.com/http://hapi.fhir.org/baseR4/StructureDefinition?url=http://fhir.kids-first.io/StructureDefinition/Observation',
      response: 'fixture:resourceIdDetails/observationStructureDefinition.json',
    }).as('getObservationSD');
    cy.contains('Timeline').click();
    cy.wait([
      '@getCapabilityStatementReferences',
      '@getConditionDetails',
      '@getConditionSD',
      '@getObservationDetails',
      '@getObservationSD',
    ]);
    cy.contains('Observation');
    cy.contains('Condition');
  });
});
