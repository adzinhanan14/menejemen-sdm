import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { MetricsService } from '../modules/system/metrics.service';

/**
 * Wraps PrismaClient so it participates in Nest's lifecycle:
 * connects on module init, disconnects cleanly on shutdown.
 * Inject this instead of instantiating PrismaClient directly.
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: ['warn', 'error'],
    });

    // Register query-duration middleware for Prometheus metrics.
    // MetricsService is resolved lazily after construction via the
    // 'metricsService' property set by DatabaseModule, so we capture
    // it inside the closure.
    this.$use(async (params, next) => {
      const start = Date.now();
      const result = await next(params);
      const elapsed = (Date.now() - start) / 1000;

      // metricsService may not be set yet during tests / bootstrap
      if (this._metricsService) {
        this._metricsService.dbQueryDurationSeconds.observe(
          {
            operation: params.action,
            model: params.model ?? 'unknown',
          },
          elapsed,
        );
      }

      return result;
    });
  }

  /** Set by DatabaseModule after DI graph is resolved. */
  // eslint-disable-next-line @typescript-eslint/naming-convention
  _metricsService?: MetricsService;

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Connected to database');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Disconnected from database');
  }
}

