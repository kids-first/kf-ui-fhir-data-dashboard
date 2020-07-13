describe('Server page', () => {
  before(() => {
    cy.visit('/servers');
  });

  it('displays the default server list', () => {
    cy.get('.sortable-table')
      .children('table')
      .children('tbody')
      .children('tr')
      .should($x => {
        expect($x).to.have.length(1);
      });
  });

  it('adds a new server', () => {
    cy.contains('Add a new server').click();
    cy.get('.content')
      .children('div')
      .should('have.class', 'server-configuration__modal')
      .get('input')
      .each(($el, index, $list) => {
        if (index === 0) {
          cy.get($el).type('New Server');
        } else if (index === 1) {
          cy.get($el).type('New Url');
        }
      });
    cy.get('.content')
      .children('div')
      .should('have.class', 'server-configuration__modal')
      .contains('Save')
      .click();

    cy.get('.sortable-table')
      .children('table')
      .children('tbody')
      .children('tr')
      .should($x => {
        expect($x).to.have.length(2);
      });
    cy.contains('New Server');
  });

  it('edits an existing server', () => {
    cy.contains('HAPI');
    cy.contains('Edit')
      .eq(0)
      .click();
    cy.get('input')
      .eq(0)
      .clear()
      .type('Edited Server');
    cy.get('.content')
      .children('div')
      .should('have.class', 'server-configuration__modal')
      .contains('Save')
      .click();
    cy.get('.sortable-table')
      .children('table')
      .children('tbody')
      .children('tr')
      .should('not.contain', 'HAPI')
      .contains('Edited Server');
  });

  it('does not display a login screen if no auth is required', () => {
    cy.contains('NO_AUTH').click();
    cy.contains('Launch').click();
    cy.url().should('include', '/resources');
  });
});
