import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CheckInDto } from './dto/check-in.dto';
import { CheckOutDto } from './dto/check-out.dto';
import { AttendanceStatus } from '@prisma/client';
import { todayUTC } from '../../common/utils/shared.utils';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}


  async checkIn(dto: CheckInDto) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: dto.employeeId },
    });
    if (!employee) {
      throw new NotFoundException(`Employee ${dto.employeeId} not found`);
    }

    const todayDate = todayUTC();

    const existingLog = await this.prisma.attendanceLog.findFirst({
      where: {
        employeeId: dto.employeeId,
        date: todayDate,
      },
    });

    if (existingLog && existingLog.checkInTime) {
      throw new BadRequestException('Karyawan sudah melakukan check-in hari ini.');
    }

    const now = new Date();
    // Default shift start time: 09:00 AM
    const isLate = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 15);
    const status: AttendanceStatus = isLate ? 'LATE' : 'PRESENT';

    if (existingLog) {
      return this.prisma.attendanceLog.update({
        where: { id: existingLog.id },
        data: {
          checkInTime: now,
          checkInLatitude: dto.latitude,
          checkInLongitude: dto.longitude,
          facePhotoUrl: dto.facePhotoBase64 ? dto.facePhotoBase64.substring(0, 100) + '...' : null,
          status,
        },
      });
    }

    return this.prisma.attendanceLog.create({
      data: {
        employeeId: dto.employeeId,
        date: todayDate,
        checkInTime: now,
        checkInLatitude: dto.latitude,
        checkInLongitude: dto.longitude,
        facePhotoUrl: dto.facePhotoBase64 ? dto.facePhotoBase64.substring(0, 100) + '...' : null,
        status,
      },
    });
  }

  async checkOut(dto: CheckOutDto) {
    const todayDate = todayUTC();

    const existingLog = await this.prisma.attendanceLog.findFirst({
      where: {
        employeeId: dto.employeeId,
        date: todayDate,
      },
    });

    if (!existingLog || !existingLog.checkInTime) {
      throw new BadRequestException('Belum ada data check-in untuk hari ini.');
    }

    const now = new Date();
    const diffMs = now.getTime() - existingLog.checkInTime.getTime();
    const totalWorkingMinutes = Math.max(0, Math.floor(diffMs / (1000 * 60)));

    return this.prisma.attendanceLog.update({
      where: { id: existingLog.id },
      data: {
        checkOutTime: now,
        totalWorkingMinutes,
      },
    });
  }

  async getTodayLogs() {
    const todayDate = todayUTC();
    return this.prisma.attendanceLog.findMany({
      where: { date: todayDate },
      include: {
        employee: {
          select: {
            id: true,
            fullName: true,
            nik: true,
            currentDepartment: { select: { name: true } },
          },
        },
      },
      orderBy: { checkInTime: 'desc' },
    });
  }

  async getLogs(startDate?: string, endDate?: string, employeeId?: string) {
    const where: any = {};
    if (employeeId) where.employeeId = employeeId;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    return this.prisma.attendanceLog.findMany({
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
      },
      orderBy: { date: 'desc' },
    });
  }

  async getHeatmap(month?: string) {
    const now = new Date();
    const yearMonth = month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const [year, m] = yearMonth.split('-').map(Number);

    const startOfMonth = new Date(Date.UTC(year, m - 1, 1));
    const endOfMonth = new Date(Date.UTC(year, m, 0));

    const logs = await this.prisma.attendanceLog.findMany({
      where: {
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    // Map logs by date string YYYY-MM-DD
    const heatmapData: Record<string, string> = {};
    logs.forEach((log) => {
      const dayStr = log.date.toISOString().split('T')[0];
      heatmapData[dayStr] = log.status;
    });

    return {
      month: yearMonth,
      data: heatmapData,
    };
  }
}
