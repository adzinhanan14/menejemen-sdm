import { Type } from 'class-transformer';
import { IsEnum, IsIn, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export enum EmploymentStatusDto {
  ACTIVE = 'ACTIVE',
  RESIGNED = 'RESIGNED',
  TERMINATED = 'TERMINATED',
  ON_LEAVE = 'ON_LEAVE',
}

const SORTABLE_FIELDS = ['fullName', 'nik', 'joiningDate', 'createdAt'] as const;
type SortableField = (typeof SORTABLE_FIELDS)[number];

export class EmployeeQueryDto {
  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @IsOptional()
  @IsEnum(EmploymentStatusDto)
  status?: EmploymentStatusDto;

  /** Matches against employee full name or NIK (case-insensitive). */
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsIn(SORTABLE_FIELDS)
  sortBy?: SortableField = 'createdAt';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}
