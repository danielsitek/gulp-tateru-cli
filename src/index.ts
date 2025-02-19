import path from 'path';
import PluginError from 'plugin-error';
import through from 'through2';
import Vinyl from 'vinyl';

export interface GulpTateruOptions {
  env?: string;
  lang?: string;
  page?: string;
}

export interface TateruFile {
  contents: Buffer;
  base: string;
  path: string;
}

const PLUGIN_NAME = 'gulp-tateru';

/**
 * Mock tateru builder. Pass config file content and return an array of files as strings.
 * @param content
 * @returns
 */
const mockTateruBuilder = (content: string): TateruFile[] => {
  const files = [];

  for (let i = 0; i < 10; i++) {
    const newContent = `This is a #${i} generated file with content:\n\n${content}`;

    files.push({
      contents: Buffer.from(newContent),
      base: `file-${i}.txt`,
      path: ``,
    });
  }

  return files;
};

export const gulpTateru = (options?: GulpTateruOptions) => {
  return through.obj(function (file, encoding, callback) {
    let opts = Object.assign({}, options || {});

    if (file.isNull()) {
      return callback(null, file);
    }

    if (file.isStream()) {
      callback(new PluginError(PLUGIN_NAME, 'Streaming not supported'));
      return;
    }

    const fileName = path.basename(file.path);
    const filePath = file.path;
    const contents = file.contents.toString();

    console.log('fileName', fileName);
    console.log('filePath', filePath);
    // console.log('contents', contents);

    const generatedFiles = mockTateruBuilder(contents);

    generatedFiles.forEach((generatedFile) => {
      console.log('name', generatedFile.base);
      console.log('path', generatedFile.path);

      const vinylFile = new Vinyl({
        cwd: file.cwd,
        base: file.base,
        path: path.join(file.base, generatedFile.base),
        contents: generatedFile.contents,
      });

      this.push(vinylFile);
    });

    callback();
  });
};
