import { IsInt, Max, Min } from 'class-validator';

export class GeneratePayrollBatchDto {
  @IsInt()
  @Min(1)
  @Max(12)
  periodMonth: number;

  @IsInt()
  @Min(2020)
  @Max(2030)
  periodYear: number;
}
