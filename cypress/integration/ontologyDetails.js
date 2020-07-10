describe('Ontology Details', () => {
  before(() => {
    cy.server();
    cy.route({
      method: 'GET',
      url: 'http://hapi.fhir.org/baseR4/StructureDefinition',
      response: {},
    }).as('getStructureDefinition');
    cy.route({
      method: 'GET',
      url: 'http://hapi.fhir.org/baseR4/CodeSystem',
      response: 'fixture:ontologies/ontologies.json',
    }).as('getOntologies');
    cy.route({
      method: 'GET',
      url: 'http://hapi.fhir.org/baseR4/StructureDefinition/CodeSystem',
      response: {type: 'CodeSystem'},
    }).as('getCodeSystemStructureDefinition');
    cy.route({
      method: 'GET',
      url: 'http://hapi.fhir.org/baseR4/CodeSystem/**',
      response: 'fixture:ontologies/ontologyDetails.json',
    }).as('getOntology');

    cy.visit('/ontologies/Code1');
    cy.wait(['@getCodeSystemStructureDefinition', '@getOntology']);
  });

  it('loads ontology details', () => {
    cy.url().should('include', '/ontologies/Code1');
    cy.get('a.item')
      .should($x => {
        expect($x).to.have.length(1);
      })
      .contains('Payload');
  });
});
