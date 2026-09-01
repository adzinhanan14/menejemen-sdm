import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const BCRYPT_SALT_ROUNDS = 12;

const BASE_ROLES = [
  { name: 'ADMIN', description: 'Full system access' },
  { name: 'HR_MANAGER', description: 'Manages recruitment, payroll, policies' },
  { name: 'HR_STAFF', description: 'Day-to-day HR operations' },
  { name: 'DEPARTMENT_HEAD', description: 'Approves leave & reviews for their team' },
  { name: 'EMPLOYEE', description: 'Self-service access only' },
];

const LEAVE_TYPES = [
  { name: 'Cuti Tahunan', quotaPerYear: 12, description: 'Hak cuti tahunan karyawan' },
  { name: 'Cuti Sakit', quotaPerYear: 14, description: 'Cuti karena alasan kesehatan dengan surat dokter' },
  { name: 'Cuti Melahirkan / Parental', quotaPerYear: 90, description: 'Cuti melahirkan atau mendampingi istri melahirkan' },
  { name: 'Cuti Tanpa Guna / Unpaid', quotaPerYear: 5, description: 'Cuti di luar tanggungan perusahaan' },
];

async function main() {
  // 1. Base roles
  for (const role of BASE_ROLES) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
  }
  console.log(`Seeded ${BASE_ROLES.length} roles.`);

  // 2. Company
  const company = await prisma.company.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'PT Contoh Sejahtera',
      timezone: 'Asia/Jakarta',
    },
  });

  // 3. Leave Types
  for (const lt of LEAVE_TYPES) {
    await prisma.leaveType.upsert({
      where: { name: lt.name },
      update: {},
      create: lt,
    });
  }
  console.log(`Seeded ${LEAVE_TYPES.length} leave types.`);

  // 4. Salary Components (for Payroll)
  const components = [
    { name: 'Tunjangan Transportasi', type: 'ADDITION', isTaxable: false, description: 'Transport allowance' },
    { name: 'Tunjangan Makan', type: 'ADDITION', isTaxable: false, description: 'Meal allowance' },
    { name: 'Tunjangan Kesehatan', type: 'ADDITION', isTaxable: false, description: 'Health allowance' },
    { name: 'Bonus Kinerja', type: 'ADDITION', isTaxable: true, description: 'Performance bonus' },
    { name: 'Potongan BPJS Kesehatan', type: 'DEDUCTION', isTaxable: false, description: 'Health insurance deduction' },
    { name: 'Potongan BPJS Ketenagakerjaan', type: 'DEDUCTION', isTaxable: false, description: 'Employment insurance deduction' },
    { name: 'Potongan PPh 21', type: 'DEDUCTION', isTaxable: false, description: 'Income tax deduction' },
  ];

  for (const comp of components) {
    await prisma.salaryComponent.upsert({
      where: { id: `comp-${comp.name.toLowerCase().replace(/\s+/g, '-')}` },
      update: {},
      create: {
        id: `comp-${comp.name.toLowerCase().replace(/\s+/g, '-')}`,
        name: comp.name,
        type: comp.type as any,
        isTaxable: comp.isTaxable,
        description: comp.description,
      },
    });
  }
  console.log(`Seeded ${components.length} salary components.`);

  // 5. Departments & Positions (with hierarchy)
  const hrDept = await prisma.department.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      companyId: company.id,
      name: 'Human Resources',
      code: 'HR',
    },
  });

  const engDept = await prisma.department.upsert({
    where: { id: '00000000-0000-0000-0000-000000000010' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000010',
      companyId: company.id,
      name: 'Engineering',
      code: 'ENG',
    },
  });

  const finDept = await prisma.department.upsert({
    where: { id: '00000000-0000-0000-0000-000000000020' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000020',
      companyId: company.id,
      name: 'Finance & Accounting',
      code: 'FIN',
    },
  });

  const salesDept = await prisma.department.upsert({
    where: { id: '00000000-0000-0000-0000-000000000030' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000030',
      companyId: company.id,
      name: 'Sales & Marketing',
      code: 'SALES',
    },
  });

  const opsDept = await prisma.department.upsert({
    where: { id: '00000000-0000-0000-0000-000000000040' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000040',
      companyId: company.id,
      name: 'Operations',
      code: 'OPS',
    },
  });

  // Sub-departments (Engineering children)
  const backendDept = await prisma.department.upsert({
    where: { id: '00000000-0000-0000-0000-000000000011' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000011',
      companyId: company.id,
      name: 'Backend Engineering',
      code: 'BE',
      parentId: engDept.id,
    },
  });

  const frontendDept = await prisma.department.upsert({
    where: { id: '00000000-0000-0000-0000-000000000012' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000012',
      companyId: company.id,
      name: 'Frontend Engineering',
      code: 'FE',
      parentId: engDept.id,
    },
  });

  console.log(`Seeded departments with hierarchical structure.`);

  // Positions for each department
  const sysAdminPos = await prisma.position.upsert({
    where: { id: '00000000-0000-0000-0000-000000000003' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000003',
      departmentId: hrDept.id,
      name: 'System Administrator',
      jobLevel: 'Manager',
      baseSalaryRangeMin: 10000000,
      baseSalaryRangeMax: 15000000,
    },
  });

  const hrManagerPos = await prisma.position.upsert({
    where: { id: '00000000-0000-0000-0000-000000000004' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000004',
      departmentId: hrDept.id,
      name: 'HR Manager',
      jobLevel: 'Manager',
      baseSalaryRangeMin: 12000000,
      baseSalaryRangeMax: 18000000,
    },
  });

  const hrStaffPos = await prisma.position.upsert({
    where: { id: '00000000-0000-0000-0000-000000000005' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000005',
      departmentId: hrDept.id,
      name: 'HR Staff',
      jobLevel: 'Staff',
      baseSalaryRangeMin: 5000000,
      baseSalaryRangeMax: 8000000,
    },
  });

  const sdePos = await prisma.position.upsert({
    where: { id: '00000000-0000-0000-0000-000000000011' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000011',
      departmentId: engDept.id,
      name: 'Senior Software Engineer',
      jobLevel: 'Senior',
      baseSalaryRangeMin: 15000000,
      baseSalaryRangeMax: 25000000,
    },
  });

  const backendPos = await prisma.position.upsert({
    where: { id: '00000000-0000-0000-0000-000000000013' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000013',
      departmentId: backendDept.id,
      name: 'Backend Developer',
      jobLevel: 'Mid',
      baseSalaryRangeMin: 10000000,
      baseSalaryRangeMax: 15000000,
    },
  });

  const frontendPos = await prisma.position.upsert({
    where: { id: '00000000-0000-0000-0000-000000000014' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000014',
      departmentId: frontendDept.id,
      name: 'Frontend Developer',
      jobLevel: 'Mid',
      baseSalaryRangeMin: 10000000,
      baseSalaryRangeMax: 15000000,
    },
  });

  const finPos = await prisma.position.upsert({
    where: { id: '00000000-0000-0000-0000-000000000021' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000021',
      departmentId: finDept.id,
      name: 'Finance Manager',
      jobLevel: 'Manager',
      baseSalaryRangeMin: 12000000,
      baseSalaryRangeMax: 20000000,
    },
  });

  const accountantPos = await prisma.position.upsert({
    where: { id: '00000000-0000-0000-0000-000000000022' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000022',
      departmentId: finDept.id,
      name: 'Accountant',
      jobLevel: 'Staff',
      baseSalaryRangeMin: 6000000,
      baseSalaryRangeMax: 10000000,
    },
  });

  const salesManagerPos = await prisma.position.upsert({
    where: { id: '00000000-0000-0000-0000-000000000031' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000031',
      departmentId: salesDept.id,
      name: 'Sales Manager',
      jobLevel: 'Manager',
      baseSalaryRangeMin: 10000000,
      baseSalaryRangeMax: 18000000,
    },
  });

  const opsManagerPos = await prisma.position.upsert({
    where: { id: '00000000-0000-0000-0000-000000000041' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000041',
      departmentId: opsDept.id,
      name: 'Operations Manager',
      jobLevel: 'Manager',
      baseSalaryRangeMin: 11000000,
      baseSalaryRangeMax: 17000000,
    },
  });

  console.log(`Seeded positions with salary ranges.`);

  // 5. Admin Employee Record
  const adminEmail = 'admin@hrms.local';

  const employee = await prisma.employee.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      companyId: company.id,
      nik: 'ADM0000001',
      fullName: 'System Administrator',
      email: adminEmail,
      currentDepartmentId: hrDept.id,
      currentPositionId: sysAdminPos.id,
      joiningDate: new Date('2024-01-01'),
      employmentStatus: 'ACTIVE',
      bankName: 'BCA',
      bankAccountNumber: '1234567890',
    },
  });

  // Sample employee 2
  const emp2 = await prisma.employee.upsert({
    where: { email: 'budi.santoso@hrms.local' },
    update: {},
    create: {
      companyId: company.id,
      nik: 'ENG0000002',
      fullName: 'Budi Santoso',
      email: 'budi.santoso@hrms.local',
      currentDepartmentId: engDept.id,
      currentPositionId: sdePos.id,
      joiningDate: new Date('2024-02-15'),
      employmentStatus: 'ACTIVE',
      bankName: 'Mandiri',
      bankAccountNumber: '9876543210',
    },
  });

  // 6. User Login Accounts (Admin, HR, Employee, Manager)
  const usersToSeed = [
    {
      email: 'admin@hrms.local',
      nik: 'ADM0000001',
      name: 'System Administrator',
      roleName: 'ADMIN',
      passwords: ['Admin@1234', 'Admin123!'],
      deptId: hrDept.id,
      posId: sysAdminPos.id,
    },
    {
      email: 'hr@hrms.local',
      nik: 'HR00000001',
      name: 'HR Manager User',
      roleName: 'HR_MANAGER',
      passwords: ['Hr@12345'],
      deptId: hrDept.id,
      posId: hrManagerPos.id,
    },
    {
      email: 'employee@hrms.local',
      nik: 'EMP0000001',
      name: 'Standard Employee User',
      roleName: 'EMPLOYEE',
      passwords: ['Emp@12345'],
      deptId: engDept.id,
      posId: sdePos.id,
    },
    {
      email: 'manager@hrms.local',
      nik: 'MGR0000001',
      name: 'Department Manager User',
      roleName: 'DEPARTMENT_HEAD',
      passwords: ['Mgr@12345'],
      deptId: engDept.id,
      posId: sdePos.id,
    },
  ];

  for (const u of usersToSeed) {
    const emp = await prisma.employee.upsert({
      where: { email: u.email },
      update: {},
      create: {
        companyId: company.id,
        nik: u.nik,
        fullName: u.name,
        email: u.email,
        currentDepartmentId: u.deptId,
        currentPositionId: u.posId,
        joiningDate: new Date('2024-01-01'),
        employmentStatus: 'ACTIVE',
        bankName: 'BCA',
        bankAccountNumber: '1234567890',
      },
    });

    const roleObj = await prisma.role.findUniqueOrThrow({
      where: { name: u.roleName },
    });

    const passwordHash = await bcrypt.hash(u.passwords[0], BCRYPT_SALT_ROUNDS);

    await prisma.user.upsert({
      where: { email: u.email },
      update: { passwordHash },
      create: {
        employeeId: emp.id,
        email: u.email,
        passwordHash,
        roles: {
          create: [{ roleId: roleObj.id }],
        },
      },
    });
  }

  // 7. Initial Attendance & Heatmap sample data
  const now = new Date();
  const todayDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));

  await prisma.attendanceLog.upsert({
    where: { id: '00000000-0000-0000-0000-999999999999' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-999999999999',
      employeeId: employee.id,
      date: todayDate,
      checkInTime: new Date(),
      status: 'PRESENT',
      checkInLatitude: -6.2088,
      checkInLongitude: 106.8456,
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
