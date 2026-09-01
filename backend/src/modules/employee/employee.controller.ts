import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeeQueryDto } from './dto/employee-query.dto';

@Controller('employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Get()
  @Roles('ADMIN', 'HR_MANAGER', 'HR_STAFF', 'DEPARTMENT_HEAD')
  findAll(@Query() query: EmployeeQueryDto) {
    return this.employeeService.findAll(query);
  }

  @Get(':id')
  @Roles('ADMIN', 'HR_MANAGER', 'HR_STAFF', 'DEPARTMENT_HEAD', 'EMPLOYEE')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.employeeService.findOne(id);
  }

  @Post()
  @Roles('ADMIN', 'HR_MANAGER', 'HR_STAFF')
  create(@Body() dto: CreateEmployeeDto) {
    return this.employeeService.create(dto);
  }

  @Patch(':id')
  @Roles('ADMIN', 'HR_MANAGER', 'HR_STAFF')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEmployeeDto,
  ) {
    return this.employeeService.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'HR_MANAGER')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.employeeService.remove(id);
  }
}
