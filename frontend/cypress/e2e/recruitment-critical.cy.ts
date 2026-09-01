/**
 * Cypress E2E: Critical Path 2 – HR Recruitment Flow
 *
 * Scenario: Login HR → Create vacancy → Add applicant → Schedule interview → Hire
 */

/// <reference types="cypress" />

const uniqueSuffix = Date.now();

describe('HR Recruitment Critical Path', () => {
  beforeEach(() => {
    cy.loginAsHR();
  });

  // ── 1. Login ────────────────────────────────────────────────────────────
  it('1. HR can login and see recruitment menu', () => {
    cy.visit('/');
    cy.get('[data-cy="nav-recruitment"], [href*="recruitment"]', { timeout: 8000 })
      .should('be.visible');
  });

  // ── 2. Create Vacancy ──────────────────────────────────────────────────
  it('2. HR can create a job vacancy', () => {
    cy.visit('/recruitment/vacancies/create');

    cy.get('[data-cy="input-vacancy-title"]').type(`E2E Senior Engineer ${uniqueSuffix}`);
    cy.get('[data-cy="textarea-vacancy-description"]').type(
      'Looking for a skilled developer',
    );
    cy.get('[data-cy="select-vacancy-status"]').select('OPEN');
    cy.get('[data-cy="btn-submit-vacancy"]').click();

    cy.get('[data-cy="toast-success"], [data-cy="alert-success"]', { timeout: 10000 })
      .should('be.visible');
  });

  // ── 3. Add Applicant ───────────────────────────────────────────────────
  it('3. HR can add an applicant to a vacancy', () => {
    cy.visit('/recruitment/vacancies');

    // Click into the first vacancy
    cy.get('[data-cy="vacancy-item"]', { timeout: 8000 }).first().click();

    cy.get('[data-cy="btn-add-applicant"]').click();
    cy.get('[data-cy="modal-add-applicant"]').should('be.visible');

    cy.get('[data-cy="input-applicant-name"]').type('Cypress Applicant');
    cy.get('[data-cy="input-applicant-email"]').type(`applicant.${uniqueSuffix}@example.com`);
    cy.get('[data-cy="input-applicant-phone"]').type('081200000099');
    cy.get('[data-cy="btn-submit-applicant"]').click();

    cy.get('[data-cy="toast-success"]', { timeout: 10000 }).should('be.visible');
  });

  // ── 4. Schedule Interview ──────────────────────────────────────────────
  it('4. HR can schedule an interview', () => {
    cy.visit('/recruitment/applicants');

    cy.get('[data-cy="applicant-item"]', { timeout: 8000 }).first().click();

    cy.get('[data-cy="btn-schedule-interview"]').click();
    cy.get('[data-cy="modal-schedule-interview"]').should('be.visible');

    // Fill in tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    cy.get('[data-cy="input-interview-date"]').type(tomorrow.toISOString().slice(0, 16));
    cy.get('[data-cy="btn-confirm-interview"]').click();

    cy.get('[data-cy="toast-success"]', { timeout: 10000 }).should('be.visible');
  });

  // ── 5. Hire (ACCEPTED) ─────────────────────────────────────────────────
  it('5. HR can mark applicant as hired (ACCEPTED)', () => {
    cy.visit('/recruitment/applicants');

    cy.get('[data-cy="applicant-item"]', { timeout: 8000 }).first().click();

    cy.get('[data-cy="btn-update-status"]').click();
    cy.get('[data-cy="select-applicant-status"]').select('ACCEPTED');
    cy.get('[data-cy="btn-confirm-status"]').click();

    cy.get('[data-cy="toast-success"]', { timeout: 10000 }).should('be.visible');
    cy.get('[data-cy="applicant-status-badge"]').should('contain.text', 'ACCEPTED');
  });
});
