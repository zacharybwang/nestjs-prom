import { Injectable, NestMiddleware } from "@nestjs/common";
import { Counter, Histogram } from "prom-client";
import { InjectCounterMetric, InjectHistogramMetric } from "../common";

@Injectable()
export class InboundMiddleware implements NestMiddleware {

  constructor(
    @InjectCounterMetric('http_requests_total') private readonly _counter: Counter,
    @InjectHistogramMetric('zack_histogram') private readonly _histogram: Histogram,
  ) {}

  use (req, res, next) {

    const url = req.baseUrl;
    const method = req.method;

    // ignore favicon
    if (url == '/favicon.ico') {
      next();
      return ;
    }

    // ignore metrics itself
    // TODO: need improvment to check correctly our current controller
    if (url.match(/\/metrics(\?.*?)?$/)) {
      next();
      return ;
    }

    const labelValues = {
      method,
      status: res.statusCode,
      path: url,
    };

    this._counter.inc(labelValues, 1, new Date());
    // this._histogram.labels(labelValues, 1, new Date());
    // this._histogram.labels()
    this._histogram.labels(method, '222', url);

    next();
  }
}
