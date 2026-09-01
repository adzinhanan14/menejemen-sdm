import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { LeaveWorkflowDto } from './dto/leave-workflow.dto';

@Injectable()
export class LeaveService {
  constructor(private readonly prisma: PrismaService) {}

  async getLeaveTypes() {
    return this.prisma.leaveType.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async getEmployeeQuota(employeeId: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
    });
    if (!employee) {
      throw new NotFoundException(`Employee ${employeeId} not found`);
    }

    const leaveTypes = await this.prisma.leaveType.findMany();
    const approvedApplications = await this.prisma.leaveApplication.findMany({
      where: {
        employeeId,
        status: 'APPROVED',
      },
    });

    const result = leaveTypes.map((type) => {
      const usedDays = approvedApplications
        .filter((app) => app.leaveTypeId === type.id)
        .reduce((sum, app) => sum + app.totalDays, 0);

      const remaining = Math.max(0, type.quotaPerYear - usedDays);
      return {
        leaveTypeId: type.id,
        leaveTypeName: type.name,
        quotaPerYear: type.quotaPerYear,
        usedDays,
        remainingDays: remaining,
      };
    });

    return result;
  }

  async createApplication(dto: CreateLeaveDto) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: dto.employeeId },
    });
    if (!employee) {
      throw new NotFoundException(`Employee ${dto.employeeId} not found`);
    }

    const leaveType = await this.prisma.leaveType.findUnique({
      where: { id: dto.leaveTypeId },
    });
    if (!leaveType) {
      throw new NotFoundException(`LeaveType ${dto.leaveTypeId} not found`);
    }

    // Check remaining quota
    const quotas = await this.getEmployeeQuota(dto.employeeId);
    const targetQuota = quotas.find((q) => q.leaveTypeId === dto.leaveTypeId);

    if (targetQuota && dto.totalDays > targetQuota.remainingDays) {
      throw new BadRequestException(
        `Kuota cuti tidak mencukupi. Sisa kuota ${leaveType.name}: ${targetQuota.remainingDays} hari.`,
      );
    }

    return this.prisma.leaveApplication.create({
      data: {
        employeeId: dto.employeeId,
        leaveTypeId: dto.leaveTypeId,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        totalDays: dto.totalDays,
        reason: dto.reason,
        attachment: dto.attachment,
        status: 'PENDING',
      },
      include: {
        employee: { select: { id: true, fullName: true, nik: true } },
        leaveType: true,
      },
    });
  }

  async findAll(status?: string, employeeId?: string) {
    const where: any = {};
    if (status) where.status = status;
    if (employeeId) where.employeeId = employeeId;

    return this.prisma.leaveApplication.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            fullName: true,
            nik: true,
            currentDepartment: { select: { name: true } },
          },
        },
        leaveType: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async processWorkflow(id: string, dto: LeaveWorkflowDto) {
    const application = await this.prisma.leaveApplication.findUnique({
      where: { id },
    });
    if (!application) {
      throw new NotFoundException(`Leave application ${id} not found`);
    }

    return this.prisma.leaveApplication.update({
      where: { id },
      data: {
        status: dto.status,
        notes: dto.notes,
        approvedBy: dto.approvedBy,
      },
      include: {
        employee: { select: { id: true, fullName: true } },
        leaveType: true,
      },
    });
  }
}
