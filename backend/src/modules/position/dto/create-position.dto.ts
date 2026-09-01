import { IsNumber, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class CreatePositionDto {
  @IsUUID()
  departmentId: string;

  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  jobLevel?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  baseSalaryRangeMin?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  baseSalaryRangeMax?: number;
}
