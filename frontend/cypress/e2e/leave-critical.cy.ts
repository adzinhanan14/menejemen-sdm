/**
 * Cypress E2E: Critical Path 3 – Employee Leave Flow
 *
 * Scenario: Login employee → Apply leave → Manager approve → Check quota berkurang
 */

/// <reference types="cypress" />

describe('Employee Leave Critical Path', () => {
  let quotaBefore: number;

  // ── 1 & 2: Login + Apply Leave ─────────────────────────────────────────
  it('1-3. Employee can apply for leave and quota is not decreased yet', () => {
    cy.loginAsEmployee();
    cy.visit('/leave');

    // Read quota before
    cy.get('[data-cy="leave-quota-remaining"]', { timeout: 8000 })
      .first()
      .invoke('text')
      .then((text) => {
        quotaBefore = parseInt(text.trim(), 10);
        expect(quotaBefore).to.be.greaterThan(0);
      });

    // Apply for leave
    cy.get('[data-cy="btn-apply-leave"]').click();
    cy.get('[data-cy="modal-apply-leave"]').should('be.visible');

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const dateStr = nextWeek.toISOString().split('T')[0];

    cy.get('[data-cy="select-leave-type"]').find('option:not([value=""])').first().then(($opt) => {
      cy.get('[data-cy="select-leave-type"]').select($opt.val() as string);
    });
    cy.get('[data-cy="input-leave-start"]').type(dateStr);
    cy.get('[data-cy="input-leave-end"]').type(dateStr);
    cy.get('[data-cy="input-leave-reason"]').type('E2E Cypress test leave');
    cy.get('[data-cy="btn-submit-leave"]').click();

    cy.get('[data-cy="toast-success"]', { timeout: 10000 }).should('be.visible');

    // Quota should NOT decrease yet (status is PENDING)
    cy.get('[data-cy="leave-quota-remaining"]').first().invoke('text').then((text) => {
      const quotaAfterApply = parseInt(text.trim(), 10);
      expect(quotaAfterApply).to.equal(quotaBefore);
    });
  });

  // ── 4: Manager approves ────────────────────────────────────────────────
  it('4. Manager can approve the leave application', () => {
    cy.loginViaAPI(
      Cypress.env('MANAGER_EMAIL') as string,
      Cypress.env('MANAGER_PASSWORD') as string,
    );
    cy.visit('/leave/approvals');

    cy.get('[data-cy="leave-approval-item"]', { timeout: 10000 }).first().within(() => {
      cy.get('[data-cy="btn-approve"]').click();
    });

    cy.get('[data-cy="modal-confirm-approval"]').should('be.visible');
    cy.get('[data-cy="btn-confirm-approve"]').click();

    cy.get('[data-cy="toast-success"]', { timeout: 10000 }).should('be.visible');
  });

  // ── 5: Quota decreased ────────────────────────────────────────────────
  it('5. Employee quota should decrease by 1 after approval', () => {
    cy.loginAsEmployee();
    cy.visit('/leave');

    cy.get('[data-cy="leave-quota-remaining"]', { timeout: 8000 })
      .first()
      .invoke('text')
      .then((text) => {
        const quotaAfterApproval = parseInt(text.trim(), 10);
        // Quota must be 1 less than before
        expect(quotaAfterApproval).to.equal(quotaBefore - 1);
      });
  });
});
