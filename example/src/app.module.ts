import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PromModule, MetricType, PromController } from '../../lib';
import { InboundMiddleware } from '../../lib/middleware/inbound.middleware';

@Module({
  imports: [
    PromModule.forRoot({
      defaultLabels: {
        app: 'v1.0.0',
      },
      withDefaultsMetrics: true,
      withDefaultController: true,
      useHttpCounterMiddleware: true,
    }),
    PromModule.forMetrics([
      {
        type: MetricType.Counter,
        configuration: {
          name: 'index_counter',
          help: 'index_counter a simple counter',
        },
      },
      {
        type: MetricType.Gauge,
        configuration: {
          name: 'my_gauge',
          help: 'my_gauge a simple gauge',
        }
      },
      {
        type: MetricType.Histogram,
        configuration: {
          name: 'my_histogram',
          help: 'my_histogram a simple histogram',
          labelNames: ['method'],
        }
      },
      {
        type: MetricType.Histogram,
        configuration: {
          name: 'zack2_histogram',
          help: 'zack2_histogram a simple histogram',
        }
      },
      {
        type: MetricType.Summary,
        configuration: {
          name: 'my_summary',
          help: 'my_summary a simple summary',
        }
      }
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(InboundMiddleware)
      .exclude({
        path: '/metrics',
        method: RequestMethod.GET,
      })
      .forRoutes('*');
  }
}
