import fs from 'fs';
import { resolve } from 'path';
import ts from 'rollup-plugin-ts';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';

const outputDir = resolve('./dist');

const rmdir = dir =>
  fs.existsSync(dir) &&
  fs.statSync(dir).isDirectory() &&
  fs.rmSync(dir, { recursive: true });

export default {
  input: 'src/index.ts',
  output: [
    {
      file: `${outputDir}/index.js`,
      format: 'cjs',
    },
    {
      file: `${outputDir}/index.mjs`,
      format: 'es',
    },
  ],
  plugins: [
    rmdir(outputDir),
    ts(),
    nodeResolve({}),
    commonjs({
      extensions: ['.node', '.cjs', '.js', '.mjs'],
    }),
  ],
  external: ['fs', 'path'],
};
