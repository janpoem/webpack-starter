import { resolve } from 'path';
import type { WebpackPluginInstance } from 'webpack';
import type {
  WebpackRequiredConfiguration as WRC,
  WebpackConfiguration as WC,
  WebpackDevServerConfiguration as WDSC,
  // WebpackOptimizationMinimizer,
  // WebpackOptimizationMinimizerItem,
} from './_types';
import { selectEntryFile, valueOrSetter, ValueOrSetter } from './_utils';
import type { WebpackConfigOptions } from './_types';
import { WebpackDefaults } from './defaults';

export class WebpackConfigBuilder {
  webpackConfig: WC = {};

  constructor(public options: WebpackConfigOptions) {}

  get isDevel(): boolean {
    return this.options.mode !== 'production';
  }

  mode(mode: ValueOrSetter<WRC['mode']>): this {
    this.webpackConfig.mode = valueOrSetter(
      mode,
      this.webpackConfig.mode ?? 'development',
    );
    return this;
  }

  devServer(opts: ValueOrSetter<WDSC>): this {
    this.webpackConfig.devServer = valueOrSetter(
      opts,
      this.webpackConfig.devServer ?? {},
    );
    return this;
  }

  entry(entry: ValueOrSetter<WRC['entry']>): this {
    this.webpackConfig.entry = valueOrSetter(
      entry,
      this.webpackConfig.entry ?? {},
    );
    return this;
  }

  output(output: ValueOrSetter<WRC['output']>): this {
    this.webpackConfig.output = valueOrSetter(
      output,
      this.webpackConfig.output ?? {},
    );
    return this;
  }

  devtool(devtool: ValueOrSetter<WC['devtool']>): this {
    this.webpackConfig.devtool = valueOrSetter(
      devtool,
      this.webpackConfig.devtool ?? false,
    );
    return this;
  }

  performance(performance: ValueOrSetter<WC['performance']>): this {
    this.webpackConfig.performance = valueOrSetter(
      performance,
      this.webpackConfig.performance,
    );
    return this;
  }

  cache(cache: ValueOrSetter<WC['cache']>): this {
    this.webpackConfig.cache = valueOrSetter(cache, this.webpackConfig.cache);
    return this;
  }

  externals(externals: ValueOrSetter<WC['externals']>): this {
    this.webpackConfig.externals = valueOrSetter(
      externals,
      this.webpackConfig.externals,
    );
    return this;
  }

  optimization(optimization: ValueOrSetter<WC['optimization']>): this {
    this.webpackConfig.optimization = valueOrSetter(
      optimization,
      this.webpackConfig.optimization,
    );
    return this;
  }

  // setMinimizer(minimizer: ValueOrSetter<WebpackOptimizationMinimizer>): this {
  //   if (this.webpackConfig.optimization == null) {
  //     this.webpackConfig.optimization = this.defaults.optimization(
  //       this.isDevel,
  //     );
  //   }
  //   if (this.webpackConfig.optimization != null) {
  //     this.webpackConfig.optimization.minimizer = valueOrSetter(
  //       minimizer,
  //       this.webpackConfig.optimization.minimizer ?? [],
  //     );
  //   }
  //   return this;
  // }

  // addMinimizer(...items: WebpackOptimizationMinimizerItem[]): this {
  //   if (this.webpackConfig.optimization == null) {
  //     this.webpackConfig.optimization = this.defaults.optimization(
  //       this.isDevel,
  //     );
  //   }
  //   if (this.webpackConfig.optimization != null) {
  //     if (
  //       this.webpackConfig.optimization.minimizer == null ||
  //       !Array.isArray(this.webpackConfig.optimization.minimizer)
  //     ) {
  //       this.webpackConfig.optimization.minimizer = [];
  //     }
  //     if (this.webpackConfig.optimization.minimizer != null) {
  //       this.webpackConfig.optimization.minimizer.concat(items.filter(Boolean));
  //     }
  //   }
  //   return this;
  // }

  resolve(value: ValueOrSetter<WC['resolve']>): this {
    this.webpackConfig.resolve = valueOrSetter(
      value,
      this.webpackConfig.resolve,
    );
    return this;
  }

  module(value: ValueOrSetter<WC['module']>): this {
    this.webpackConfig.module = valueOrSetter(value, this.webpackConfig.module);
    return this;
  }

  plugins(plugins: ValueOrSetter<WC['plugins']>): this {
    this.webpackConfig.plugins = valueOrSetter(
      plugins,
      this.webpackConfig.plugins ?? [],
    );
    return this;
  }

  addPlugin(plugin: WebpackPluginInstance): this {
    if (this.webpackConfig.plugins == null) {
      this.webpackConfig.plugins = [];
    }
    if (this.webpackConfig.plugins != null) {
      this.webpackConfig.plugins.push(plugin);
    }
    return this;
  }

  initConfig(vars?: WebpackDefaults): WC {
    vars = vars ?? new WebpackDefaults();
    vars.setBuilder(this);
    const { root, mode, entryName, entryFile } = this.options;
    const isDevel = this.isDevel;
    this.mode(mode)
      .entry({
        [entryName]: selectEntryFile(root, entryFile),
      })
      .output({
        path: resolve(root, `dist`),
        filename: vars.jsPathOf('[name].js'),
        chunkFilename: vars.jsPathOf('[name].[chunkhash:8].chunk.js'),
        pathinfo: isDevel,
      })
      .devtool(isDevel ? 'eval-source-map' : false)
      .devServer({
        historyApiFallback: true,
        hot: true,
        static: {
          directory: resolve(root, 'public'),
        },
      })
      .performance(false)
      .cache({ type: 'memory' })
      .externals(undefined)
      .optimization(vars.optimization(isDevel))
      .resolve(vars.resolve())
      .module(vars.module(this.options.rules))
      .plugins(vars.plugins(this.options.plugins));
    return this.webpackConfig;
  }

  config(config: ValueOrSetter<WC>): this {
    this.webpackConfig = valueOrSetter(config, this.webpackConfig);
    return this;
  }

  export(): WC {
    return this.webpackConfig;
  }
}
