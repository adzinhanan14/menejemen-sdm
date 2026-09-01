import { IsBoolean, IsEnum, IsJSON, IsOptional, IsString } from 'class-validator';
import { ComponentType } from '@prisma/client';

export class CreateSalaryComponentDto {
  @IsString()
  name: string;

  @IsEnum(ComponentType)
  type: ComponentType;

  @IsBoolean()
  @IsOptional()
  isTaxable?: boolean;

  @IsOptional()
  calculationFormula?: any;

  @IsString()
  @IsOptional()
  description?: string;
}
