/// <reference types="cypress" />

describe('Settings Page', () => {
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

    cy.visit('http://localhost:5000/settings/');
  });

  describe('Page Structure', () => {
    it('displays the settings page title', () => {
      cy.get('h1').should('contain', 'Settings');
    });

    it('displays the settings form', () => {
      cy.get('form').should('exist');
    });

    it('displays both setting checkboxes', () => {
      cy.get('input[type="checkbox"]').should('have.length', 2);
    });

    it('displays the invert color setting', () => {
      cy.contains('Enable dark coloring (suitable for projecting)').should(
        'exist'
      );
    });

    it('displays the autoscroll setting', () => {
      cy.contains('Enable autoscrolling in standings page').should('exist');
    });
  });

  describe('Default Settings', () => {
    it('has invert color disabled by default', () => {
      cy.contains('Enable dark coloring (suitable for projecting)')
        .parent()
        .find('input[type="checkbox"]')
        .should('not.be.checked');
    });

    it('has autoscroll disabled by default', () => {
      cy.contains('Enable autoscrolling in standings page')
        .parent()
        .find('input[type="checkbox"]')
        .should('not.be.checked');
    });
  });

  describe('Toggle Invert Color', () => {
    it('can toggle invert color on and off', () => {
      // Verify default light theme
      cy.get('body').should('have.css', 'color', 'rgb(0, 0, 0)');

      // Toggle on - force:true is needed because Material Design hides the
      // actual checkbox input (0x0 pixels) and uses the label for display
      cy.contains('Enable dark coloring (suitable for projecting)')
        .parent()
        .find('input[type="checkbox"]')
        .click({ force: true });

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

      cy.contains('Enable dark coloring (suitable for projecting)')
        .parent()
        .find('input[type="checkbox"]')
        .should('not.be.checked');

      // Verify light theme is restored
      cy.get('body').should('have.css', 'color', 'rgb(0, 0, 0)');
    });

    it('persists invert color setting after page reload', () => {
      // Toggle on - force:true is needed because Material Design hides the
      // actual checkbox input (0x0 pixels) and uses the label for display
      cy.contains('Enable dark coloring (suitable for projecting)')
        .parent()
        .find('input[type="checkbox"]')
        .click({ force: true });

      // Verify dark theme is applied
      cy.get('body').should('have.css', 'color', 'rgb(255, 255, 255)');

      cy.reload();

      // Verify setting persisted
      cy.contains('Enable dark coloring (suitable for projecting)')
        .parent()
        .find('input[type="checkbox"]')
        .should('be.checked');

      // Verify dark theme is still applied after reload
      cy.get('body').should('have.css', 'color', 'rgb(255, 255, 255)');
      cy.get('body').should('have.css', 'background-color', 'rgb(48, 48, 48)');
    });
  });

  describe('Toggle Autoscroll', () => {
    it('can toggle autoscroll on and off', () => {
      // Toggle on - force:true is needed because Material Design hides the
      // actual checkbox input (0x0 pixels) and uses the label for display
      cy.contains('Enable autoscrolling in standings page')
        .parent()
        .find('input[type="checkbox"]')
        .click({ force: true });

      cy.contains('Enable autoscrolling in standings page')
        .parent()
        .find('input[type="checkbox"]')
        .should('be.checked');

      // Toggle off
      cy.contains('Enable autoscrolling in standings page')
        .parent()
        .find('input[type="checkbox"]')
        .click({ force: true });

      cy.contains('Enable autoscrolling in standings page')
        .parent()
        .find('input[type="checkbox"]')
        .should('not.be.checked');
    });

    it('persists autoscroll setting after page reload', () => {
      // Toggle on - force:true is needed because Material Design hides the
      // actual checkbox input (0x0 pixels) and uses the label for display
      cy.contains('Enable autoscrolling in standings page')
        .parent()
        .find('input[type="checkbox"]')
        .click({ force: true });

      cy.reload();

      // Verify setting persisted
      cy.contains('Enable autoscrolling in standings page')
        .parent()
        .find('input[type="checkbox"]')
        .should('be.checked');
    });
  });
});
