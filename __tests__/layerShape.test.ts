import { describe, expect, it } from '@jest/globals';

// Rules about the shape of a layer that import lint cannot express: a .tsx file
// pulls in React through the JSX runtime without any import, and a route file
// can hold logic while importing only what it may.
const { sourceFiles, readSource } = require('../test-support/sourceFiles') as {
  sourceFiles: (dir: string) => string[];
  readSource: (file: string) => string;
};

// The one line a route file may be: the default export of a feature screen.
const ROUTE_RE_EXPORT = /^export \{ default \} from '@\/features\/[a-z-]+\/screens\/[A-Za-z]+';$/;

describe('layer shape', () => {
  it('src/domain has no .tsx files (JSX would import React invisibly)', () => {
    const domain = sourceFiles('src/domain');
    expect(domain.length).toBeGreaterThan(20);
    expect(domain.filter((file) => file.endsWith('.tsx'))).toEqual([]);
  });

  it('every route file in src/app is a one-line re-export of a feature screen', () => {
    const routes = sourceFiles('src/app').filter((file) => !file.endsWith('/_layout.tsx'));
    expect(routes.length).toBeGreaterThan(10);
    const notReExports = routes.filter((file) => {
      const lines = readSource(file)
        .split(/\r?\n/)
        .filter((line) => line.trim() !== '');
      return lines.length !== 1 || !ROUTE_RE_EXPORT.test(lines[0]);
    });
    expect(notReExports).toEqual([]);
  });
});
