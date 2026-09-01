import { Module } from '@nestjs/common';
import { PayrollService } from './payroll.service';
import { 
  SalaryComponentsController, 
  EmployeeSalarySettingsController,
  PayrollBatchesController 
} from './payroll.controller';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [
    SalaryComponentsController, 
    EmployeeSalarySettingsController,
    PayrollBatchesController
  ],
  providers: [PayrollService],
  exports: [PayrollService],
})
export class PayrollModule {}
