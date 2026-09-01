import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { LeaveService } from './leave.service';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { LeaveWorkflowDto } from './dto/leave-workflow.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('leave-applications')
@UseGuards(JwtAuthGuard)
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  @Get('types')
  getLeaveTypes() {
    return this.leaveService.getLeaveTypes();
  }

  @Post()
  create(@Body() dto: CreateLeaveDto) {
    return this.leaveService.createApplication(dto);
  }

  @Get()
  findAll(@Query('status') status?: string, @Query('employeeId') employeeId?: string) {
    return this.leaveService.findAll(status, employeeId);
  }

  @Put(':id/workflow')
  processWorkflow(@Param('id') id: string, @Body() dto: LeaveWorkflowDto) {
    return this.leaveService.processWorkflow(id, dto);
  }
}

@Controller('employees')
@UseGuards(JwtAuthGuard)
export class EmployeeLeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  @Get(':id/leave-quota')
  getLeaveQuota(@Param('id') id: string) {
    return this.leaveService.getEmployeeQuota(id);
  }
}
