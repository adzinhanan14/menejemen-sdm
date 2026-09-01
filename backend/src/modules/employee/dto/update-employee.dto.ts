import { PartialType } from '@nestjs/mapped-types';
import { CreateEmployeeDto } from './create-employee.dto';

/**
 * All fields optional. Note: `basicSalary` is accepted here for DTO
 * completeness, but EmployeeService.update() intentionally ignores it
 * — salary changes should go through the employee_contracts mutation
 * flow (POST /employees/:id/contracts, not yet implemented) so salary
 * history is preserved instead of being silently overwritten.
 */
export class UpdateEmployeeDto extends PartialType(CreateEmployeeDto) {}
