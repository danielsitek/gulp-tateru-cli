const PluginError = require('plugin-error');
const through = require('through2');
const Vinyl = require('vinyl');
const { core } = require('tateru-cli');

const PLUGIN_NAME = 'gulp-tateru';

module.exports = (options = {}) => {
  return through.obj(function (file, encoding, callback) {
    let opts = Object.assign({}, options || {});

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
        config: contentsJson,
        env: opts.env,
        lang: opts.lang,
        page: opts.page,
        cwd: file.cwd,
      }).forEach((generatedFile) => {
        const vinylFile = new Vinyl({
          ...generatedFile,
          contents: Buffer.from(generatedFile.contents),
        });

        this.push(vinylFile);
      });
    } catch (error) {
      callback(new PluginError(PLUGIN_NAME, error));
      return;
    }

    callback();
  });
};
