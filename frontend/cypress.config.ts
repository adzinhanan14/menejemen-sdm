import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    supportFile: 'cypress/support/e2e.ts',
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 10000,
    requestTimeout: 15000,
    responseTimeout: 15000,
    video: false,
    screenshotOnRunFailure: true,
    env: {
      API_URL: 'http://localhost:3001/api/v1',
      ADMIN_EMAIL: 'admin@hrms.local',
      ADMIN_PASSWORD: 'Admin@1234',
      HR_EMAIL: 'hr@hrms.local',
      HR_PASSWORD: 'Hr@12345',
      EMPLOYEE_EMAIL: 'employee@hrms.local',
      EMPLOYEE_PASSWORD: 'Emp@12345',
      MANAGER_EMAIL: 'manager@hrms.local',
      MANAGER_PASSWORD: 'Mgr@12345',
    },
  },
});
