import { Module } from '@nestjs/common';
import { SystemController } from './system.controller';
import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';

@Module({
  controllers: [SystemController, MetricsController],
  providers: [MetricsService],
  exports: [MetricsService],
})
export class SystemModule {}
