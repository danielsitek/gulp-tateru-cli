import PluginError from 'plugin-error';
import Vinyl from 'vinyl';
import { assert, describe, expect, it } from 'vitest';
import { type Formatter, type Minify, gulpTateruCli } from './index';
import gulp from 'gulp';

describe('gulpTateru', () => {
  it('should be a function', () => {
    assert.isFunction(gulpTateruCli);
  });

  it('should generate files', async () => {
    const i = await new Promise((resolve) => {
      let n = 0;

      gulp
        .src('./tateru.config.json', { cwd: 'test/fixtures' })
        .pipe(gulpTateruCli())
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
        .pipe(gulpTateruCli({ page: 'about' }))
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
        .pipe(gulpTateruCli({ lang: 'cs' }))
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
          gulpTateruCli({
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
        .pipe(gulpTateruCli({ formatter, page: 'about' }))
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
        .pipe(gulpTateruCli({ minify, page: 'about', env: 'prod' }))
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
    const stream = gulpTateruCli();

    // Create a mock file object with invalid JSON
    const invalidFile = new Vinyl({
      path: 'invalid.json',
      contents: Buffer.from('{ invalid json }'),
    });

    const errorPromise = new Promise((resolve) => {
      stream.once('error', resolve);
    });

    // Call write() instead of using gulp.src()
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
      const stream = gulpTateruCli();
      stream.on('error', (err) => {
        resolve(err);
      });
      stream.write(mockStreamFile);
    });

    expect(error).toBeInstanceOf(PluginError);
    expect((error as PluginError).message).toContain('Streaming not supported');
  });

  it('should handle null files by passing them through', async () => {
    const stream = gulpTateruCli();
    const nullFile = new Vinyl({
      path: 'test.json',
      contents: null,
    });

    const result = await new Promise((resolve) => {
      stream.once('data', resolve);
      stream.write(nullFile);
      stream.end();
    });

    expect(result).toBe(nullFile);
  });

  it('should handle errors from core function', async () => {
    const stream = gulpTateruCli();

    // Create a config that will cause core() to fail
    // Using an invalid cwd path should cause an error in core
    const invalidConfigFile = new Vinyl({
      path: 'test-config.json',
      cwd: '/absolutely/nonexistent/path/that/should/cause/error',
      base: '/test',
      contents: Buffer.from(
        JSON.stringify({
          // Valid JSON structure but invalid paths/config for tateru-cli core
          environments: {
            dev: { minify: false },
          },
          translations: {},
          pages: {
            test: {
              template: 'nonexistent.html.twig',
              output: 'test.html',
            },
          },
        })
      ),
    });

    const errorPromise = new Promise((resolve) => {
      stream.once('error', resolve);
    });

    stream.write(invalidConfigFile);
    stream.end();

    const error = await errorPromise;

    expect(error).toBeInstanceOf(PluginError);
    expect((error as PluginError).plugin).toBe('gulp-tateru-cli');
  });
});
