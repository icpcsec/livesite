/// <reference types="cypress" />

describe('Standings Page', () => {
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

  describe('Page Structure', () => {
    it('displays the page title', () => {
      cy.get('h1').should('contain', 'Standings');
    });

    it('displays the standings table', () => {
      cy.get('.team-row').should('exist');
    });

    it('displays the legend row with headers', () => {
      cy.get('.team-row.legend').should('exist');
      cy.get('.team-row.legend').within(() => {
        cy.contains('#');
        cy.contains('Solved');
        cy.contains('Team/University');
      });
    });

    it('displays problem columns (A-K)', () => {
      cy.get('.team-row.legend').within(() => {
        cy.get('.team-problem').should('have.length', 11);
        cy.contains('A');
        cy.contains('K');
      });
    });

    it('displays the footer row with statistics', () => {
      cy.get('.team-row.footer').should('exist');
      cy.get('.team-row.footer').contains('Solved / Attempted teams');
    });
  });

  describe('Team Data', () => {
    it('displays team names and universities', () => {
      cy.contains('Assorted Behavior');
      cy.contains('Copper Cove Academy');
      cy.contains('Nervous Join');
      cy.contains('Oakwood School of Fine Arts');
    });

    it('displays team ranks', () => {
      cy.get('.team-row')
        .not('.legend')
        .not('.footer')
        .first()
        .within(() => {
          cy.get('.team-rank').should('contain', '1');
        });
    });

    it('displays solved counts', () => {
      cy.get('.team-row')
        .not('.legend')
        .not('.footer')
        .first()
        .within(() => {
          cy.get('.team-score').should('contain', '11');
        });
    });

    it('displays at least 50 teams', () => {
      cy.get('.team-row')
        .not('.legend')
        .not('.footer')
        .should('have.length', 50);
    });
  });

  describe('Problem Status', () => {
    it('displays problem cells for each team', () => {
      cy.get('.team-row')
        .not('.legend')
        .not('.footer')
        .first()
        .within(() => {
          cy.get('.team-problem').should('have.length', 11);
        });
    });

    it('first team has exactly 11 solved problems', () => {
      cy.get('.team-row')
        .not('.legend')
        .not('.footer')
        .first()
        .within(() => {
          cy.get('.bg-solved').should('have.length', 11);
        });
    });

    it('displays exactly 200 solved problems across all teams', () => {
      cy.get('.bg-solved').should('have.length', 200);
    });

    it('displays exactly 18 rejected problems across all teams', () => {
      cy.get('.bg-rejected').should('have.length', 18);
    });

    it('displays exactly 43 pending problems during freeze', () => {
      cy.get('.bg-pending').should('have.length', 43);
    });

    it('displays exactly 289 unattempted problems', () => {
      cy.get('.bg-unattempted').should('have.length', 289);
    });

    it('total problem cells equals 550 (50 teams × 11 problems)', () => {
      cy.get('.team-row')
        .not('.legend')
        .not('.footer')
        .then(($rows) => {
          expect($rows.length).to.equal(50);
          const totalCells = $rows.find('.team-problem').length;
          expect(totalCells).to.equal(550);
        });
    });
  });
});
