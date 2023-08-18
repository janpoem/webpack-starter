import { resolve } from 'path';
import type { Config as SwcConfig } from '@swc/core';
import type { Config as SvgrConfig } from '@svgr/core';
import type { Config as PostCSSConfig } from 'postcss-load-config';
import * as process from 'process';
import {
  WebpackConfigOptions,
  WebpackMode,
  WebpackRequiredConfiguration as WRC,
  WebpackDevServerConfiguration as WDSC,
  WebpackConfiguration as WC,
  WebpackOptimizationMinimizer,
  WebpackSplitChunks,
  WebpackLoaderRule,
  UseCSSLoaderOptions,
  CSSLoaderOptions,
  WebpackLoaderRecord,
  WebpackLoaderKey,
  WebpackPluginRecord,
} from './_types';
import {
  isFile,
  selectEntryFile,
  valueOrSetter,
  ValueOrSetter,
} from './_utils';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const TerserPlugin = require('terser-webpack-plugin');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const CSSMinimizerPlugin = require('css-minimizer-webpack-plugin');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const getCSSModuleLocalIdent = require('react-dev-utils/getCSSModuleLocalIdent');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const MiniCSSExtractPlugin = require('mini-css-extract-plugin');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const PostCSSPresetEnv = require('postcss-preset-env');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const PostCSSFlex = require('postcss-flexbugs-fixes');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { DefinePlugin } = require('webpack');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const DotenvPlugin = require('dotenv-webpack');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const HTMLWebpackPlugin = require('html-webpack-plugin');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const WebpackShellPluginNext = require('webpack-shell-plugin-next');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const CopyPlugin = require('copy-webpack-plugin');

export class WebpackConfig {
  options: WebpackConfigOptions = {
    mode: 'development',
    entryName: 'app',
    root: process.cwd(),
    runtime: {},
  };

  mode: WebpackMode = 'development';

  devServer: WDSC = {};

  entry: WRC['entry'] = {};

  output: WRC['output'] = {};

  devtool: WC['devtool'];

  performance: WC['performance'];

  cache: WC['cache'] = { type: 'memory' };

  externals: WC['externals'];

  optimization: WC['optimization'];

  minimizer: WebpackOptimizationMinimizer = [];

  splitChunks: WebpackSplitChunks = {
    cacheGroups: {},
  };

  loaders: WebpackLoaderRecord = {};

  useLoaders: WebpackLoaderKey[] = [
    'svg',
    'img',
    'swc',
    'css',
    'cssModule',
    'file',
  ];

  plugins: WebpackPluginRecord = {};

  constructor(options?: Partial<WebpackConfigOptions>) {
    if (options != null) {
      Object.assign(this.options, options);
    }
    this.mode = this.options.mode;
    this.devServer = {
      historyApiFallback: true,
      hot: true,
      static: {
        directory: resolve(this.options.root, 'public'),
      },
    };
    this.entry = {
      [this.options.entryName]: selectEntryFile(
        this.options.root,
        this.options.entryFile,
      ),
    };
    this.output = {
      path: resolve(this.options.root, `dist`),
      filename: this.jsPathOf('[name].js'),
      chunkFilename: this.jsPathOf('[name].[chunkhash:8].chunk.js'),
      pathinfo: this.isDevel,
    };
    this.minimizer = [
      new TerserPlugin({
        terserOptions: {
          parse: {
            // we want terser to parse ecma 8 code. However, we don't want it
            // to apply any minfication steps that turns valid ecma 5 code
            // into invalid ecma 5 code. This is why the 'compress' and 'output'
            // sections only apply transformations that are ecma 5 safe
            // https://github.com/facebook/create-react-app/pull/4234
            ecma: 2018,
          },
          compress: {
            ecma: 5,
            // warnings: false,
            // Disabled because of an issue with Uglify breaking seemingly valid code:
            // https://github.com/facebook/create-react-app/issues/2376
            // Pending further investigation:
            // https://github.com/mishoo/UglifyJS2/issues/2011
            comparisons: false,
            // Disabled because of an issue with Terser breaking valid code:
            // https://github.com/facebook/create-react-app/issues/5250
            // Pending futher investigation:
            // https://github.com/terser-js/terser/issues/120
            inline: 2,
          },
          mangle: {
            safari10: true,
          },
          output: {
            ecma: 5,
            comments: false,
            // Turned on because emoji and regex is not minified properly using default
            // https://github.com/facebook/create-react-app/issues/2488
            ascii_only: true,
          },
        },
        // Use multi-process parallel running to improve the build speed
        // Default number of concurrent runs: os.cpus().length - 1
        parallel: true,
      }),
      new CSSMinimizerPlugin(),
    ];
    this.loaders = {
      svg: this.svgrLoader(),
      img: this.imgAsset(),
      swc: this.swcLoader(),
      css: this.cssLoader(/\.css$/, /\.module\.css$/),
      cssModule: this.cssLoader(/\.css$/, /\.module\.css$/, {
        cssModule: true,
      }),
      file: this.fileLoader(),
    };
    this.plugins = {
      define: new DefinePlugin({
        APP_NAME: JSON.stringify(
          this.options.appName || this.options.entryName || 'Webpack App',
        ),
        APP_MODE: JSON.stringify(this.options.mode),
        WEBPACK_BUNDLE: JSON.stringify(!!this.options.runtime.WEBPACK_BUNDLE),
        WEBPACK_BUILD: JSON.stringify(!!this.options.runtime.WEBPACK_BUILD),
        WEBPACK_SERVE: JSON.stringify(!!this.options.runtime.WEBPACK_SERVE),
      }),
      dotenv: new DotenvPlugin({
        allowEmptyValues: true,
        systemvars: true,
        silent: true,
        defaults: true,
        prefix: 'import.meta.env.',
      }),
      html: isFile(resolve(this.options.root, 'src/index.html'))
        ? new HTMLWebpackPlugin({
            title:
              this.options.appName || this.options.entryName || 'Webpack App',
            inject: true,
            template: resolve(this.options.root, 'src/index.html'),
            minify: this.isDevel
              ? {}
              : {
                  removeComments: true,
                  collapseWhitespace: true,
                  removeRedundantAttributes: true,
                  useShortDoctype: true,
                  removeEmptyAttributes: true,
                  removeStyleLinkTypeAttributes: true,
                  keepClosingSlash: true,
                  minifyJS: true,
                  minifyCSS: true,
                  minifyURLs: true,
                },
          })
        : undefined,
      refresh: this.isDevel
        ? new ReactRefreshWebpackPlugin({ overlay: false })
        : undefined,
      css: !this.isDevel
        ? new MiniCSSExtractPlugin({
            filename: this.cssPathOf('[name].css'),
            chunkFilename: this.cssPathOf('[name].[fullhash:8].chunk.css'),
          })
        : undefined,
      copy:
        this.options.copy != null
          ? new CopyPlugin(this.options.copy)
          : undefined,
      shell:
        this.options.shell != null
          ? new WebpackShellPluginNext(this.options.shell)
          : undefined,
      caseSensitive: this.isDevel ? new CaseSensitivePathsPlugin() : undefined,
    };
  }

  get isDevel(): boolean {
    return this.options.mode !== 'production';
  }

  jsPathOf(path: string): string {
    return [this.options.jsPath, path].filter(Boolean).join('/');
  }

  cssPathOf(path: string): string {
    return [this.options.cssPath, path].filter(Boolean).join('/');
  }

  imgPathOf(path: string): string {
    return [this.options.cssPath || 'images', path].filter(Boolean).join('/');
  }

  filePathOf(path: string): string {
    return [this.options.filePath || 'files', path].filter(Boolean).join('/');
  }

  setMode(mode: ValueOrSetter<WebpackMode>): this {
    this.mode = valueOrSetter(mode, this.mode ?? 'development');
    return this;
  }

  setDevServer(opts: ValueOrSetter<WDSC>): this {
    this.devServer = valueOrSetter(opts, this.devServer ?? {});
    return this;
  }

  setEntry(entry: ValueOrSetter<WRC['entry']>): this {
    this.entry = valueOrSetter(entry, this.entry ?? {});
    return this;
  }

  setOutput(output: ValueOrSetter<WRC['output']>): this {
    this.output = valueOrSetter(output, this.output ?? {});
    return this;
  }

  setDevtool(devtool: ValueOrSetter<WC['devtool']>): this {
    this.devtool = valueOrSetter(devtool, this.devtool);
    return this;
  }

  setPerformance(performance: ValueOrSetter<WC['performance']>): this {
    this.performance = valueOrSetter(performance, this.performance);
    return this;
  }

  setCache(cache: ValueOrSetter<WC['cache']>): this {
    this.cache = valueOrSetter(cache, this.cache);
    return this;
  }

  setExternals(externals: ValueOrSetter<WC['externals']>): this {
    this.externals = valueOrSetter(externals, this.externals);
    return this;
  }

  buildOptimization(): WRC['optimization'] {
    const opt = {
      minimize: this.isDevel,
      ...this.optimization,
    };
    if (opt.minimizer == null) {
      opt.minimizer = this.minimizer;
    }
    if (opt.splitChunks == null) {
      opt.splitChunks = this.splitChunks;
    }
    return opt;
  }

  resolve: WC['resolve'] = {
    modules: ['node_modules'],
    extensions: ['.mjs', '.js', '.cjs', 'jsx', '.ts', '.tsx', '.wasm'],
    plugins: [new TsconfigPathsPlugin({})],
  };

  setResolve(value: ValueOrSetter<WC['resolve']>): this {
    this.resolve = valueOrSetter(value, this.resolve);
    return this;
  }

  svgrLoader(): WebpackLoaderRule {
    return {
      // 将 SVG 转为组件，作为最高优先级
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      // resourceQuery: { not: [/url/] }, // 官方示例做法，在 TS 环境并不适合
      use: [{ loader: '@svgr/webpack', options: this.svgrLoaderOptions() }],
    };
  }

  svgrLoaderOptions(): SvgrConfig {
    return {
      expandProps: true,
      memo: true,
      svgoConfig: {
        plugins: [
          {
            name: 'preset-default',
            params: {},
          },
        ],
      },
    };
  }

  swcLoader(): WebpackLoaderRule {
    return {
      test: /\.(js|mjs|jsx|ts|tsx)$/,
      exclude: /(node_modules|bower_components)/,
      use: [
        {
          loader: require.resolve('swc-loader'),
          options: this.swcLoaderOptions(),
        },
      ],
    };
  }

  swcLoaderOptions(): SwcConfig {
    return {
      jsc: {
        parser: {
          syntax: 'typescript',
          tsx: true,
          // jsx: true,
          decorators: true,
          dynamicImport: true,
        },
        loose: false,
        externalHelpers: true,
        transform: {
          legacyDecorator: true,
          decoratorMetadata: true,
          optimizer: {
            simplify: true,
          },
          react: {
            runtime: 'automatic',
            importSource: 'react',
            refresh: this.isDevel,
          },
        },
      },
      env: {
        targets: ['defaults'],
        mode: 'entry',
        coreJs: '3',
      },
      sourceMaps: true,
    };
  }

  imgAsset(): WebpackLoaderRule {
    return {
      test: /\.(png|jpg|gif)$/i,
      generator: {
        filename: this.imgPathOf('[name][ext][query]'),
      },
      type: 'asset/resource',
    };
  }

  imgLoader(): WebpackLoaderRule {
    return {
      test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/, /\.svg$/],
      use: [
        {
          loader: require.resolve('file-loader'),
          options: {
            limit: 10000,
            name: this.imgPathOf('[name].[ext]'),
          },
        },
      ],
    };
  }

  cssLoader(
    test: RegExp | string | ((value: string) => boolean),
    exclude?: RegExp | string | ((value: string) => boolean),
    options?: boolean | UseCSSLoaderOptions,
  ): WebpackLoaderRule {
    let opts: UseCSSLoaderOptions = {};
    if (typeof options === 'boolean') {
      opts = { cssModule: options };
    } else if (typeof options === 'object') {
      opts = { ...options };
    }
    const isCssModule = !!opts?.cssModule;
    return {
      test,
      exclude,
      use: this.useCssLoaders(opts ?? {}),
      sideEffects: isCssModule ? undefined : true,
    };
  }

  useCssLoaders({
    callback,
    cssModule,
    options,
  }: UseCSSLoaderOptions): WebpackLoaderRule['use'] {
    const loaders: WebpackLoaderRule['use'] = [];
    const isDevel = this.isDevel;
    if (isDevel) {
      loaders.push({
        loader: require.resolve('style-loader'),
        options: {},
      });
    } else {
      loaders.push({
        loader: MiniCSSExtractPlugin.loader,
        options: {},
      });
    }
    loaders.push(
      ...[
        {
          loader: require.resolve('css-loader'),
          options: this.cssLoaderOptions(cssModule, options),
        },
        {
          loader: require.resolve('postcss-loader'),
          options: {
            postcssOptions: this.postCSSLoaderOptions(),
          },
        },
      ],
    );
    if (typeof callback === 'function') {
      return callback(loaders);
    }
    return loaders;
  }

  /**
   * ```js
   * // default
   * cssLoaderOptions()
   * cssLoaderOptions(false)
   * // use css module
   * cssLoaderOptions(true)
   * // custom options
   * cssLoaderOptions({ ... })
   * ```
   * @param opts
   */
  cssLoaderOptions(
    cssModule?: boolean,
    opts?: CSSLoaderOptions,
  ): CSSLoaderOptions {
    return cssModule
      ? {
          ...opts,
          importLoaders: 1,
          sourceMap: this.isDevel,
          modules: {
            mode: 'local',
            getLocalIdent: getCSSModuleLocalIdent,
          },
        }
      : {
          ...opts,
          importLoaders: 1,
          sourceMap: this.isDevel,
          modules: {
            mode: 'icss',
          },
        };
  }

  postCSSLoaderOptions(): PostCSSConfig {
    return {
      plugins: [
        PostCSSFlex,
        [
          PostCSSPresetEnv,
          {
            autoprefixer: {
              flexbox: 'no-2009',
            },
            stage: 3,
          },
        ],
      ],
    };
  }

  fileLoader(): WebpackLoaderRule {
    return {
      loader: require.resolve('file-loader'),
      exclude: [/(^|\.(svg|mjs|json|js|jsx|ts|tsx|html))$/],
      type: 'asset/resource',
      options: {
        name: this.filePathOf('[name].[contenthash:8].[ext]'),
      },
    };
  }

  buildModule(): WRC['module'] {
    return {
      strictExportPresence: true,
      rules: [
        {
          oneOf: this.useLoaders
            .map(it => this.loaders[it] ?? undefined)
            .filter(Boolean),
        },
      ],
    };
  }

  buildPlugins(): WRC['plugins'] {
    return Object.values(this.plugins).filter(Boolean);
  }

  export(): WC {
    return {
      mode: this.mode,
      entry: this.entry,
      output: this.output,
      devtool: this.devtool,
      devServer: this.devServer,
      performance: this.performance,
      cache: this.cache,
      externals: this.externals,
      optimization: this.buildOptimization(),
      resolve: this.resolve,
      module: this.buildModule(),
      plugins: this.buildPlugins(),
    };
  }
}
