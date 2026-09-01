import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const totalEmployees = await this.prisma.employee.count({
      where: { deletedAt: null },
    });

    const now = new Date();
    const todayDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));

    const employeesPresentToday = await this.prisma.attendanceLog.count({
      where: {
        date: todayDate,
        status: { in: ['PRESENT', 'LATE'] },
      },
    });

    const pendingLeaves = await this.prisma.leaveApplication.count({
      where: { status: 'PENDING' },
    });

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(now.getFullYear() - 1);

    const resignedInLastYear = await this.prisma.employee.count({
      where: {
        employmentStatus: 'RESIGNED',
        resignationDate: { gte: oneYearAgo },
      },
    });

    const turnoverRate = totalEmployees > 0
      ? Number(((resignedInLastYear / totalEmployees) * 100).toFixed(1))
      : 0;

    return {
      totalEmployees,
      employeesPresentToday,
      pendingLeaves,
      turnoverRate,
    };
  }

  async getOrgChartData() {
    const departments = await this.prisma.department.findMany({
      include: {
        children: {
          include: {
            children: true,
            _count: { select: { employeesCurrent: true } },
          },
        },
        _count: { select: { employeesCurrent: true } },
      },
      orderBy: { name: 'asc' },
    });

    const rootDepts = departments.filter((d) => !d.parentId);

    const colors = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#3b82f6'];

    const formatNode = (dept: any, index: number, level: number, parentPos = [0, 0, 0]) => {
      const radius = 3 + level * 2.5;
      const angle = (index / Math.max(1, rootDepts.length)) * Math.PI * 2;
      const x = parentPos[0] + (level === 0 ? 0 : Math.cos(angle) * radius);
      const y = parentPos[1] - level * 2.5;
      const z = parentPos[2] + (level === 0 ? 0 : Math.sin(angle) * radius);

      const childrenNodes = (dept.children || []).map((child: any, cIdx: number) =>
        formatNode(child, cIdx, level + 1, [x, y, z]),
      );

      return {
        id: dept.id,
        name: dept.name,
        code: dept.code,
        count: dept._count?.employeesCurrent || 0,
        position: [x, y, z],
        size: Math.max(0.6, 0.4 + (dept._count?.employeesCurrent || 0) * 0.1),
        color: colors[index % colors.length],
        children: childrenNodes,
      };
    };

    return rootDepts.map((d, idx) => formatNode(d, idx, 0));
  }

  async getActivities(limit = 10) {
    const logs = await this.prisma.activityLog.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    if (logs.length > 0) {
      return logs;
    }

    // Fallback recent activity logs generated from employees/attendance/leaves
    const recentEmployees = await this.prisma.employee.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { fullName: true, createdAt: true },
    });

    const recentLeaves = await this.prisma.leaveApplication.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { employee: { select: { fullName: true } }, leaveType: true },
    });

    const activities: Array<{ id: string; action: string; description: string; createdAt: Date }> = [];

    recentEmployees.forEach((emp) => {
      activities.push({
        id: `emp-${emp.fullName}`,
        action: 'KARYAWAN_BARU',
        description: `Karyawan baru ${emp.fullName} telah ditambahkan ke sistem.`,
        createdAt: emp.createdAt,
      });
    });

    recentLeaves.forEach((leave) => {
      activities.push({
        id: `leave-${leave.id}`,
        action: 'PENGAJUAN_CUTI',
        description: `${leave.employee.fullName} mengajukan ${leave.leaveType.name} (${leave.totalDays} hari).`,
        createdAt: leave.createdAt,
      });
    });

    return activities
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }
}
