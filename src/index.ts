import { WebpackConfigOptions } from './_types';
import { WebpackConfig } from './config';

export * from './_types';
export * from './config';

export function webpackConfig(options: WebpackConfigOptions) {
  return new WebpackConfig(options);
}
