import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { PayrollService } from './payroll.service';
import { CreateSalaryComponentDto } from './dto/create-salary-component.dto';
import { UpdateSalaryComponentDto } from './dto/update-salary-component.dto';
import { CreateEmployeeSalarySettingDto } from './dto/create-employee-salary-setting.dto';
import { UpdateEmployeeSalarySettingDto } from './dto/update-employee-salary-setting.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

// ========== SALARY COMPONENTS CONTROLLER ==========
@Controller('salary-components')
@UseGuards(JwtAuthGuard)
export class SalaryComponentsController {
  constructor(private readonly payrollService: PayrollService) {}

  @Post()
  create(@Body() dto: CreateSalaryComponentDto) {
    return this.payrollService.createSalaryComponent(dto);
  }

  @Get()
  findAll() {
    return this.payrollService.findAllSalaryComponents();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.payrollService.findOneSalaryComponent(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSalaryComponentDto) {
    return this.payrollService.updateSalaryComponent(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.payrollService.removeSalaryComponent(id);
  }
}

// ========== EMPLOYEE SALARY SETTINGS CONTROLLER ==========
@Controller('employees')
@UseGuards(JwtAuthGuard)
export class EmployeeSalarySettingsController {
  constructor(private readonly payrollService: PayrollService) {}

  @Get(':id/salary-settings')
  getEmployeeSalarySettings(@Param('id') id: string) {
    return this.payrollService.getEmployeeSalarySettings(id);
  }

  @Post('salary-settings')
  createSalarySetting(@Body() dto: CreateEmployeeSalarySettingDto) {
    return this.payrollService.createEmployeeSalarySetting(dto);
  }

  @Patch('salary-settings/:id')
  updateSalarySetting(@Param('id') id: string, @Body() dto: UpdateEmployeeSalarySettingDto) {
    return this.payrollService.updateEmployeeSalarySetting(id, dto);
  }

  @Delete('salary-settings/:id')
  removeSalarySetting(@Param('id') id: string) {
    return this.payrollService.removeEmployeeSalarySetting(id);
  }
}


// ========== PAYROLL BATCHES CONTROLLER ==========
@Controller('payroll')
@UseGuards(JwtAuthGuard)
export class PayrollBatchesController {
  constructor(private readonly payrollService: PayrollService) {}

  @Post('batches')
  generateBatch(@Body() dto: any) {
    return this.payrollService.generatePayrollBatch(dto, dto.processedBy);
  }

  @Get('batches')
  findAllBatches() {
    return this.payrollService.findAllPayrollBatches();
  }

  @Get('batches/:id')
  findOneBatch(@Param('id') id: string) {
    return this.payrollService.findOnePayrollBatch(id);
  }

  @Patch('batches/:id/approve')
  approveBatch(@Param('id') id: string, @Body('approvedBy') approvedBy: string) {
    return this.payrollService.approvePayrollBatch(id, approvedBy);
  }

  @Patch('batches/:id/mark-paid')
  markAsPaid(@Param('id') id: string) {
    return this.payrollService.markAsPaid(id);
  }

  @Get('details/:id')
  getDetail(@Param('id') id: string) {
    return this.payrollService.getPayrollDetail(id);
  }
}
