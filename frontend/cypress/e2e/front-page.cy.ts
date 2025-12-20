/// <reference types="cypress" />

describe('Front Page', () => {
  it('loads the front page', () => {
    cy.visit('http://localhost:5000/');
    cy.contains('LiveSite');
    cy.contains('This is a demo');
  });

  it('has a link to standings page', () => {
    cy.visit('http://localhost:5000/');
    cy.get('a[href*="standings"]').should('exist');
  });
});
