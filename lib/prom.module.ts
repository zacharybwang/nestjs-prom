import { Module, DynamicModule } from '@nestjs/common';
import { PromCoreModule } from './prom-core.module';
import { PromModuleOptions, MetricType, MetricTypeConfigurationInterface } from './interfaces';
import { createPromCounterProvider, createPromGaugeProvider, createPromHistogramProvider, createPromSummaryProvider } from './prom.providers';
import * as client from 'prom-client';
import { PromController } from './prom.controller';
import { PromService } from './prom.service';

@Module({})
export class PromModule {

  static forRoot(
    options: PromModuleOptions = {},
  ): DynamicModule {

    const {
      withDefaultController,
      useHttpCounterMiddleware,
      ...promOptions
    } = options;

    const moduleForRoot: DynamicModule = {
      module: PromModule,
      imports: [PromCoreModule.forRoot(options)],
      controllers: [],
      exports: [
        PromService,
      ],
      providers: [
        PromService,
      ],
    };

    // default push default controller
    if (withDefaultController !== false) {
      moduleForRoot.controllers = [...moduleForRoot.controllers, PromController.forRoot(options.customUrl || 'metrics')];
    }

    // if want to use the http counter
    if (useHttpCounterMiddleware) {
      const inboundProvider = createPromCounterProvider({
        name: 'http_requests_total',
        help: 'http_requests_total Number of inbound request',
        labelNames: ['method', 'status', 'path']
      });

      const inboundProviderZ = createPromHistogramProvider({
        name: 'zack_histogram',
        help: 'zack_histogram Number of inbound request',
        labelNames: ['method', 'status', 'path']
      });

      moduleForRoot.providers = [...moduleForRoot.providers , inboundProvider, inboundProviderZ];
      moduleForRoot.exports = [...moduleForRoot.exports, inboundProvider, inboundProviderZ];
    }

    return moduleForRoot;
  }

  static forMetrics(
    metrics: MetricTypeConfigurationInterface[],
  ): DynamicModule {

    const providers = metrics.map((entry) => {
      switch (entry.type) {
        case MetricType.Counter:
          return createPromCounterProvider(entry.configuration);
        case MetricType.Gauge:
          return createPromGaugeProvider(entry.configuration);
        case MetricType.Histogram: {
          console.log('zack entry.configuration in prom module');
          console.log(entry.configuration);

          return createPromHistogramProvider(entry.configuration);
        }
        case MetricType.Summary:
          return createPromSummaryProvider(entry.configuration);
        default:
          throw new ReferenceError(`The type ${entry.type} is not supported`);
      }
    });

    return {
      module: PromModule,
      providers: providers,
      exports: providers,
    };
  }

  static forCounter(
    configuration: client.CounterConfiguration,
  ): DynamicModule {
    const provider = createPromCounterProvider(configuration);
    return {
      module: PromModule,
      providers: [provider],
      exports: [provider],
    };
  }

  static forGauge(
    configuration: client.GaugeConfiguration,
  ): DynamicModule {
    const provider = createPromGaugeProvider(configuration);
    return {
      module: PromModule,
      providers: [provider],
      exports: [provider],
    };
  }

  static forHistogram(
    configuration: client.HistogramConfiguration
  ): DynamicModule {
    const provider = createPromHistogramProvider(configuration);

    console.log('zack configuration in prom module');
    console.log(configuration);

    return {
      module: PromModule,
      providers: [provider],
      exports: [provider],
    };
  }

  static forSummary(
    configuration: client.SummaryConfiguration
  ): DynamicModule {
    const provider = createPromSummaryProvider(configuration);
    return {
      module: PromModule,
      providers: [provider],
      exports: [provider],
    };
  }
}
