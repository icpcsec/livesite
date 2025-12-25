/// <reference types="cypress" />

describe('Reveal Page', () => {
  beforeEach(() => {
    // Clear localStorage to start with default settings
    cy.clearLocalStorage();

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

  describe('Dark Mode Toggle', () => {
    it('displays dark mode toggle in upload form', () => {
      cy.contains('Enable dark coloring (suitable for projecting)').should(
        'exist'
      );
      cy.get('input[type="checkbox"]').should('have.length', 1);
    });

    it('has dark mode disabled by default', () => {
      // Verify light theme by default
      cy.get('body').should('have.css', 'color', 'rgb(0, 0, 0)');

      cy.contains('Enable dark coloring (suitable for projecting)')
        .parent()
        .find('input[type="checkbox"]')
        .should('not.be.checked');
    });

    it('can toggle dark mode on and off', () => {
      // Verify default light theme
      cy.get('body').should('have.css', 'color', 'rgb(0, 0, 0)');

      // Toggle on - force:true is needed because Material Design hides the
      // actual checkbox input (0x0 pixels) and uses the label for display
      cy.contains('Enable dark coloring (suitable for projecting)')
        .parent()
        .find('input[type="checkbox"]')
        .click({ force: true });

      // Verify checkbox is checked
      cy.contains('Enable dark coloring (suitable for projecting)')
        .parent()
        .find('input[type="checkbox"]')
        .should('be.checked');

      // Verify dark theme is applied
      cy.get('body').should('have.css', 'color', 'rgb(255, 255, 255)');
      cy.get('body').should('have.css', 'background-color', 'rgb(48, 48, 48)');

      // Toggle off
      cy.contains('Enable dark coloring (suitable for projecting)')
        .parent()
        .find('input[type="checkbox"]')
        .click({ force: true });

      // Verify checkbox is unchecked
      cy.contains('Enable dark coloring (suitable for projecting)')
        .parent()
        .find('input[type="checkbox"]')
        .should('not.be.checked');

      // Verify light theme is restored
      cy.get('body').should('have.css', 'color', 'rgb(0, 0, 0)');
    });

    it('syncs dark mode setting with settings page', () => {
      // Enable dark mode on reveal page
      cy.contains('Enable dark coloring (suitable for projecting)')
        .parent()
        .find('input[type="checkbox"]')
        .click({ force: true });

      // Verify dark theme is applied
      cy.get('body').should('have.css', 'color', 'rgb(255, 255, 255)');

      // Navigate to settings page
      cy.visit('http://localhost:5000/settings/');

      // Verify dark mode is still enabled
      cy.get('body').should('have.css', 'color', 'rgb(255, 255, 255)');

      // Find the invert color checkbox on settings page
      cy.contains('Enable dark coloring (suitable for projecting)')
        .parent()
        .find('input[type="checkbox"]')
        .should('be.checked');

      // Navigate back to reveal page
      cy.visit('http://localhost:5000/reveal/');

      // Verify dark mode is still enabled
      cy.get('body').should('have.css', 'color', 'rgb(255, 255, 255)');
      cy.contains('Enable dark coloring (suitable for projecting)')
        .parent()
        .find('input[type="checkbox"]')
        .should('be.checked');
    });
  });
});
