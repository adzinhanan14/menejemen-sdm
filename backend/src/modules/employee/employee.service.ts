import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeeQueryDto } from './dto/employee-query.dto';
import {
  assertFound,
  buildPaginatedResult,
  PaginatedResult,
} from '../../common/utils/shared.utils';

@Injectable()
export class EmployeeService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates the employee record and its first `employee_contracts` row
   * in a single transaction, so we never end up with an employee that
   * has no contract history.
   */
  async create(dto: CreateEmployeeDto) {
    await this.assertNikAndEmailAreUnique(dto.nik, dto.email);

    const companyId = await this.resolveCompanyId(dto.companyId);

    await this.assertDepartmentAndPositionExist(dto.departmentId, dto.positionId);

    const employee = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const created = await tx.employee.create({
        data: {
          companyId,
          nik: dto.nik,
          fullName: dto.name,
          email: dto.email,
          phone: dto.phone,
          gender: dto.gender,
          birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
          currentAddress: dto.address,
          bankName: dto.bankName,
          bankAccountNumber: dto.bankAccountNumber,
          currentDepartmentId: dto.departmentId,
          currentPositionId: dto.positionId,
          joiningDate: new Date(dto.joinDate),
          employmentStatus: 'ACTIVE',
        },
      });

      const contractType = (dto.contractType as any) || 'PROBATION';

      await tx.employeeContract.create({
        data: {
          employeeId: created.id,
          departmentId: dto.departmentId,
          positionId: dto.positionId,
          contractType,
          startDate: new Date(dto.joinDate),
          baseSalary: dto.basicSalary,
          note: 'Initial contract created automatically on employee creation.',
        },
      });

      return created;
    });

    return this.findOne(employee.id);
  }

  /**
   * Filters: departmentId, status, search (matches fullName or nik).
   * Pagination: page (1-indexed), limit (max 100).
   * Sorting: sortBy / sortOrder, restricted to a safe allow-list in
   * EmployeeQueryDto so this can never be used for SQL/field injection.
   */
  async findAll(query: EmployeeQueryDto): Promise<PaginatedResult<unknown>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'desc';

    const where: Prisma.EmployeeWhereInput = {
      deletedAt: null,
      ...(query.departmentId && { currentDepartmentId: query.departmentId }),
      ...(query.status && { employmentStatus: query.status }),
      ...(query.search && {
        OR: [
          { fullName: { contains: query.search, mode: 'insensitive' } },
          { nik: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.employee.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          currentDepartment: { select: { id: true, name: true } },
          currentPosition: { select: { id: true, name: true } },
        },
      }),
      this.prisma.employee.count({ where }),
    ]);

    return buildPaginatedResult(data, total, page, limit);
  }

  async findOne(id: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: {
        currentDepartment: true,
        currentPosition: true,
        contracts: {
          orderBy: { startDate: 'desc' },
          include: {
            department: { select: { id: true, name: true } },
            position: { select: { id: true, name: true } },
          },
        },
      },
    });

    assertFound(employee, `Employee ${id}`);
    return employee;
  }

  async update(id: string, dto: UpdateEmployeeDto) {
    await this.findOne(id); // 404s early if the employee doesn't exist

    if (dto.nik || dto.email) {
      await this.assertNikAndEmailAreUnique(dto.nik, dto.email, id);
    }

    if (dto.departmentId || dto.positionId) {
      await this.assertDepartmentAndPositionExist(
        dto.departmentId,
        dto.positionId,
      );
    }

    const employee = await this.prisma.employee.update({
      where: { id },
      data: {
        nik: dto.nik,
        fullName: dto.name,
        email: dto.email,
        phone: dto.phone,
        gender: dto.gender,
        birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
        currentAddress: dto.address,
        bankName: dto.bankName,
        bankAccountNumber: dto.bankAccountNumber,
        currentDepartmentId: dto.departmentId,
        currentPositionId: dto.positionId,
        joiningDate: dto.joinDate ? new Date(dto.joinDate) : undefined,
      },
    });

    return this.findOne(employee.id);
  }

  /**
   * Business soft-delete: the employee row is kept (for payroll/audit
   * history) but flipped to RESIGNED with today's date recorded.
   * This is distinct from the schema's `deletedAt` column, which is
   * reserved for true data-retention/GDPR-style erasure.
   */
  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.employee.update({
      where: { id },
      data: {
        employmentStatus: 'RESIGNED',
        resignationDate: new Date(),
      },
    });
  }

  // ------------------------------------------------------------------
  // Helpers
  // ------------------------------------------------------------------

  private async assertNikAndEmailAreUnique(
    nik?: string,
    email?: string,
    excludeEmployeeId?: string,
  ) {
    if (!nik && !email) return;

    const existing = await this.prisma.employee.findFirst({
      where: {
        OR: [
          ...(nik ? [{ nik }] : []),
          ...(email ? [{ email }] : []),
        ],
        ...(excludeEmployeeId && { id: { not: excludeEmployeeId } }),
      },
    });

    if (!existing) return;

    if (existing.nik === nik) {
      throw new ConflictException(`NIK ${nik} is already in use`);
    }
    throw new ConflictException(`Email ${email} is already in use`);
  }

  private async assertDepartmentAndPositionExist(
    departmentId?: string,
    positionId?: string,
  ) {
    if (departmentId) {
      const department = await this.prisma.department.findUnique({
        where: { id: departmentId },
      });
      if (!department) {
        throw new BadRequestException(`Department ${departmentId} not found`);
      }
    }

    if (positionId) {
      const position = await this.prisma.position.findUnique({
        where: { id: positionId },
      });
      if (!position) {
        throw new BadRequestException(`Position ${positionId} not found`);
      }
    }
  }

  /**
   * Single-tenant fallback: if the caller didn't specify companyId,
   * use the only company in the database. Throws if there's none or
   * more than one, since at that point the caller MUST disambiguate.
   */
  private async resolveCompanyId(companyId?: string): Promise<string> {
    if (companyId) return companyId;

    const companies = await this.prisma.company.findMany({
      take: 2,
      select: { id: true },
    });

    if (companies.length === 0) {
      throw new BadRequestException(
        'No company exists yet — pass companyId explicitly or seed a company first.',
      );
    }

    if (companies.length > 1) {
      throw new BadRequestException(
        'Multiple companies exist — companyId must be specified explicitly.',
      );
    }

    return companies[0].id;
  }
}
