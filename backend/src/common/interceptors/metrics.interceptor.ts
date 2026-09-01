import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { MetricsService } from '../../modules/system/metrics.service';

/**
 * Intercepts every HTTP request and records:
 *  - http_requests_total{method, route, status}
 *  - http_request_duration_seconds{method, route, status}
 *
 * Registered globally in AppModule so it applies to ALL controllers
 * (including the /metrics endpoint itself, so we get a self-referential
 * counter — intentional and harmless).
 */
@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    const start = Date.now();
    const method = req.method;
    // Use the route pattern rather than the concrete path to avoid
    // cardinality explosion (e.g. /api/v1/employees/:id not the UUID itself)
    const route = (req.route?.path as string | undefined) ?? req.path;

    const end = this.metricsService.httpRequestDurationSeconds.startTimer({
      method,
      route,
    });

    return next.handle().pipe(
      tap({
        next: () => {
          const status = String(res.statusCode);
          end({ status });
          this.metricsService.httpRequestsTotal.inc({ method, route, status });
        },
        error: (err) => {
          const status = String(err?.status ?? err?.statusCode ?? 500);
          const elapsed = (Date.now() - start) / 1000;
          this.metricsService.httpRequestDurationSeconds.observe(
            { method, route, status },
            elapsed,
          );
          this.metricsService.httpRequestsTotal.inc({ method, route, status });
        },
      }),
    );
  }
}
