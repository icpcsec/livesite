/// <reference types="cypress" />

describe('Standings', () => {
  it('Contains teams', () => {
    cy.visit('http://localhost:5000/standings/');
    cy.contains('Assorted Behavior');
    cy.contains('Copper Cove Academy');
  });
});
