import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { AuthModule } from './modules/auth/auth.module';
import { EmployeeModule } from './modules/employee/employee.module';
import { SystemModule } from './modules/system/system.module';
import { DepartmentModule } from './modules/department/department.module';
import { PositionModule } from './modules/position/position.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { LeaveModule } from './modules/leave/leave.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { PayrollModule } from './modules/payroll/payroll.module';
import { RecruitmentModule } from './modules/recruitment/recruitment.module';
import { MetricsInterceptor } from './common/interceptors/metrics.interceptor';
import { MetricsService } from './modules/system/metrics.service';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    AuthModule,
    EmployeeModule,
    DepartmentModule,
    PositionModule,
    AttendanceModule,
    LeaveModule,
    DashboardModule,
    PayrollModule,
    RecruitmentModule,
    SystemModule,
  ],
  providers: [
    // Every route requires a valid JWT unless annotated with @Public()
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    // Route-level RBAC via @Roles(...)
    { provide: APP_GUARD, useClass: RolesGuard },
    // Prometheus metrics – tracks every HTTP request globally
    MetricsService,
    { provide: APP_INTERCEPTOR, useClass: MetricsInterceptor },
  ],
})
export class AppModule {}
