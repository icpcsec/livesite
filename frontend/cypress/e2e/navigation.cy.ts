/// <reference types="cypress" />

describe('Navigation', () => {
  it('can navigate between pages', () => {
    cy.visit('http://localhost:5000/');

    cy.get('a[href*="standings"]').first().click();
    cy.url().should('include', '/standings');
    cy.contains('Standings');

    cy.get('a[href="/"]').first().click();
    cy.url().should('match', /\/$/);
  });
});
