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

    const contentsJson = JSON.parse(file.contents.toString());

    const generatedFiles = core({
      config: contentsJson,
      env: opts.env,
      lang: opts.lang,
      page: opts.page,
      cwd: file.cwd,
    });

    generatedFiles.forEach((generatedFile) => {
      console.log('name', generatedFile.base);
      console.log('path', generatedFile.path);

      const vinylFile = new Vinyl({
        ...generatedFile,
        contents: Buffer.from(generatedFile.contents),
      });

      this.push(vinylFile);
    });

    callback();
  });
};
