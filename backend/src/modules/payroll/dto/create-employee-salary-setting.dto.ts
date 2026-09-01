import { IsDateString, IsNumber, IsUUID } from 'class-validator';

export class CreateEmployeeSalarySettingDto {
  @IsUUID()
  employeeId: string;

  @IsUUID()
  componentId: string;

  @IsNumber()
  amount: number;

  @IsDateString()
  effectiveDate: string;
}
