import { PartialType } from '@nestjs/mapped-types';
import { CreateEmployeeSalarySettingDto } from './create-employee-salary-setting.dto';

export class UpdateEmployeeSalarySettingDto extends PartialType(CreateEmployeeSalarySettingDto) {}
