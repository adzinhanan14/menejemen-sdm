/**
 * E2E: Critical Path 1 – Admin flow
 *
 * Scenario: Login admin → Create employee → Check-in employee → Generate payroll
 *
 * Run with:
 *   npm run test:e2e -- --testPathPattern=admin-critical
 *
 * Requires a running database seeded with an admin user (see prisma/seed.ts).
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

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? 'admin@hrms.local';
const ADMIN_PASS = process.env.E2E_ADMIN_PASS ?? 'Admin@1234';

describe('Admin Critical Path: Login → Create Employee → Check-in → Payroll', () => {
  let adminToken: string;
  let createdEmployeeId: string;
  let departmentId: string;
  let positionId: string;
  let payrollBatchId: string;

  beforeAll(async () => {
    await initApp();
  });

  afterAll(async () => {
    // Clean up test data created by this suite
    if (createdEmployeeId) {
      await prisma.user.deleteMany({ where: { employee: { id: createdEmployeeId } } }).catch(() => {});
      await prisma.payrollDetail.deleteMany({ where: { employeeId: createdEmployeeId } }).catch(() => {});
      await prisma.attendanceLog.deleteMany({ where: { employeeId: createdEmployeeId } }).catch(() => {});
      await prisma.employeeContract.deleteMany({ where: { employeeId: createdEmployeeId } }).catch(() => {});
      await prisma.employee.deleteMany({ where: { id: createdEmployeeId } }).catch(() => {});
    }
    if (payrollBatchId) {
      await prisma.payrollDetail.deleteMany({ where: { batchId: payrollBatchId } }).catch(() => {});
      await prisma.payrollBatch.deleteMany({ where: { id: payrollBatchId } }).catch(() => {});
    }
    await closeApp();
  });

  // ── Step 1: Login admin ────────────────────────────────────────────────
  it('1. should login as admin and receive JWT tokens', async () => {
    adminToken = await loginAs(ADMIN_EMAIL, ADMIN_PASS);
    expect(adminToken).toBeDefined();
    expect(typeof adminToken).toBe('string');
    expect(adminToken.length).toBeGreaterThan(10);
  });

  // ── Prerequisite: fetch department & position IDs ──────────────────────
  it('Prerequisite: should retrieve departments', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/departments')
      .set(authHeader(adminToken))
      .expect(200);

    const data = res.body?.data ?? res.body;
    const list = Array.isArray(data) ? data : data?.data ?? [];
    expect(list.length).toBeGreaterThan(0);
    departmentId = list[0].id;
    expect(departmentId).toBeDefined();
  });

  it('Prerequisite: should retrieve positions', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/positions')
      .set(authHeader(adminToken))
      .expect(200);

    const data = res.body?.data ?? res.body;
    const list = Array.isArray(data) ? data : data?.data ?? [];
    expect(list.length).toBeGreaterThan(0);
    const targetPos = list[0];
    positionId = targetPos.id;
    departmentId = targetPos.departmentId;
    expect(positionId).toBeDefined();
    expect(departmentId).toBeDefined();
  });

  // ── Step 2: Create employee ────────────────────────────────────────────
  it('2. should create a new employee', async () => {
    const uniqueSuffix = Date.now().toString().slice(-6);
    const res = await request(app.getHttpServer())
      .post('/api/v1/employees')
      .set(authHeader(adminToken))
      .send({
        nik: `E2E${uniqueSuffix}`,
        name: 'E2E Test Employee',
        email: `e2e.emp.${uniqueSuffix}@hrms.test`,
        gender: 'MALE',
        departmentId,
        positionId,
        joinDate: new Date().toISOString().split('T')[0],
        contractType: 'PERMANENT',
        basicSalary: 5000000,
      })
      .expect(201);

    const employee = res.body?.data ?? res.body;
    expect(employee.id).toBeDefined();
    createdEmployeeId = employee.id;
  });

  // ── Step 3: Check-in employee ──────────────────────────────────────────
  it('3. should check-in the created employee', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/attendance/check-in')
      .set(authHeader(adminToken))
      .send({
        employeeId: createdEmployeeId,
        latitude: -6.2,
        longitude: 106.8,
      })
      .expect(201);

    const log = res.body?.data ?? res.body;
    expect(log.employeeId ?? log.id).toBeDefined();
  });

  it('3b. should NOT allow duplicate check-in on the same day', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/attendance/check-in')
      .set(authHeader(adminToken))
      .send({ employeeId: createdEmployeeId })
      .expect(400);
  });

  // ── Step 4: Generate payroll ───────────────────────────────────────────
  it('4. should generate a payroll batch for the current month', async () => {
    const now = new Date();
    const res = await request(app.getHttpServer())
      .post('/api/v1/payroll/batches')
      .set(authHeader(adminToken))
      .send({
        periodMonth: now.getMonth() + 1,
        periodYear: now.getFullYear(),
      })
      .expect(201);

    const result = res.body?.data ?? res.body;
    // Either newly created or already exists from a previous run
    expect(result.success !== undefined || result.batchId !== undefined).toBe(true);
    if (result.batchId) payrollBatchId = result.batchId;
  });

  it('4b. payroll batch should include the newly created employee', async () => {
    if (!payrollBatchId) return; // Skip if batch already existed

    const res = await request(app.getHttpServer())
      .get(`/api/v1/payroll/batches/${payrollBatchId}`)
      .set(authHeader(adminToken))
      .expect(200);

    const batch = res.body?.data ?? res.body;
    const employeeIds = (batch.details ?? []).map((d: any) => d.employeeId);
    expect(employeeIds).toContain(createdEmployeeId);
  });
});
