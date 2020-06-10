import { Get, Controller, Param, Body, Request, Response } from '@nestjs/common';
import { AppService } from './app.service';
import {
  CounterMetric,
  GaugeMetric,
  HistogramMetric,
  SummaryMetric,
  InjectCounterMetric,
  InjectGaugeMetric,
  InjectHistogramMetric,
  InjectSummaryMetric,
  PromMethodCounter,
  PromInstanceCounter,
} from '../../lib';
import { PromService } from '../../lib/prom.service';

@PromInstanceCounter
class MyObj {
}

@PromInstanceCounter
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @InjectCounterMetric('index_counter') private readonly _counterMetric: CounterMetric,
    @InjectGaugeMetric('my_gauge') private readonly _gaugeMetric: GaugeMetric,
    @InjectHistogramMetric('my_histogram') private readonly _histogramMetric: HistogramMetric,
    @InjectHistogramMetric('zack_histogram') private readonly _zackHistogramMetric: HistogramMetric,
    @InjectSummaryMetric('my_summary') private readonly _summaryMetric: SummaryMetric,
    private readonly promService: PromService,
  ) {}

  @Get()
  @PromMethodCounter()
  root(): string {

    const counterMetric = this.promService.getCounterMetric('test_on_the_fly');
    counterMetric.inc(1);

    return this.appService.root();
  }

  @Get('test')
  @PromMethodCounter()
  test(): string {
    this._counterMetric.inc(1, new Date());
    new MyObj();
    return 'test';
  }

  @Get('workspaces')
  @PromMethodCounter()
  getUsers(): string {
    this._counterMetric.inc(1, new Date());
    this._gaugeMetric.inc();
    new MyObj();
    return 'ws1\nws2\nws3\n';
  }

  @Get('workspaces/:workspaceId')
  @PromMethodCounter()
  getUser(
    @Param('workspaceId') workspaceId,
    // @Request() req,
    // @Response() res,
  ): string {
    // const start = Date.now();
    // const duration = Date.now() - start; // durations in milliseconds

    // this._counterMetric.inc(1, new Date());
    // this._gaugeMetric.inc();
    // this._histogramMetric.observe(duration);
    // this._histogramMetric.labels('GGEETT');
    // this._zackHistogramMetric.labels('GET', '200', 'ws/wsId');
    // this._summaryMetric.observe(duration);
    new MyObj();

    return workspaceId;
  }
}
