// ***********************************************
// Cypress Custom Commands & Global Configuration
// ***********************************************

// Import Cypress types
/// <reference types="cypress" />

const API_URL = Cypress.env('API_URL') as string;

/**
 * cy.loginViaAPI(email, password)
 * Calls the backend auth API directly (bypasses UI login page)
 * and stores tokens in localStorage for subsequent requests.
 */
Cypress.Commands.add(
  'loginViaAPI',
  (email: string, password: string): Cypress.Chainable<void> => {
    return cy
      .request('POST', `${API_URL}/auth/login`, { email, password })
      .then((response) => {
        const data = response.body?.data ?? response.body;
        window.localStorage.setItem('hrms_access_token', data.access_token);
        window.localStorage.setItem('hrms_refresh_token', data.refresh_token);
      });
  },
);

/**
 * cy.loginAsAdmin()  — shortcut using env vars
 */
Cypress.Commands.add('loginAsAdmin', (): Cypress.Chainable<void> => {
  return cy.loginViaAPI(
    Cypress.env('ADMIN_EMAIL') as string,
    Cypress.env('ADMIN_PASSWORD') as string,
  );
});

/**
 * cy.loginAsHR()
 */
Cypress.Commands.add('loginAsHR', (): Cypress.Chainable<void> => {
  return cy.loginViaAPI(
    Cypress.env('HR_EMAIL') as string,
    Cypress.env('HR_PASSWORD') as string,
  );
});

/**
 * cy.loginAsEmployee()
 */
Cypress.Commands.add('loginAsEmployee', (): Cypress.Chainable<void> => {
  return cy.loginViaAPI(
    Cypress.env('EMPLOYEE_EMAIL') as string,
    Cypress.env('EMPLOYEE_PASSWORD') as string,
  );
});

declare global {
  namespace Cypress {
    interface Chainable {
      loginViaAPI(email: string, password: string): Chainable<void>;
      loginAsAdmin(): Chainable<void>;
      loginAsHR(): Chainable<void>;
      loginAsEmployee(): Chainable<void>;
    }
  }
}

// Prevent Cypress from failing on uncaught exceptions from the app
Cypress.on('uncaught:exception', (err) => {
  // Vue Router navigation guards can throw in some cases - ignore
  if (err.message.includes('NavigationDuplicated')) return false;
  return true;
});
