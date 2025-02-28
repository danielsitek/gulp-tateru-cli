import { assert, describe, expect, it } from 'vitest';
import { gulpTateru } from './index';
const gulp = require('gulp');

describe('gulpTateru', () => {
  it('should be a function', () => {
    assert.isFunction(gulpTateru);
  });

  it('should generate files', async () => {
    const i = await new Promise((resolve) => {
      let n = 0;

      gulp
        .src('./tateru.config.json', { cwd: 'test/fixtures' })
        .pipe(gulpTateru())
        .on('data', () => {
          n++;
        })
        .on('end', () => {
          resolve(n);
        });
    });

    expect(i).toBe(6);
  });

  it('should generate selected file', async () => {
    const { count, generatedFile } = await new Promise<{
      count: number;
      generatedFile: string;
    }>((resolve) => {
      let n = 0;
      let generatedFile: string;

      gulp
        .src('./tateru.config.json', { cwd: 'test/fixtures' })
        .pipe(gulpTateru({ page: 'about' }))
        .on('data', (file) => {
          n++;
          generatedFile = file.contents.toString();
        })
        .on('end', () => {
          resolve({ count: n, generatedFile });
        });
    });

    expect(count).toBe(1);
    expect(generatedFile).toContain('<h2>Page About</h2>');
  });
});
