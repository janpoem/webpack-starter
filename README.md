# @zenstone/webpack-starter

一个更简易的 Webpack 启动器。

```js
// webpack.config.js
const { webpackConfig } = require('@zenstone/webpack-starter');

module.exports = function(runtime) {
  return webpackConfig({ runtime }).exports();
};
```
