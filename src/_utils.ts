import { isAbsolute, resolve } from 'path';
import { lstatSync } from 'fs';

export type ValueOrSetter<T, P = T> = T | ((arg: P) => T);

export function valueOrSetter<T, P = T>(value: ValueOrSetter<T, P>, ref: P): T {
  if (typeof value === 'function') {
    return (value as (arg: P) => T)(ref);
  }
  return value;
}

export type ExtensionExpression = string | string[] | RegExp;

export function extExpr(ext: ExtensionExpression): RegExp {
  if (ext instanceof RegExp) return ext;
  if (typeof ext === 'string') return extExpr(ext.split(/[|,]/));
  if (Array.isArray(ext)) {
    const exts = ext
      .map(it => it.replace(/^\.+/, '').toLowerCase())
      .filter(Boolean);
    if (exts.length > 0) {
      return new RegExp(`.(${exts.join('|')})$`, 'i');
    }
  }
  throw new Error(`invalid expr '${ext}'`);
}

export function isFile(path: string): boolean {
  try {
    return lstatSync(path).isFile();
  } catch (e) {
    return false;
  }
}

export function selectEntryFile(root: string, entryFile?: string): string {
  const items = [
    entryFile,
    `index.tsx`,
    `index.ts`,
    `index.jsx`,
    `index.js`,
  ].filter(Boolean) as string[];
  const size = items.length;

  for (let i = 0; i < size; i++) {
    const it = items[i];
    const path = isAbsolute(it) ? it : resolve(root, 'src', it);
    console.log();
    if (isFile(path)) return path;
  }
  throw new Error('entry file not exists');
}
