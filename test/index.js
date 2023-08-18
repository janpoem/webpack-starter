// eslint-disable-next-line @typescript-eslint/no-var-requires
const { webpackConfig } = require('../dist');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Webpack = require('webpack');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const DevServer = require('webpack-dev-server');

const config = webpackConfig({
  mode: 'development',
  root: __dirname,
  entryName: 'app',
  runtime: {
    WEBPACK_BUILD: false,
    WEBPACK_BUNDLE: false,
    WEBPACK_SERVE: false,
  },
});
const compiler = Webpack(config.export());

const server = new DevServer(config.devServer, compiler);

const runServer = async () => {
  console.log('Starting server...');
  await server.start();
};

runServer().catch(e => console.log(e.message));
