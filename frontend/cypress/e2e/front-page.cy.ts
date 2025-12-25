/// <reference types="cypress" />

describe('Front Page', () => {
  it('loads the front page', () => {
    cy.visit('/');
    cy.contains('LiveSite');
    cy.contains('This is a demo');
  });

  it('has a link to standings page', () => {
    cy.visit('/');
    cy.get('a[href*="standings"]').should('exist');
  });
});
