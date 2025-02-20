import PluginError from 'plugin-error';
import { core, type Environment } from 'tateru-cli';
import through from 'through2';
import Vinyl from 'vinyl';

export interface GulpTateruOptions {
  env?: Environment;
  lang?: string;
  page?: string;
  formatter?: (contents: string, fileType?: string) => string;
  minify?: (contents: string, fileType?: string) => string;
}

const PLUGIN_NAME = 'gulp-tateru';

export const gulpTateru = (options: GulpTateruOptions = {}) => {
  return through.obj(function (file, encoding, callback) {
    const pluginOptions = { ...options };

    if (file.isNull()) {
      return callback(null, file);
    }

    if (file.isStream()) {
      callback(new PluginError(PLUGIN_NAME, 'Streaming not supported'));
      return;
    }

    const contentsConfig = file.contents.toString();

    try {
      JSON.parse(contentsConfig);
    } catch (error) {
      callback(new PluginError(PLUGIN_NAME, 'Invalid JSON config file'));
      return;
    }

    try {
      const contentsJson = JSON.parse(contentsConfig);

      core({
        ...pluginOptions,
        config: contentsJson,
        cwd: file.cwd,
      }).forEach((generatedFile) => {
        const vinylFile = new Vinyl({
          ...generatedFile,
          base: file.base,
          contents: Buffer.from(generatedFile.contents),
        });

        this.push(vinylFile);
      });
    } catch (error) {
      callback(new PluginError(PLUGIN_NAME, error as Error));
      return;
    }

    callback();
  });
};
