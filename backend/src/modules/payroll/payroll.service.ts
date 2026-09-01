import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateSalaryComponentDto } from './dto/create-salary-component.dto';
import { UpdateSalaryComponentDto } from './dto/update-salary-component.dto';
import { CreateEmployeeSalarySettingDto } from './dto/create-employee-salary-setting.dto';
import { UpdateEmployeeSalarySettingDto } from './dto/update-employee-salary-setting.dto';
import { GeneratePayrollBatchDto } from './dto/generate-payroll-batch.dto';
import { Prisma } from '@prisma/client';
import { assertFound, countWorkingDays } from '../../common/utils/shared.utils';

@Injectable()
export class PayrollService {
  constructor(private readonly prisma: PrismaService) {}

  // ========== SALARY COMPONENTS ==========
  async createSalaryComponent(dto: CreateSalaryComponentDto) {
    return this.prisma.salaryComponent.create({
      data: {
        name: dto.name,
        type: dto.type,
        isTaxable: dto.isTaxable ?? false,
        calculationFormula: dto.calculationFormula || null,
        description: dto.description,
      },
    });
  }

  async findAllSalaryComponents() {
    return this.prisma.salaryComponent.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOneSalaryComponent(id: string) {
    const component = await this.prisma.salaryComponent.findUnique({
      where: { id },
    });
    if (!component) {
      throw new NotFoundException(`Salary component ${id} not found`);
    }
    return component;
  }

  async updateSalaryComponent(id: string, dto: UpdateSalaryComponentDto) {
    await this.findOneSalaryComponent(id);
    return this.prisma.salaryComponent.update({
      where: { id },
      data: {
        name: dto.name,
        type: dto.type,
        isTaxable: dto.isTaxable,
        calculationFormula: dto.calculationFormula,
        description: dto.description,
      },
    });
  }

  async removeSalaryComponent(id: string) {
    await this.findOneSalaryComponent(id);
    return this.prisma.salaryComponent.delete({ where: { id } });
  }

  // ========== EMPLOYEE SALARY SETTINGS ==========
  async createEmployeeSalarySetting(dto: CreateEmployeeSalarySettingDto) {
    return this.prisma.employeeSalarySettings.create({
      data: {
        employeeId: dto.employeeId,
        componentId: dto.componentId,
        amount: dto.amount,
        effectiveDate: new Date(dto.effectiveDate),
      },
      include: {
        component: true,
        employee: { select: { id: true, fullName: true, nik: true } },
      },
    });
  }

  async getEmployeeSalarySettings(employeeId: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
    });
    if (!employee) {
      throw new NotFoundException(`Employee ${employeeId} not found`);
    }

    const settings = await this.prisma.employeeSalarySettings.findMany({
      where: { employeeId },
      include: { component: true },
      orderBy: { effectiveDate: 'desc' },
    });

    // Calculate total salary
    const additions = settings
      .filter((s) => s.component.type === 'ADDITION')
      .reduce((sum, s) => sum + Number(s.amount), 0);

    const deductions = settings
      .filter((s) => s.component.type === 'DEDUCTION')
      .reduce((sum, s) => sum + Number(s.amount), 0);

    // Get base salary from latest contract
    const latestContract = await this.prisma.employeeContract.findFirst({
      where: { employeeId },
      orderBy: { startDate: 'desc' },
    });

    const baseSalary = latestContract ? Number(latestContract.baseSalary) : 0;
    const grossSalary = baseSalary + additions;
    const netSalary = grossSalary - deductions;

    return {
      employeeId,
      baseSalary,
      additions,
      deductions,
      grossSalary,
      netSalary,
      settings,
    };
  }

  async updateEmployeeSalarySetting(id: string, dto: UpdateEmployeeSalarySettingDto) {
    const setting = await this.prisma.employeeSalarySettings.findUnique({
      where: { id },
    });
    if (!setting) {
      throw new NotFoundException(`Salary setting ${id} not found`);
    }

    return this.prisma.employeeSalarySettings.update({
      where: { id },
      data: {
        componentId: dto.componentId,
        amount: dto.amount,
        effectiveDate: dto.effectiveDate ? new Date(dto.effectiveDate) : undefined,
      },
      include: { component: true },
    });
  }

  async removeEmployeeSalarySetting(id: string) {
    const setting = await this.prisma.employeeSalarySettings.findUnique({
      where: { id },
    });
    if (!setting) {
      throw new NotFoundException(`Salary setting ${id} not found`);
    }
    return this.prisma.employeeSalarySettings.delete({ where: { id } });
  }

  // ========== PAYROLL BATCH GENERATION ==========
  async generatePayrollBatch(dto: GeneratePayrollBatchDto, processedBy?: string) {
    // Check if batch already exists for this period
    const existingBatch = await this.prisma.payrollBatch.findFirst({
      where: {
        periodMonth: dto.periodMonth,
        periodYear: dto.periodYear,
      },
    });

    if (existingBatch) {
      return {
        success: false,
        message: 'Payroll batch already exists for this period',
        batch: existingBatch,
      };
    }

    // Create batch with PROCESSING status
    const batch = await this.prisma.payrollBatch.create({
      data: {
        periodMonth: dto.periodMonth,
        periodYear: dto.periodYear,
        status: 'PROCESSING',
        processedBy,
      },
    });

    try {
      // Get all active employees
      const employees = await this.prisma.employee.findMany({
        where: {
          employmentStatus: 'ACTIVE',
          deletedAt: null,
        },
        include: {
          contracts: {
            orderBy: { startDate: 'desc' },
            take: 1,
          },
          salarySettings: {
            include: { component: true },
          },
        },
      });

      // Calculate date range for the period
      const startDate = new Date(dto.periodYear, dto.periodMonth - 1, 1);
      const endDate = new Date(dto.periodYear, dto.periodMonth, 0);

      // ── Fix N+1: fetch ALL attendance logs for the period in ONE query ──
      const allAttendanceLogs = await this.prisma.attendanceLog.findMany({
        where: {
          date: { gte: startDate, lte: endDate },
          status: { in: ['PRESENT', 'LATE'] },
        },
        select: { employeeId: true, status: true },
      });

      // Group by employeeId for O(1) lookup inside the loop
      const attendanceByEmployee = new Map<string, number>();
      for (const log of allAttendanceLogs) {
        attendanceByEmployee.set(
          log.employeeId,
          (attendanceByEmployee.get(log.employeeId) ?? 0) + 1,
        );
      }

      let totalGrossBatch = 0;
      let totalNetBatch = 0;

      // Process each employee
      for (const employee of employees) {
        const baseSalary = employee.contracts[0]?.baseSalary
          ? Number(employee.contracts[0].baseSalary)
          : 0;

        const attendanceDays = attendanceByEmployee.get(employee.id) ?? 0;
        const workDays = countWorkingDays(startDate, endDate);

        // Calculate salary components
        const additions = employee.salarySettings
          .filter((s) => s.component.type === 'ADDITION')
          .reduce((sum, s) => sum + Number(s.amount), 0);

        const deductions = employee.salarySettings
          .filter((s) => s.component.type === 'DEDUCTION')
          .reduce((sum, s) => sum + Number(s.amount), 0);

        const grossSalary = baseSalary + additions;
        const netSalary = grossSalary - deductions;

        totalGrossBatch += grossSalary;
        totalNetBatch += netSalary;

        // Create payroll detail
        const detail = await this.prisma.payrollDetail.create({
          data: {
            batchId: batch.id,
            employeeId: employee.id,
            baseSalary,
            totalAddition: additions,
            totalDeduction: deductions,
            grossSalary,
            netSalary,
            workDays,
            attendanceDays,
          },
        });

        // ── Fix N+1: bulk-create breakdowns with createMany ──
        if (employee.salarySettings.length > 0) {
          await this.prisma.payrollDetailBreakdown.createMany({
            data: employee.salarySettings.map((setting) => ({
              detailId: detail.id,
              componentName: setting.component.name,
              componentType: setting.component.type,
              amount: Number(setting.amount),
            })),
          });
        }
      }

      // Update batch with totals and set status to DRAFT
      await this.prisma.payrollBatch.update({
        where: { id: batch.id },
        data: {
          totalGross: totalGrossBatch,
          totalNet: totalNetBatch,
          status: 'DRAFT',
        },
      });

      return {
        success: true,
        message: 'Payroll batch generated successfully',
        batchId: batch.id,
      };
    } catch (error) {
      // If error, mark batch as CANCELLED
      await this.prisma.payrollBatch.update({
        where: { id: batch.id },
        data: { status: 'CANCELLED' },
      });
      throw error;
    }
  }


  async findAllPayrollBatches() {
    return this.prisma.payrollBatch.findMany({
      orderBy: [{ periodYear: 'desc' }, { periodMonth: 'desc' }],
    });
  }

  async findOnePayrollBatch(id: string) {
    const batch = await this.prisma.payrollBatch.findUnique({
      where: { id },
      include: {
        details: {
          include: {
            employee: {
              select: {
                id: true,
                nik: true,
                fullName: true,
                email: true,
                currentDepartment: { select: { name: true } },
                currentPosition: { select: { name: true } },
              },
            },
            breakdowns: true,
          },
        },
      },
    });

    if (!batch) {
      throw new NotFoundException(`Payroll batch ${id} not found`);
    }

    return batch;
  }

  async approvePayrollBatch(id: string, approvedBy: string) {
    const batch = await this.findOnePayrollBatch(id);
    if (batch.status !== 'DRAFT') {
      throw new Error('Only DRAFT batches can be approved');
    }

    return this.prisma.payrollBatch.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedBy,
        approvedAt: new Date(),
      },
    });
  }

  async markAsPaid(id: string) {
    const batch = await this.findOnePayrollBatch(id);
    if (batch.status !== 'APPROVED') {
      throw new Error('Only APPROVED batches can be marked as paid');
    }

    return this.prisma.payrollBatch.update({
      where: { id },
      data: {
        status: 'PAID',
        paidAt: new Date(),
      },
    });
  }

  async getPayrollDetail(detailId: string) {
    const detail = await this.prisma.payrollDetail.findUnique({
      where: { id: detailId },
      include: {
        employee: {
          select: {
            id: true,
            nik: true,
            fullName: true,
            email: true,
            bankName: true,
            bankAccountNumber: true,
            currentDepartment: { select: { name: true } },
            currentPosition: { select: { name: true } },
          },
        },
        batch: true,
        breakdowns: true,
      },
    });

    if (!detail) {
      throw new NotFoundException(`Payroll detail ${detailId} not found`);
    }

    return detail;
  }
}
