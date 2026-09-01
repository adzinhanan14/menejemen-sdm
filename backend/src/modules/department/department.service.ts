import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentService {
  constructor(private readonly prisma: PrismaService) {}

  private async resolveCompanyId(companyId?: string): Promise<string> {
    if (companyId) return companyId;
    const company = await this.prisma.company.findFirst();
    if (!company) {
      const created = await this.prisma.company.create({
        data: { name: 'PT Contoh Sejahtera', timezone: 'Asia/Jakarta' },
      });
      return created.id;
    }
    return company.id;
  }

  async create(dto: CreateDepartmentDto) {
    const companyId = await this.resolveCompanyId(dto.companyId);
    return this.prisma.department.create({
      data: {
        companyId,
        name: dto.name,
        code: dto.code,
        parentId: dto.parentId,
        managerId: dto.managerId,
      },
    });
  }

  async findAll() {
    return this.prisma.department.findMany({
      include: {
        positions: true,
        manager: { select: { id: true, fullName: true, email: true } },
        _count: { select: { employeesCurrent: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findTree() {
    const rootDepartments = await this.prisma.department.findMany({
      where: { parentId: null },
      include: {
        children: {
          include: {
            children: true,
            positions: true,
            _count: { select: { employeesCurrent: true } },
          },
        },
        positions: true,
        _count: { select: { employeesCurrent: true } },
      },
      orderBy: { name: 'asc' },
    });
    return rootDepartments;
  }

  async findOne(id: string) {
    const department = await this.prisma.department.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
        positions: true,
        manager: true,
        _count: { select: { employeesCurrent: true } },
      },
    });
    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }
    return department;
  }

  async update(id: string, dto: UpdateDepartmentDto) {
    await this.findOne(id);
    return this.prisma.department.update({
      where: { id },
      data: {
        name: dto.name,
        code: dto.code,
        parentId: dto.parentId,
        managerId: dto.managerId,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.department.delete({ where: { id } });
  }
}
