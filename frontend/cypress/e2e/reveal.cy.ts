/// <reference types="cypress" />

describe('Reveal Page', () => {
  beforeEach(() => {
    // Reset to original data before each test
    cy.request({
      method: 'PUT',
      url: 'http://localhost:9000/.json?ns=fake-server',
      body: {
        feeds: {
          contest: '/demodata/contest.json',
          standings: '/demodata/standings.json',
          teams: '/demodata/teams.json',
        },
      },
    });

    cy.visit('http://localhost:5000/reveal/');
    cy.contains('Standings').should('exist');
  });

  it('loads the reveal page with upload form', () => {
    cy.contains('Please select reveal JSON files:').should('exist');
    cy.get('input[type="file"]').should('exist');
    cy.contains('Use arrow keys to navigate').should('exist');
  });

  it('hides NavBar on reveal page', () => {
    cy.get('nav.navbar').should('not.exist');
  });

  it('hides EventsOverlay on reveal page', () => {
    cy.get('.events').should('not.exist');
  });
});
