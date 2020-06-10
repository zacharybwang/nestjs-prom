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
      withDefaultsMetrics: false, // options for cpu info, heap space size info, etc
      withDefaultController: true,
      useHttpCounterMiddleware: true,
    }),
    PromModule.forMetrics([
      // {
      //   type: MetricType.Counter,
      //   configuration: {
      //     name: 'index_counter',
      //     help: 'index_counter a simple counter',
      //   },
      // },
      {
        type: MetricType.Histogram,
        configuration: {
          name: 'my_histogram',
          help: 'my_histogram a simple histogram',
          // labelNames: ['method'], // Uncomment labelNames to make the histogram metric disappear          
        }
      },
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
