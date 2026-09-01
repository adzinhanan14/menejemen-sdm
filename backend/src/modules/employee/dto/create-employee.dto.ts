import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export enum GenderDto {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

export class CreateEmployeeDto {
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name: string;

  @IsString()
  @MinLength(3)
  @MaxLength(20)
  nik: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsPhoneNumber('ID')
  phone?: string;

  @IsOptional()
  @IsEnum(GenderDto)
  gender?: GenderDto;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsString()
  address?: string;

  /**
   * Optional: only needed in a multi-company setup. If omitted, the
   * service falls back to the single company in the database (see
   * EmployeeService.resolveCompanyId).
   */
  @IsOptional()
  @IsString()
  companyId?: string;

  @IsString()
  departmentId: string;

  @IsString()
  positionId: string;

  @IsDateString()
  joinDate: string;

  @IsOptional()
  @IsString()
  contractType?: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  basicSalary: number;

  @IsOptional()
  @IsString()
  bankName?: string;

  @IsOptional()
  @IsString()
  bankAccountNumber?: string;
}

