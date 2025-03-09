import PluginError from 'plugin-error';
import { type ConfigFile, type Environment, core } from 'tateru-cli';
import through from 'through2';
import Vinyl from 'vinyl';

/**
 * Formatter function type
 *
 * @param contents - The contents of the file to format.
 * @param fileType - The file type to format. Example: 'html', 'json', 'webmanifest', etc.
 */
export type Formatter = (
  contents: string,
  fileType?: string
) => Promise<string>;

/**
 * Minify function type
 *
 * @param contents - The contents of the file to minify.
 * @param fileType - The file type to minify. Example: 'html', 'json', 'webmanifest', etc.
 */
export type Minify = (contents: string, fileType?: string) => Promise<string>;

/**
 * Gulp Tateru Options
 */
export interface GulpTateruCliOptions {
  /**
   * The environment to use from `tateru.config.json`. Example: `dev`, `prod`.
   */
  env?: Environment;

  /**
   * The language to use from `tateru.config.json` for the generated files. Example: 'en', 'fr', 'es', etc.
   */
  lang?: string;

  /**
   * The page to use from `tateru.config.json` for the generated files. Example: 'home', 'about', 'contact', etc.
   */
  page?: string;

  /**
   * The formatter function to use for formatting the generated files, before minification.
   */
  formatter?: Formatter;

  /**
   * The minify function to use for minifying the generated files.
   */
  minify?: Minify;
}

const PLUGIN_NAME = 'gulp-tateru-cli';

/**
 * Gulp Plugin for Tateru CLI.
 *
 * @param options - The options to use for the plugin.
 * @returns - Pipe Stream.
 */
export const gulpTateruCli = (options: GulpTateruCliOptions = {}) => {
  return through.obj(async function (file, _, callback) {
    const pluginOptions = { ...options };
    let parsedConfig: ConfigFile;

    if (file.isNull()) {
      return callback(null, file);
    }

    if (file.isStream()) {
      return callback(new PluginError(PLUGIN_NAME, 'Streaming not supported'));
    }

    const contentsConfig = file.contents.toString();

    try {
      parsedConfig = JSON.parse(contentsConfig);
    } catch (error) {
      return callback(new PluginError(PLUGIN_NAME, 'Invalid JSON config file'));
    }

    try {
      const files = await core({
        ...pluginOptions,
        config: parsedConfig,
        cwd: file.cwd,
      });

      await Promise.all(
        files.map(async (generatedFile) => {
          const vinylFile = new Vinyl({
            ...generatedFile,
            base: file.base,
            contents: Buffer.from(generatedFile.contents),
          });

          this.push(vinylFile);
        })
      );
    } catch (error) {
      return callback(new PluginError(PLUGIN_NAME, error as Error));
    }

    callback();
  });
};
