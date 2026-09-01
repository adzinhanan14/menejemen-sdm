/**
 * Cypress E2E: Critical Path 1 – Admin Flow
 *
 * Scenario: Login admin → Create employee → Check-in employee → Generate payroll
 */

/// <reference types="cypress" />

const uniqueSuffix = Date.now();

describe('Admin Critical Path', () => {
  beforeEach(() => {
    cy.loginAsAdmin();
  });

  // ── 1. Login ────────────────────────────────────────────────────────────
  it('1. Admin can login and land on dashboard', () => {
    cy.visit('/');
    // Wait for the app to redirect to the dashboard
    cy.url().should('include', '/dashboard');
    cy.get('[data-cy="nav-sidebar"]', { timeout: 8000 }).should('be.visible');
  });

  // ── 2. Create Employee ─────────────────────────────────────────────────
  it('2. Admin can create a new employee', () => {
    cy.visit('/employees/create');

    cy.get('[data-cy="input-nik"]').type(`E2ECYP${uniqueSuffix}`);
    cy.get('[data-cy="input-name"]').type('Cypress Test Employee');
    cy.get('[data-cy="input-email"]').type(`cypress.${uniqueSuffix}@hrms.test`);
    cy.get('[data-cy="input-phone"]').type('081234567890');
    cy.get('[data-cy="select-gender"]').select('MALE');
    cy.get('[data-cy="select-department"]').find('option:not([value=""])').first().then(($opt) => {
      cy.get('[data-cy="select-department"]').select($opt.val() as string);
    });
    cy.get('[data-cy="select-position"]').find('option:not([value=""])').first().then(($opt) => {
      cy.get('[data-cy="select-position"]').select($opt.val() as string);
    });
    cy.get('[data-cy="input-join-date"]').type(new Date().toISOString().split('T')[0]);
    cy.get('[data-cy="input-basic-salary"]').type('5000000');
    cy.get('[data-cy="btn-submit-employee"]').click();

    // Should redirect to employee detail or list with success toast
    cy.get('[data-cy="toast-success"], [data-cy="alert-success"]', { timeout: 10000 })
      .should('be.visible');
  });

  // ── 3. Check-in Employee ───────────────────────────────────────────────
  it('3. Admin can trigger employee check-in from attendance page', () => {
    cy.visit('/attendance');

    cy.get('[data-cy="btn-check-in"]', { timeout: 8000 }).first().click();

    // Modal or form appears
    cy.get('[data-cy="modal-check-in"], [data-cy="form-check-in"]').should('be.visible');
    cy.get('[data-cy="btn-confirm-check-in"]').click();

    cy.get('[data-cy="toast-success"], [data-cy="alert-success"]', { timeout: 10000 })
      .should('be.visible');
  });

  // ── 4. Generate Payroll ────────────────────────────────────────────────
  it('4. Admin can generate payroll for current month', () => {
    cy.visit('/payroll');

    cy.get('[data-cy="btn-generate-payroll"]', { timeout: 8000 }).click();

    // Confirm modal
    cy.get('[data-cy="modal-generate-payroll"]').should('be.visible');
    cy.get('[data-cy="btn-confirm-generate"]').click();

    cy.get('[data-cy="toast-success"], [data-cy="payroll-batch-table"]', { timeout: 15000 })
      .should('be.visible');
  });
});
