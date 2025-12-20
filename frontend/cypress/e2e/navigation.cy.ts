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

describe('Settings Page', () => {
  it('loads the settings page', () => {
    cy.visit('http://localhost:5000/');
    cy.visit('http://localhost:5000/settings/');
    cy.contains('Settings');
  });
});
