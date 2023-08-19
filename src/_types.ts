import type {
  Configuration,
  Compiler,
  WebpackPluginInstance,
  RuleSetRule,
} from 'webpack';
import type { PluginOptions as WebpackCopyPluginOptions } from 'copy-webpack-plugin';
import { Options as WebpackShellPluginOptions } from 'webpack-shell-plugin-next/lib/types';
import type { Configuration as WebpackDevServerConfiguration } from 'webpack-dev-server';
import type { Config as SwcConfig } from '@swc/core';
import type { Config as SvgrConfig } from '@svgr/core';
import type { Config as PostCSSConfig } from 'postcss-load-config';

/////////////////////////////////////////////////////////////////////////
// Webpack known types
/////////////////////////////////////////////////////////////////////////

export type WebpackRequiredConfiguration = Required<Configuration>;

export type WebpackEntry = Configuration['entry'];

export type WebpackConfiguration = Configuration;
export { WebpackDevServerConfiguration };

export type WebpackOptimization = WebpackRequiredConfiguration['optimization'];

export type WebpackSplitChunks = Required<WebpackOptimization>['splitChunks'];

export type WebpackOptimizationMinimizer = (
  | undefined
  | null
  | false
  | ''
  | 0
  | ((this: Compiler, compiler: Compiler) => void)
  | WebpackPluginInstance
  | '...'
)[];

export type WebpackOptimizationMinimizerItem =
  | undefined
  | null
  | false
  | ((compiler: Compiler) => void)
  | WebpackPluginInstance;

export type WebpackLoaderRule = RuleSetRule;

export interface CSSLoaderOptions {
  /**
   * Allows to enables/disables `url()`/`image-set()` functions handling.
   */
  url?:
    | boolean
    | {
        filter?: {
          [k: string]: unknown;
        };
      };
  /**
   * Allows to enables/disables `@import` at-rules handling.
   */
  import?:
    | boolean
    | {
        filter?: {
          [k: string]: unknown;
        };
      };
  /**
   * Allows to enable/disable CSS Modules or ICSS and setup configuration.
   */
  modules?:
    | boolean
    | ('local' | 'global' | 'pure' | 'icss')
    | {
        /**
         * Allows auto enable CSS modules based on filename.
         */
        auto?:
          | {
              [k: string]: unknown;
            }
          | boolean;
        /**
         * Setup `mode` option.
         */
        mode?:
          | ('local' | 'global' | 'pure' | 'icss')
          | {
              [k: string]: unknown;
            };
        /**
         * Allows to configure the generated local ident name.
         */
        localIdentName?: string;
        /**
         * Allows to redefine basic loader context for local ident name.
         */
        localIdentContext?: string;
        /**
         * Allows to add custom hash to generate more unique classes.
         */
        localIdentHashSalt?: string;
        /**
         * Allows to specify hash function to generate classes.
         */
        localIdentHashFunction?: string;
        /**
         * Allows to specify hash digest to generate classes.
         */
        localIdentHashDigest?: string;
        /**
         * Allows to specify hash digest length to generate classes.
         */
        localIdentHashDigestLength?: number;
        /**
         * Allows to specify should localName be used when computing the hash.
         */
        hashStrategy?: 'resource-path-and-local-name' | 'minimal-subset';
        /**
         * Allows to specify custom RegExp for local ident name.
         */
        localIdentRegExp?:
          | string
          | {
              [k: string]: unknown;
            };
        /**
         * Allows to specify a function to generate the classname.
         */
        getLocalIdent?: {
          [k: string]: unknown;
        };
        /**
         * Enables/disables ES modules named export for locals.
         */
        namedExport?: boolean;
        /**
         * Allows to export names from global class or id, so you can use that as local name.
         */
        exportGlobals?: boolean;
        /**
         * Style of exported classnames.
         */
        exportLocalsConvention?:
          | ('asIs' | 'camelCase' | 'camelCaseOnly' | 'dashes' | 'dashesOnly')
          | {
              [k: string]: unknown;
            };
        /**
         * Export only locals.
         */
        exportOnlyLocals?: boolean;
      };
  /**
   * Allows to enable/disable source maps.
   */
  sourceMap?: boolean;
  /**
   * Allows enables/disables or setups number of loaders applied before CSS loader for `@import`/CSS Modules and ICSS imports.
   */
  importLoaders?: boolean | string | number;
  /**
   * Use the ES modules syntax.
   */
  esModule?: boolean;
  /**
   * Allows exporting styles as array with modules, string or constructable stylesheet (i.e. `CSSStyleSheet`).
   */
  exportType?: 'array' | 'string' | 'css-style-sheet';
}

/////////////////////////////////////////////////////////////////////////
// 相关loader/plugin 各种参数导出
/////////////////////////////////////////////////////////////////////////
export {
  WebpackCopyPluginOptions,
  // WebpackShellPluginOptions,
  SwcConfig,
  SvgrConfig,
  PostCSSConfig,
};

/////////////////////////////////////////////////////////////////////////
// 自定义类型
/////////////////////////////////////////////////////////////////////////

export type WebpackRuntime = {
  WEBPACK_BUNDLE?: boolean;
  WEBPACK_BUILD?: boolean;
  WEBPACK_SERVE?: boolean;
};

export type WebpackMode = 'development' | 'production';

export type WebpackConfigOptions = {
  appName: string;
  /**
   * Webpack 运行模式
   */
  mode: WebpackMode;
  /**
   * 工作根目录
   *
   * root/public
   * root/src/index.[ts|tsx]
   * root/dist
   */
  root: string;
  /**
   * Webpack 运行时基础参数
   */
  runtime: WebpackRuntime;
  entry?: WebpackEntry;
  copy?: WebpackCopyPluginOptions;
  shell?: WebpackShellPluginOptions;
  jsPath?: string;
  cssPath?: string;
  imgPath?: string;
  filePath?: string;
  historyApiFallback?: WebpackDevServerConfiguration['historyApiFallback'];
  proxy?: WebpackDevServerConfiguration['proxy'];
};

export type UseCSSLoaderOptions = {
  cssModule?: boolean;
  options?: CSSLoaderOptions;
  callback?: (loaders: WebpackLoaderRule['use']) => WebpackLoaderRule['use'];
};

export type WebpackLoaderKey =
  | 'svg'
  | 'img'
  | 'swc'
  | 'css'
  | 'cssModule'
  | 'file'
  | string;

export type WebpackLoaderRecord = Record<WebpackLoaderKey, WebpackLoaderRule>;

export type WebpackPluginKey =
  | 'define'
  | 'dotenv'
  | 'html'
  | 'refresh'
  | 'css'
  | 'copy'
  | 'shell'
  | 'caseSensitive'
  | string;

export type WebpackPluginRecord = Record<
  WebpackPluginKey,
  WebpackPluginInstance
>;
