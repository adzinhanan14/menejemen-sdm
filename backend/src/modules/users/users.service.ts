import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

export interface SafeUser {
  id: string;
  email: string;
  employeeId: string;
  isActive: boolean;
  roles: string[];
}

const BCRYPT_SALT_ROUNDS = 12;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Used by AuthService.validateUser() - includes the password hash,
   * which callers must strip before returning anything to the client.
   */
  async findByEmailForAuth(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        roles: { include: { role: true } },
      },
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      employeeId: user.employeeId,
      passwordHash: user.passwordHash,
      isActive: user.isActive,
      roles: user.roles.map(
        (userRole: { role: { name: string } }) => userRole.role.name,
      ),
    };
  }

  async findByIdWithRoles(id: string): Promise<SafeUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        roles: { include: { role: true } },
      },
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      employeeId: user.employeeId,
      isActive: user.isActive,
      roles: user.roles.map(
        (userRole: { role: { name: string } }) => userRole.role.name,
      ),
    };
  }

  async findByIdSafe(id: string): Promise<SafeUser> {
    const user = await this.findByIdWithRoles(id);
    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }
    return user;
  }

  async updateLastLogin(id: string) {
    await this.prisma.user.update({
      where: { id },
      data: { lastLogin: new Date() },
    });
  }

  /**
   * Creates a login account for an existing employee. Used by the
   * `prisma/seed.ts` script to bootstrap the first admin user, and can
   * later be exposed via a protected `POST /users` admin endpoint.
   */
  async createUser(dto: CreateUserDto, roleNames: string[] = []) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new BadRequestException(
        `User with email ${dto.email} already exists`,
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);

    const roles = roleNames.length
      ? await this.prisma.role.findMany({ where: { name: { in: roleNames } } })
      : [];

    return this.prisma.user.create({
      data: {
        employeeId: dto.employeeId,
        email: dto.email,
        passwordHash,
        roles: {
          create: roles.map((role: { id: string }) => ({ roleId: role.id })),
        },
      },
      include: {
        roles: { include: { role: true } },
      },
    });
  }
}
