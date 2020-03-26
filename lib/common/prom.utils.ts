
import * as client from 'prom-client';
import { IMetricArguments } from '../interfaces';

export function getMetricToken(type: string, name: string) {
  return `${name}${type}`;
}

export function getRegistryName(name: string) {
  return `${name}PromRegistry`;
}

export function getOptionsName(name: string) {
  return `${name}PromOptions`;
}

export function getDefaultRegistry() {
  return client.register;
}

export const findOrCreateMetric = ({
  name,
  type,
  help,
  labelNames,
  registry,
}: {
  name: string;
  type: string;
  help?: string;
  labelNames?: string[];
  registry?: client.Registry;
}): client.Metric => {

  const register = registry ?? client.register;

  let metric: client.Metric = register.getSingleMetric(name);
  if (!metric) {
    return new client.Counter({
      name: name,
      help: help || `${name} ${type}`,
      labelNames,
    });
  }

  if (metric instanceof client.Counter === false) {
    return new client.Counter({
      name: getMetricToken(type, name),
      help: help || `${name} ${type}`,
    });
  }

  return metric;
}

export const findOrCreateCounter = ({
  name,
  help,
  labelNames,
  registry,
}: IMetricArguments): client.Counter => {
  return findOrCreateMetric({
    name,
    help,
    type: `Counter`,
    labelNames,
    registry,
  }) as client.Counter;
}

export const findOrCreateGauge = ({
  name,
  help,
  labelNames,
  registry,
}: IMetricArguments): client.Gauge => {
  return findOrCreateMetric({
    name,
    help,
    type: `Gauge`,
    labelNames,
    registry,
  }) as client.Gauge;
}

export const findOrCreateHistogram = ({
  name,
  help,
  labelNames,
  registry,
}: IMetricArguments): client.Histogram => {
  return findOrCreateMetric({
    name,
    help,
    type: `Histogram`,
    labelNames,
    registry,
  }) as client.Histogram;
}

export const findOrCreateSummary = ({
  name,
  help,
  labelNames,
  registry,
}: IMetricArguments): client.Summary => {
  return findOrCreateMetric({
    name,
    help,
    type: `Summary`,
    labelNames,
    registry,
  }) as client.Summary;
}
