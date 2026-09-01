/**
 * E2E: Critical Path 3 – Employee Leave flow
 *
 * Scenario: Login employee → Apply leave → Manager approve → Check quota berkurang
 *
 * Run with:
 *   npm run test:e2e -- --testPathPattern=leave-critical
 */
import * as request from 'supertest';
import {
  app,
  authHeader,
  closeApp,
  initApp,
  loginAs,
  prisma,
} from './helpers';

const EMPLOYEE_EMAIL = process.env.E2E_EMPLOYEE_EMAIL ?? 'employee@hrms.local';
const EMPLOYEE_PASS = process.env.E2E_EMPLOYEE_PASS ?? 'Emp@12345';
const MANAGER_EMAIL = process.env.E2E_MANAGER_EMAIL ?? 'manager@hrms.local';
const MANAGER_PASS = process.env.E2E_MANAGER_PASS ?? 'Mgr@12345';

describe('Employee Leave Critical Path: Apply → Manager Approve → Quota Decreases', () => {
  let employeeToken: string;
  let managerToken: string;
  let employeeId: string;
  let leaveTypeId: string;
  let leaveApplicationId: string;
  let quotaBefore: number;

  beforeAll(async () => {
    await initApp();
  });

  afterAll(async () => {
    if (leaveApplicationId) {
      await prisma.leaveApplication
        .deleteMany({ where: { id: leaveApplicationId } })
        .catch(() => {});
    }
    await closeApp();
  });

  // ── Step 1: Login as employee ──────────────────────────────────────────
  it('1. should login as employee', async () => {
    employeeToken = await loginAs(EMPLOYEE_EMAIL, EMPLOYEE_PASS);
    expect(employeeToken).toBeDefined();
  });

  it('1b. should login as manager', async () => {
    managerToken = await loginAs(MANAGER_EMAIL, MANAGER_PASS);
    expect(managerToken).toBeDefined();
  });

  // ── Get employee profile ───────────────────────────────────────────────
  it('Prerequisite: should get employee profile (me)', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set(authHeader(employeeToken))
      .expect(200);

    const user = res.body?.data ?? res.body;
    expect(user.employeeId ?? user.employee?.id).toBeDefined();
    employeeId = user.employeeId ?? user.employee?.id;
  });

  // ── Get leave types ────────────────────────────────────────────────────
  it('Prerequisite: should get leave types', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/leave-applications/types')
      .set(authHeader(employeeToken))
      .expect(200);

    const types = res.body?.data ?? res.body;
    expect(types.length).toBeGreaterThan(0);
    leaveTypeId = types[0].id;
  });

  // ── Step 2: Check quota before applying ───────────────────────────────
  it('2. should get employee leave quota before application', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/v1/employees/${employeeId}/leave-quota`)
      .set(authHeader(employeeToken))
      .expect(200);

    const quotas = res.body?.data ?? res.body;
    const target = quotas.find((q: any) => q.leaveTypeId === leaveTypeId);
    expect(target).toBeDefined();
    quotaBefore = target.remainingDays;
    expect(quotaBefore).toBeGreaterThan(0);
  });

  // ── Step 3: Apply for leave ────────────────────────────────────────────
  it('3. should apply for leave (1 day)', async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 7); // 1 week from now
    const startDate = tomorrow.toISOString().split('T')[0];
    const endDate = startDate; // Single day

    const res = await request(app.getHttpServer())
      .post('/api/v1/leave-applications')
      .set(authHeader(employeeToken))
      .send({
        employeeId,
        leaveTypeId,
        startDate,
        endDate,
        totalDays: 1,
        reason: 'E2E test leave application',
      })
      .expect(201);

    const application = res.body?.data ?? res.body;
    expect(application.id).toBeDefined();
    expect(application.status).toBe('PENDING');
    leaveApplicationId = application.id;
  });

  it('3b. quota should NOT decrease yet (status is PENDING)', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/v1/employees/${employeeId}/leave-quota`)
      .set(authHeader(employeeToken))
      .expect(200);

    const quotas = res.body?.data ?? res.body;
    const target = quotas.find((q: any) => q.leaveTypeId === leaveTypeId);
    // PENDING applications should NOT affect quota
    expect(target.remainingDays).toBe(quotaBefore);
  });

  // ── Step 4: Manager approves ───────────────────────────────────────────
  it('4. manager should approve the leave application', async () => {
    const res = await request(app.getHttpServer())
      .put(`/api/v1/leave-applications/${leaveApplicationId}/workflow`)
      .set(authHeader(managerToken))
      .send({
        status: 'APPROVED',
        notes: 'Approved by E2E manager',
        approvedBy: 'manager-e2e',
      })
      .expect(200);

    const application = res.body?.data ?? res.body;
    expect(application.status).toBe('APPROVED');
  });

  // ── Step 5: Verify quota decreased ────────────────────────────────────
  it('5. quota should decrease by 1 after approval', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/v1/employees/${employeeId}/leave-quota`)
      .set(authHeader(employeeToken))
      .expect(200);

    const quotas = res.body?.data ?? res.body;
    const target = quotas.find((q: any) => q.leaveTypeId === leaveTypeId);
    expect(target.remainingDays).toBe(quotaBefore - 1);
  });
});
