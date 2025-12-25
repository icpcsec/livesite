/// <reference types="cypress" />

describe('Front Page', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('loads the front page', () => {
    cy.contains('LiveSite');
    cy.contains('This is a demo');
  });

  it('has a link to standings page', () => {
    cy.get('a[href*="standings"]').should('exist');
  });
});
