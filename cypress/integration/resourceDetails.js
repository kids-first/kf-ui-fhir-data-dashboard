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
    cy.route({
      method: 'GET',
      url:
        'https://damp-castle-44220.herokuapp.com/http://hapi.fhir.org/baseR4/StructureDefinition?url=http://fhir.kids-first.io/StructureDefinition/karyotypic-sex',
      response: 'fixture:resourceDetails/karyotypicSexSD.json',
    }).as('getExtension');
    cy.route({
      method: 'GET',
      url:
        'https://damp-castle-44220.herokuapp.com/http://hapi.fhir.org/baseR4/ValueSet?url=http://fhir.kids-first.io/ValueSet/karyotypic-sex',
      response: 'fixture:resourceDetails/karyotypicSexVS.json',
    }).as('getValueSet');
    cy.route({
      method: 'GET',
      url:
        'https://damp-castle-44220.herokuapp.com/http://hapi.fhir.org/baseR4/CodeSystem?url=http://hl7.org/fhir/karyotypic-sex',
      response: 'fixture:resourceDetails/karyotypicSexCS.json',
    }).as('getCodeSystem');
    cy.visit('/resources/TestPatient');
    cy.wait([
      '@getPatientDetails',
      '@getPatientSearchParams',
      '@getCapabilityStatement',
      '@getResourceCounts',
      '@getExtension',
      '@getValueSet',
      '@getCodeSystem',
    ]);
  });

  it('loads the resource details and presents the proper charts', () => {
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
    cy.get('.resource-details__pie-section')
      .children('div')
      .should('have.class', 'resource-details__pie card')
      .should($x => {
        expect($x).to.have.length(1);
      });
    cy.get('.resource-details__bar-section')
      .children('div')
      .should('have.class', 'resource-details__bar card')
      .should($x => {
        expect($x).to.have.length(1);
      });
  });

  it('shows attribute details on click', () => {
    cy.get('.resource-details__count')
      .eq(0)
      .click();
    cy.url().should('include', '/resources/TestPatient/all');
  });
});
