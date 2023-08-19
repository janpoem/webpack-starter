# @zenstone/webpack-starter

一个更简易的 Webpack 启动器。

```shell
pnpm add typescript @zenstone/webpack-starter @types/react @types/react-dom webpack webpack-dev-server webpack-cli -D
pnpm add react react-dom
```

添加 `webpack.config.js` 文件

```js
const Starter = require('@zenstone/webpack-starter');

module.exports = function(runtime) {
  // 默认以 process.cwd()/index.[ts|tsx|js|jsx]
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
