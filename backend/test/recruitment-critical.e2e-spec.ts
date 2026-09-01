/**
 * E2E: Critical Path 2 – HR Recruitment flow
 *
 * Scenario: Login HR → Create vacancy → Add applicant → Schedule interview → Hire
 *
 * Run with:
 *   npm run test:e2e -- --testPathPattern=recruitment-critical
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

const HR_EMAIL = process.env.E2E_HR_EMAIL ?? 'hr@hrms.local';
const HR_PASS = process.env.E2E_HR_PASS ?? 'Hr@12345';

describe('HR Critical Path: Login → Create Vacancy → Add Applicant → Interview → Hire', () => {
  let hrToken: string;
  let vacancyId: string;
  let applicantId: string;
  let interviewId: string;

  beforeAll(async () => {
    await initApp();
  });

  afterAll(async () => {
    // Cleanup
    if (interviewId) {
      await prisma.recruitInterview.deleteMany({ where: { id: interviewId } }).catch(() => {});
    }
    if (applicantId) {
      await prisma.recruitApplicant.deleteMany({ where: { id: applicantId } }).catch(() => {});
    }
    if (vacancyId) {
      await prisma.recruitVacancy.deleteMany({ where: { id: vacancyId } }).catch(() => {});
    }
    await closeApp();
  });

  // ── Step 1: Login HR ───────────────────────────────────────────────────
  it('1. should login as HR user', async () => {
    hrToken = await loginAs(HR_EMAIL, HR_PASS);
    expect(hrToken).toBeDefined();
    expect(typeof hrToken).toBe('string');
  });

  // ── Step 2: Create vacancy ─────────────────────────────────────────────
  it('2. should create a job vacancy', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/recruitment/vacancies')
      .set(authHeader(hrToken))
      .send({
        title: 'E2E Senior Backend Engineer',
        description: 'Looking for a skilled NestJS developer',
        status: 'OPEN',
        openDate: new Date().toISOString().split('T')[0],
      })
      .expect(201);

    const vacancy = res.body?.data ?? res.body;
    expect(vacancy.id).toBeDefined();
    expect(vacancy.title).toBe('E2E Senior Backend Engineer');
    vacancyId = vacancy.id;
  });

  it('2b. should list vacancies and include the created one', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/recruitment/vacancies')
      .set(authHeader(hrToken))
      .expect(200);

    const vacancies = res.body?.data ?? res.body;
    const ids = vacancies.map((v: any) => v.id);
    expect(ids).toContain(vacancyId);
  });

  // ── Step 3: Add applicant ──────────────────────────────────────────────
  it('3. should add an applicant to the vacancy', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/recruitment/applicants')
      .set(authHeader(hrToken))
      .send({
        vacancyId,
        fullName: 'John E2E Doe',
        email: `john.e2e.${Date.now()}@example.com`,
        phone: '082100000001',
      })
      .expect(201);

    const applicant = res.body?.data ?? res.body;
    expect(applicant.id).toBeDefined();
    expect(applicant.fullName).toBe('John E2E Doe');
    applicantId = applicant.id;
  });

  // ── Step 4: Schedule interview ─────────────────────────────────────────
  it('4. should schedule an interview for the applicant', async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const res = await request(app.getHttpServer())
      .post('/api/v1/recruitment/interviews')
      .set(authHeader(hrToken))
      .send({
        applicantId,
        scheduledAt: tomorrow.toISOString(),
      })
      .expect(201);

    const interview = res.body?.data ?? res.body;
    expect(interview.id).toBeDefined();
    expect(interview.applicant?.id ?? interview.applicantId).toBe(applicantId);
    interviewId = interview.id;
  });

  it('4b. should update interview result to PASSED', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/v1/recruitment/interviews/${interviewId}`)
      .set(authHeader(hrToken))
      .send({ score: 85, feedback: 'Excellent technical skills', result: 'PASSED' })
      .expect(200);

    const interview = res.body?.data ?? res.body;
    expect(interview.result).toBe('PASSED');
  });

  // ── Step 5: Hire – move applicant to ACCEPTED ──────────────────────────
  it('5. should update applicant status to ACCEPTED (hired)', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/v1/recruitment/applicants/${applicantId}/status`)
      .set(authHeader(hrToken))
      .send({ status: 'ACCEPTED' })
      .expect(200);

    const applicant = res.body?.data ?? res.body;
    expect(applicant.status).toBe('ACCEPTED');
  });
});
