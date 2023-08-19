# @zenstone/webpack-starter

一个更简易的 Webpack 启动器。

```shell
pnpm add typescript @zenstone/webpack-starter @types/react @types/react-dom webpack webpack-dev-server webpack-cli -D
pnpm add react react-dom
```

添加 `webpack.config.js` 文件

```js
const Starter = require('@zenstone/webpack-starter');

// 未指定，默认取以下值
// root   = process.cwd()
// entry  = main: root/src/index.[ts|tsx|js|jsx]
// html   = root/src/index.html
// output = root/dist

module.exports = function(runtime) {
  // 默认 entry process.cwd()/src/index.[ts|tsx|js|jsx]
  return Starter.create({ 
    runtime,
    onBuildExit: {
      scripts: [
        () => {
          console.log('build exit');
        },
      ],
      parallel: false,
      blocking: true,
    },
    copy: {
      patterns: [
        { from: 'source', to: 'dest' },
        { from: 'other', to: 'public' },
      ],
    },
  }).setDevServer(devServer => {
    devServer.open = true;
    devServer.compress = true;
    devServer.historyApiFallback = true;
    return devServer;
  }).export(console.log);
};
```

## 启动参数

```ts
type WebpackRuntime = {
  WEBPACK_BUNDLE?: boolean;
  WEBPACK_BUILD?: boolean;
  WEBPACK_SERVE?: boolean;
};

type WebpackStarterOptions = {
  // 应用名称
  appName?: string;
  // webpack 运行模式 development | production ，去掉 none
  mode?: WebpackMode;
  // 工作根目录，默认取 process.cwd() ，也就是 package.json 所在目录
  root: string;
  // webpack 的运行时参数
  runtime: WebpackRuntime;
  // 入口配置快捷方式，参考 webpack.config.entry ：https://webpack.js.org/concepts/entry-points/
  entry?: WebpackEntry;
  // copy-webpack-plugin 快捷配置入口：https://www.npmjs.com/package/copy-webpack-plugin
  copy?: WebpackCopyPluginOptions;
  // webpack-shell-plugin-next 快捷配置入口：：https://www.npmjs.com/package/webpack-shell-plugin-next
  shell?: WebpackShellPluginOptions;
  // js 路径前缀，默认为指定，即 main.js
  jsPath?: string;
  // css 路径名前缀，默认未指定，即 main.css
  cssPath?: string;
  // 图片路径名前缀，默认 images，即 images/1.jpg
  imgPath?: string;
  // 其他文件路径名前缀，默认 files，即 files/xxx.txt
  filePath?: string;
  // 参考 webpack.devServer.historyApiFallback ：https://webpack.js.org/configuration/dev-server/#devserverhistoryapifallback
  historyApiFallback?: WebpackDevServerConfiguration['historyApiFallback'];
  // 参考 webpack.devServer.proxy ：https://webpack.js.org/configuration/dev-server/#devserverproxy
  proxy?: WebpackDevServerConfiguration['proxy'];
};
```

## Loaders 管理

```js
const Starter = require('@zenstone/webpack-starter');

const starter = Starter.create({});

// 以一个 map 进行注册
// Record<string, RuleSetRule>
starter.loaders = {
  svg: starter.svgrLoader(),
  img: starter.imgAsset(),
  swc: starter.swcLoader(),
  css: starter.cssLoader(/\.css$/, /\.module\.css$/),
  cssModule: starter.cssLoader(/\.css$/, /\.module\.css$/, {
    cssModule: true,
  }),
  file: starter.fileLoader(),
};
// 以一个 strong[] 来维护先后顺序和是否使用
starter.useLoaders = ['svg', 'img', 'swc', 'css', 'cssModule', 'file'];

// 你可以自行注册一个 Loader ，如
starter.loaders.babel = {
  test: /\.(?:js|mjs|cjs)$/,
  exclude: /node_modules/,
  use: {
    loader: 'babel-loader',
    options: {
      presets: [
        ['@babel/preset-env', { targets: 'defaults' }],
      ],
    },
  },
};

// 将 swc 替换为 babel
starter.useLoaders[2] = 'babel';
```

## Plugins 管理

```js
const Starter = require('@zenstone/webpack-starter');

const starter = Starter.create({});

// 插件以一个 map 进行注册，需要使用的插件，可自行添加或者移除。
// Record<string, WebpackPluginInstance>
starter.plugins;

// 移除 case-sensitive-paths-webpack-plugin 插件
delete (starter.plugins.caseSensitive);

// 插件不额外通过数组进行管理，直接通过 Object.values(this.plugins).filter(Boolean)
// 具体亦可通过继承 Starter 类，重载 buildPlugins 做更多的处理
```

## Optimization 说明

在 Starter 初创建的时候，默认的 `optimization` 为 `undefined`。

```js
const Starter = require('@zenstone/webpack-starter');

const starter = Starter.create({});

// undefined
console.log(optimization);

// 过程中可自行控制以下内容
// 默认情况下，minimize 只在非 devel 模式下为 true
starter.minimize = !starter.isDevel;
// minimizer 
// js 绑定了 terser-webpack-plugin ： https://www.npmjs.com/package/terser-webpack-plugin
// css 绑定了 css-minimizer-webpack-plugin : https://www.npmjs.com/package/css-minimizer-webpack-plugin
starter.minimizer = [];
// 默认无值
// 参考 webpack.optimization.splitChunks : https://webpack.js.org/plugins/split-chunks-plugin/#optimizationsplitchunks
starter.splitChunks = {};

// 直到调用 export 方法时，才会调用 buildOptimization 去生成 optimization 的结构。
// 即用户可在 buildOptimization 之前，通过 starter 属性的方式直接修改相关设定
// starter.buildOptimization() 不会写入本地 optimization 属性，每次都会合并成一个新的 optimization object
starter.export();
```

