import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  Counter,
  Histogram,
  Registry,
  collectDefaultMetrics,
  register,
} from 'prom-client';

@Injectable()
export class MetricsService implements OnModuleInit {
  private readonly registry: Registry;

  // ── Custom counters & histograms ────────────────────────────────────
  readonly httpRequestsTotal: Counter<string>;
  readonly httpRequestDurationSeconds: Histogram<string>;
  readonly dbQueryDurationSeconds: Histogram<string>;

  constructor() {
    this.registry = register;

    // Clear existing metrics on hot-reload (NestJS dev mode)
    // In production this guard is a no-op but prevents double-registration errors.
    const existing = this.registry.getSingleMetric('http_requests_total');

    if (!existing) {
      this.httpRequestsTotal = new Counter({
        name: 'http_requests_total',
        help: 'Total number of HTTP requests',
        labelNames: ['method', 'route', 'status'],
        registers: [this.registry],
      });

      this.httpRequestDurationSeconds = new Histogram({
        name: 'http_request_duration_seconds',
        help: 'Duration of HTTP requests in seconds',
        labelNames: ['method', 'route', 'status'],
        buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
        registers: [this.registry],
      });

      this.dbQueryDurationSeconds = new Histogram({
        name: 'db_query_duration_seconds',
        help: 'Duration of database queries in seconds',
        labelNames: ['operation', 'model'],
        buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5],
        registers: [this.registry],
      });
    } else {
      // Re-use existing metrics (HMR / test scenarios)
      this.httpRequestsTotal = this.registry.getSingleMetric(
        'http_requests_total',
      ) as Counter<string>;
      this.httpRequestDurationSeconds = this.registry.getSingleMetric(
        'http_request_duration_seconds',
      ) as Histogram<string>;
      this.dbQueryDurationSeconds = this.registry.getSingleMetric(
        'db_query_duration_seconds',
      ) as Histogram<string>;
    }
  }

  onModuleInit() {
    // Collect default Node.js metrics (memory, cpu, gc, event loop lag…)
    try {
      collectDefaultMetrics({ register: this.registry });
    } catch {
      // Already registered (e.g. in test suites / HMR)
    }
  }

  /** Expose the full Prometheus text format for scraping. */
  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  /** Returns the content-type header value expected by Prometheus. */
  getContentType(): string {
    return this.registry.contentType;
  }
}
