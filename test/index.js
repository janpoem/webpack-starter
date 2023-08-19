// eslint-disable-next-line @typescript-eslint/no-var-requires
const Starter = require('../dist');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Webpack = require('webpack');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const DevServer = require('webpack-dev-server');

const starter = Starter.create({
  root: __dirname,
}).setDevServer(it => (it.open = true) && it);
const compiler = Webpack(starter.export(console.log));

const server = new DevServer(starter.devServer, compiler);

const runServer = async () => {
  console.log('Starting server...');
  await server.start();
};

runServer().catch(e => console.log(e.message));
