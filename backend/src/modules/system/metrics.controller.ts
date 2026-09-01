import { Controller, Get, Header, Res } from '@nestjs/common';
import { Response } from 'express';
import { Public } from '../../common/decorators/public.decorator';
import { MetricsService } from './metrics.service';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  /**
   * GET /metrics
   * Scraped by Prometheus every 15 s (see monitoring/prometheus.yml).
   * Marked @Public() so the JWT guard doesn't block the scraper.
   * In production you should additionally restrict this route by IP
   * at the nginx / firewall level.
   */
  @Get()
  @Public()
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  async getMetrics(@Res() res: Response): Promise<void> {
    res.set('Content-Type', this.metricsService.getContentType());
    res.end(await this.metricsService.getMetrics());
  }
}
