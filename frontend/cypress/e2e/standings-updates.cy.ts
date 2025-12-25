/// <reference types="cypress" />

describe('Standings Updates', () => {
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

    cy.visit('/standings/');
    cy.get('.team-row').should('have.length.greaterThan', 1);
  });

  describe('Single Team Solving a Problem', () => {
    it('updates standings when team solves a problem and changes rank', () => {
      // Verify initial state - team 26 at rank 2 has 8 solved
      cy.get('.team-row')
        .not('.legend')
        .not('.footer')
        .filter(':contains("Paltry Learning")')
        .within(() => {
          cy.get('.team-rank').should('contain', '2');
          cy.get('.team-score').should('contain', '8');
        });

      // Verify initial state - team 32 at rank 3 has 8 solved
      cy.get('.team-row')
        .not('.legend')
        .not('.footer')
        .filter(':contains("Thirsty Whip")')
        .within(() => {
          cy.get('.team-rank').should('contain', '3');
          cy.get('.team-score').should('contain', '8');
        });

      // Initial problem counts (only in standings table, not events overlay)
      cy.get('.team-row .bg-solved').should('have.length', 200);
      cy.get('.team-row .bg-pending').should('have.length', 43);

      // Update Firebase standings feed to point to updated standings
      cy.request({
        method: 'PUT',
        url: 'http://localhost:9000/feeds/standings.json?ns=fake-server',
        body: '"/demodata/standings-updated.json"',
      });

      // Poll for team 32 to have 9 solved and rank 2
      cy.get('.team-row')
        .not('.legend')
        .not('.footer')
        .filter(':contains("Thirsty Whip")')
        .within(() => {
          cy.get('.team-rank', { timeout: 10000 }).should('contain', '2');
          cy.get('.team-score').should('contain', '9');
        });

      // Verify team 26 dropped to rank 3 with same 8 solved
      cy.get('.team-row')
        .not('.legend')
        .not('.footer')
        .filter(':contains("Paltry Learning")')
        .within(() => {
          cy.get('.team-rank').should('contain', '3');
          cy.get('.team-score').should('contain', '8');
        });

      // Verify updated problem counts (only in standings table, not events overlay)
      cy.get('.team-row .bg-solved').should('have.length', 201);
      cy.get('.team-row .bg-pending').should('have.length', 42);

      // Verify team 32 is now second in the table
      cy.get('.team-row')
        .not('.legend')
        .not('.footer')
        .eq(1)
        .should('contain', 'Thirsty Whip');

      // Verify team 26 is now third in the table
      cy.get('.team-row')
        .not('.legend')
        .not('.footer')
        .eq(2)
        .should('contain', 'Paltry Learning');
    });

    it('displays event notification with rank change when team solves a problem', () => {
      // Update Firebase standings feed to point to updated standings
      cy.request({
        method: 'PUT',
        url: 'http://localhost:9000/feeds/standings.json?ns=fake-server',
        body: '"/demodata/standings-updated.json"',
      });

      // Poll for EventRow to appear with correct information
      cy.get('.events .card', { timeout: 10000 }).should(
        'have.length.at.least',
        1
      );

      // Check the event for team 32 solving problem D
      cy.get('.events .card')
        .first()
        .within(() => {
          // Event should show as solved
          cy.get('.bg-solved').should('exist').and('contain', 'D');

          // Event should show rank change from 3 to 2
          cy.contains('3 ⇒ 2').should('exist');
        });

      // Event should show team university
      cy.get('.events .card')
        .first()
        .should('contain', 'Pleasant Grove Elementary');
    });
  });
});
