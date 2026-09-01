import { Global, Module, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { PrismaService } from './prisma.service';
import { MetricsService } from '../modules/system/metrics.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class DatabaseModule implements OnModuleInit {
  constructor(private readonly moduleRef: ModuleRef) {}

  /** Wire MetricsService after the full DI graph is built. */
  onModuleInit() {
    try {
      const prisma = this.moduleRef.get(PrismaService, { strict: false });
      const metrics = this.moduleRef.get(MetricsService, { strict: false });
      if (prisma && metrics) {
        prisma._metricsService = metrics;
      }
    } catch {
      // MetricsService might not be in scope during tests; that's fine.
    }
  }
}

