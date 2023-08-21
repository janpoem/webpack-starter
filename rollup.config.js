import fs from 'fs';
import { resolve } from 'path';
import { swc } from 'rollup-plugin-swc3';
import { dts } from 'rollup-plugin-dts';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';

const outputDir = resolve('./dist');

const rmdir = dir =>
  dir &&
  fs.existsSync(dir) &&
  fs.statSync(dir).isDirectory() &&
  fs.rmSync(dir, { recursive: true });

const joinPath = (...segments) => segments.filter(Boolean).join('/');

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: joinPath(outputDir, 'index.js'),
        format: 'cjs',
      },
      {
        file: joinPath(outputDir, 'index.mjs'),
        format: 'es',
        exports: 'named',
      },
    ],
    plugins: [
      rmdir(outputDir),
      swc({
        include: /\.[mc]?[jt]sx?$/,
        exclude: /node_modules/,
        tsconfig: 'tsconfig.json',
      }),
      nodeResolve({}),
      commonjs({
        extensions: ['.node', '.cjs', '.js', '.mjs'],
      }),
    ],
    external: ['fs', 'path'],
  },
  {
    input: 'src/index.ts',
    output: [
      {
        file: joinPath(outputDir, 'index.d.ts'),
        format: 'es',
      },
    ],
    plugins: [dts()],
  },
];
