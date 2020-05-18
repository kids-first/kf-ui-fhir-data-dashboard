describe('Resource Details', () => {
  before(() => {
    cy.server();
    cy.route({
      method: 'GET',
      url:
        'https://damp-castle-44220.herokuapp.com/http://hapi.fhir.org/baseR4/StructureDefinition/TestPatient/$snapshot',
      response: 'fixture:resourceDetails/patientSnapshot.json',
    }).as('getPatientDetails');
    cy.route({
      method: 'GET',
      url:
        'https://damp-castle-44220.herokuapp.com/http://hapi.fhir.org/baseR4/SearchParameter?base=Patient',
      response: 'fixture:resourceDetails/patientSearchParams.json',
    }).as('getPatientSearchParams');
    cy.route({
      method: 'GET',
      url:
        'https://damp-castle-44220.herokuapp.com/http://hapi.fhir.org/baseR4/metadata',
      response: 'fixture:resourceDetails/capabilityStatement.json',
    }).as('getCapabilityStatement');
    cy.route({
      method: 'GET',
      url:
        'https://damp-castle-44220.herokuapp.com/http://hapi.fhir.org/baseR4/Patient?_profile:below=http://fhir.kidsfirst.org/StructureDefinition/Patient&**',
      response: 'fixture:resourceDetails/resourceCount.json',
    }).as('getResourceCounts');
    cy.visit('/resources/TestPatient');
    cy.wait([
      '@getPatientDetails',
      '@getPatientSearchParams',
      '@getCapabilityStatement',
      '@getResourceCounts',
    ]);
  });

  it('loads the resource details', () => {
    cy.get('.resource-details__count-section')
      .children('div')
      .should('have.class', 'resource-details__count card')
      .should($x => {
        expect($x).to.have.length(4);
      })
      .each(x => {
        cy.get(x)
          .children('p')
          .contains('10');
      });
  });

  it('shows attribute details on click', () => {
    cy.get('.resource-details__count')
      .eq(0)
      .click();
    cy.url().should('include', '/resources/TestPatient/all');
  });
});
