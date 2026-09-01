import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';

@Injectable()
export class PositionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePositionDto) {
    return this.prisma.position.create({
      data: {
        departmentId: dto.departmentId,
        name: dto.name,
        jobLevel: dto.jobLevel,
        baseSalaryRangeMin: dto.baseSalaryRangeMin,
        baseSalaryRangeMax: dto.baseSalaryRangeMax,
      },
    });
  }

  async findAll(departmentId?: string) {
    return this.prisma.position.findMany({
      where: departmentId ? { departmentId } : {},
      include: {
        department: { select: { id: true, name: true, code: true } },
        _count: { select: { employeesCurrent: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const position = await this.prisma.position.findUnique({
      where: { id },
      include: {
        department: true,
        _count: { select: { employeesCurrent: true } },
      },
    });
    if (!position) {
      throw new NotFoundException(`Position with ID ${id} not found`);
    }
    return position;
  }

  async update(id: string, dto: UpdatePositionDto) {
    await this.findOne(id);
    return this.prisma.position.update({
      where: { id },
      data: {
        departmentId: dto.departmentId,
        name: dto.name,
        jobLevel: dto.jobLevel,
        baseSalaryRangeMin: dto.baseSalaryRangeMin,
        baseSalaryRangeMax: dto.baseSalaryRangeMax,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.position.delete({ where: { id } });
  }
}
