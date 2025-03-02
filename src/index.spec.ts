import PluginError from 'plugin-error';
import Vinyl from 'vinyl';
import { assert, describe, expect, it } from 'vitest';
import { type Formatter, type Minify, gulpTateru } from './index';
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

  it('should generate files with specific language', async () => {
    const { count } = await new Promise<{
      count: number;
    }>((resolve) => {
      let n = 0;

      gulp
        .src('./tateru.config.json', { cwd: 'test/fixtures' })
        .pipe(gulpTateru({ lang: 'cs' }))
        .on('data', (file) => {
          n++;
        })
        .on('end', () => {
          resolve({ count: n });
        });
    });

    expect(count).toBe(6);
  });

  it('should work with multiple options combined', async () => {
    const { count, generatedFile } = await new Promise<{
      count: number;
      generatedFile: string;
    }>((resolve) => {
      let n = 0;
      let generatedFile: string;

      gulp
        .src('./tateru.config.json', { cwd: 'test/fixtures' })
        .pipe(
          gulpTateru({
            env: 'prod',
            lang: 'cs',
            page: 'index',
          })
        )
        .on('data', (file) => {
          n++;
          generatedFile = file.contents.toString();
        })
        .on('end', () => {
          resolve({ count: n, generatedFile });
        });
    });

    expect(count).toBe(1);
    expect(generatedFile).toContain('<h2>Page Homepage</h2>');
  });

  it('should apply formatter function', async () => {
    const formatter: Formatter = async (contents, fileType) =>
      `FORMATTED (${fileType}): ${contents}`;

    const { generatedFile } = await new Promise<{
      generatedFile: string;
    }>((resolve) => {
      let generatedFile: string;

      gulp
        .src('./tateru.config.json', { cwd: 'test/fixtures' })
        .pipe(gulpTateru({ formatter, page: 'about' }))
        .on('data', (file) => {
          generatedFile = file.contents.toString();
        })
        .on('end', () => {
          resolve({ generatedFile });
        });
    });

    expect(generatedFile).toContain('FORMATTED (html):');
  });

  it('should apply minify function', async () => {
    const minify: Minify = async (contents) => contents.replace(/\s+/g, '');

    const { generatedFile } = await new Promise<{
      generatedFile: string;
    }>((resolve) => {
      let generatedFile: string;

      gulp
        .src('./tateru.config.json', { cwd: 'test/fixtures' })
        .pipe(gulpTateru({ minify, page: 'about', env: 'prod' }))
        .on('data', (file) => {
          generatedFile = file.contents.toString();
        })
        .on('end', () => {
          resolve({ generatedFile });
        });
    });

    expect(generatedFile).not.toMatch(/\s+/);
  });

  // TODO: Fix this test
  it('should handle invalid JSON config', async () => {
    const stream = gulpTateru();

    // Vytvoříme mock objektu souboru s neplatným JSON
    const invalidFile = new Vinyl({
      path: 'invalid.json',
      contents: Buffer.from('{ invalid json }'),
    });

    const errorPromise = new Promise((resolve) => {
      stream.once('error', resolve);
    });

    // Zavoláme write() místo použití gulp.src()
    stream.write(invalidFile);
    stream.end();

    const error = await errorPromise;

    expect(error).toBeInstanceOf(PluginError);
    expect((error as PluginError).message).toContain(
      'Invalid JSON config file'
    );
  });

  it('should handle streaming error', async () => {
    const mockStreamFile = {
      isNull: () => false,
      isStream: () => true,
    };

    const error = await new Promise((resolve) => {
      const stream = gulpTateru();
      stream.on('error', (err) => {
        resolve(err);
      });
      stream.write(mockStreamFile);
    });

    expect(error).toBeInstanceOf(PluginError);
    expect((error as PluginError).message).toContain('Streaming not supported');
  });
});
