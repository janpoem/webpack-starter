// eslint-disable-next-line @typescript-eslint/no-var-requires
const Webpack = require('webpack');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const DevServer = require('webpack-dev-server');
import WebpackStarter from '../src';

const starter = WebpackStarter.create({
  root: __dirname,
}).setDevServer(it => {
  it.open = true;
  return it;
});
const compiler = Webpack(starter.export(console.log));

const server = new DevServer(starter.devServer, compiler);

const runServer = async () => {
  console.log('Starting server...');
  await server.start();
};

runServer().catch(e => console.log(e.message));
