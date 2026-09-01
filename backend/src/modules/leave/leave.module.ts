import { Module } from '@nestjs/common';
import { LeaveService } from './leave.service';
import { LeaveController, EmployeeLeaveController } from './leave.controller';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [LeaveController, EmployeeLeaveController],
  providers: [LeaveService],
  exports: [LeaveService],
})
export class LeaveModule {}
