import { resolve } from 'path';
import type { WebpackPluginInstance } from 'webpack';
import type { Config as SwcConfig } from '@swc/core';
import type { Config as SvgrConfig } from '@svgr/core';
import type { Config as PostCSSConfig } from 'postcss-load-config';
import type { CSSLoaderOptions, WebpackLoaderRule } from './_types';
import type { WebpackRequiredConfiguration } from './_types';
import type { WebpackConfigBuilder } from './builder';

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
const InlineChunkHtmlPlugin = require('react-dev-utils/InlineChunkHtmlPlugin');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const WebpackShellPluginNext = require('webpack-shell-plugin-next');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const CopyPlugin = require('copy-webpack-plugin');

export { SwcConfig, SvgrConfig, PostCSSConfig };

export class WebpackDefaults {
  public builder?: WebpackConfigBuilder;

  setBuilder(builder: WebpackConfigBuilder): this {
    this.builder = builder;
    return this;
  }

  resolve(): WebpackRequiredConfiguration['resolve'] {
    return {
      modules: ['node_modules'],
      extensions: ['.mjs', '.js', '.cjs', 'jsx', '.ts', '.tsx', '.wasm'],
      plugins: [new TsconfigPathsPlugin({})],
    };
  }

  optimization(
    minimize?: boolean,
  ): WebpackRequiredConfiguration['optimization'] {
    return {
      minimize: minimize ?? !this.builder?.isDevel,
      minimizer: [
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
      ],
      splitChunks: {
        cacheGroups: {},
      },
    };
  }

  jsPathOf(path: string): string {
    return path;
  }

  swcLoader(refresh?: boolean): WebpackLoaderRule {
    return {
      test: /\.(js|mjs|jsx|ts|tsx)$/,
      exclude: /(node_modules|bower_components)/,
      use: [
        {
          loader: require.resolve('swc-loader'),
          options: this.swcLoaderOptions(refresh ?? this.builder?.isDevel),
        },
      ],
    };
  }

  swcLoaderOptions(refresh?: boolean): SwcConfig {
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
            refresh: refresh ?? !!this.builder?.isDevel,
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

  imgPathOf(path: string): string {
    return `images/${path}`;
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

  cssPathOf(path: string): string {
    return path;
  }

  cssLoader(
    test: RegExp | string | ((value: string) => boolean),
    exclude?: RegExp | string | ((value: string) => boolean),
    cssModule?: boolean | CSSLoaderOptions,
    callback?: (loaders: WebpackLoaderRule['use']) => WebpackLoaderRule['use'],
  ): WebpackLoaderRule {
    let isCssModule;
    if (typeof cssModule === 'object') {
      if (typeof cssModule.modules === 'object') {
        isCssModule = cssModule.modules.mode === 'local';
      } else {
        isCssModule = cssModule.modules === 'local';
      }
    } else {
      isCssModule = !!cssModule;
    }
    return {
      test,
      exclude,
      use: this.useCssLoaders(isCssModule, callback),
      sideEffects: isCssModule === true ? undefined : true,
    };
  }

  useCssLoaders(
    opts?: boolean | CSSLoaderOptions,
    callback?: (loaders: WebpackLoaderRule['use']) => WebpackLoaderRule['use'],
  ): WebpackLoaderRule['use'] {
    const loaders: WebpackLoaderRule['use'] = [];
    const isDevel = !!this.builder?.isDevel;
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
          options: this.cssLoaderOptions(opts),
        },
        {
          loader: require.resolve('postcss-loader'),
          options: {
            postcssOptions: this.postcssLoaderOptions(),
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
  cssLoaderOptions(opts?: boolean | CSSLoaderOptions): CSSLoaderOptions {
    if (typeof opts === 'object') {
      return opts;
    }
    return opts
      ? {
          importLoaders: 1,
          sourceMap: !!this.builder?.isDevel,
          modules: {
            mode: 'local',
            getLocalIdent: getCSSModuleLocalIdent,
          },
        }
      : {
          importLoaders: 1,
          sourceMap: !!this.builder?.isDevel,
          modules: {
            mode: 'icss',
          },
        };
  }

  postcssLoaderOptions(): PostCSSConfig {
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

  filePathOf(path: string): string {
    return `files/${path}`;
  }

  othersLoader(): WebpackLoaderRule {
    return {
      loader: require.resolve('file-loader'),
      exclude: [/(^|\.(svg|mjs|json|js|jsx|ts|tsx|html))$/],
      type: 'asset/resource',
      options: {
        name: this.filePathOf('[name].[contenthash:8].[ext]'),
      },
    };
  }

  module(rules?: WebpackLoaderRule[]): WebpackRequiredConfiguration['module'] {
    return {
      strictExportPresence: true,
      rules: [
        {
          oneOf: [
            this.svgrLoader(),
            this.imgLoader(),
            this.swcLoader(),
            this.cssLoader(/\.css$/, /\.module\.css$/, false),
            this.cssLoader(/\.module\.css$/, undefined, true),
            ...(rules || []),
            this.othersLoader(),
          ].filter(Boolean),
        },
      ],
    };
  }

  plugins(
    plugins?: WebpackPluginInstance[],
  ): WebpackRequiredConfiguration['plugins'] {
    const isDevel = !!this.builder?.isDevel;
    const appName =
      this.builder?.options.appName ||
      this.builder?.options.entryName ||
      'Webpack App';
    const runtime = this.builder?.options.runtime || {};
    return [
      new DefinePlugin({
        APP_NAME: JSON.stringify(appName),
        APP_MODE: JSON.stringify(isDevel ? 'development' : 'production'),
        WEBPACK_BUNDLE: JSON.stringify(!!runtime.WEBPACK_BUNDLE),
        WEBPACK_BUILD: JSON.stringify(!!runtime.WEBPACK_BUILD),
        WEBPACK_SERVE: JSON.stringify(!!runtime.WEBPACK_SERVE),
      }),
      new DotenvPlugin({
        allowEmptyValues: true,
        systemvars: true,
        silent: true,
        defaults: true,
        prefix: 'import.meta.env.',
      }),
      this.builder?.options.root != null
        ? new HTMLWebpackPlugin(
            Object.assign(
              {},
              {
                title: appName,
                inject: true,
                template: resolve(
                  this.builder?.options.root,
                  './src/index.html',
                ),
              },
              !isDevel
                ? {
                    minify: {
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
                  }
                : undefined,
            ),
          )
        : undefined,
      !isDevel
        ? new InlineChunkHtmlPlugin(HTMLWebpackPlugin, [/runtime-.+[.]js/])
        : undefined,
      isDevel ? new ReactRefreshWebpackPlugin({ overlay: false }) : undefined,
      isDevel ? new CaseSensitivePathsPlugin() : undefined,
      !isDevel
        ? new MiniCSSExtractPlugin({
            filename: this.cssPathOf('[name].css'),
            chunkFilename: this.cssPathOf('[name].[fullhash:8].chunk.css'),
          })
        : undefined,
      this.builder?.options.copy != null
        ? new CopyPlugin(this.builder.options.copy)
        : undefined,
      this.builder?.options.shell != null
        ? new WebpackShellPluginNext(this.builder.options.shell)
        : undefined,
      ...(plugins || []),
    ].filter(Boolean);
  }
}
