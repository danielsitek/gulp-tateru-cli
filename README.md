# gulp-tateru-cli

![Build Status](https://github.com/danielsitek/gulp-tateru-cli/actions/workflows/dev.yml/badge.svg?branch=main)
![Codecov](https://img.shields.io/codecov/c/gh/danielsitek/gulp-tateru-cli)
![Code Climate maintainability](https://img.shields.io/codeclimate/maintainability/danielsitek/gulp-tateru-cli)

> [gulp](http://gulpjs.com/) plugin to build templates, using [tateru-cli](https://github.com/danielsitek/tateru-cli)

## Issues

Simple [gulp](https://github.com/gulpjs/gulp) plugin for streamlining integration of the [tateru-cli](https://github.com/danielsitek/tateru-cli) into gulp workflow. If you encounter problems related to file generation, please report them in the [tateru-cli issues](https://github.com/danielsitek/tateru-cli/issues). Only create a new issue if it looks like you're having a problem with the plugin itself.

## Requirements

- Node.js v14 or higher
- Gulp v4 or higher

## Install

```
npm i -D gulp-tateru-cli
```

## Usage

For further documentation about using [tateru-cli](https://github.com/danielsitek/tateru-cli), please look for its [documentation](https://github.com/danielsitek/tateru-cli/blob/master/README.md). For further documentation about using [Gulp](https://gulpjs.com/), please look for its [documentation](https://gulpjs.com/docs/en/getting-started/quick-start).

### Requirements

For correct resolving destination through pipe, set `options.ext` to empty string in `tateru.config.json`.

```json
{
  "options": {
    "data": {},
    "src": "example/src/twig",
    "ext": ""
  }
}
```

You can find an example of a complete file in the fixtures: [`test/fixtures/tateru.config.json`](./test/fixtures/tateru.config.json).

### Basic usage

```javascript
const { src, dest } = require("gulp");
const { gulpTateruCli } = require("gulp-tateru-cli");

const build = function build() {
  return src(["tateru.config.json"], {
    cwd: ".",
  })
    .pipe(gulpTateruCli())
    .pipe(dest("dist"));
};
```

### With options

Plugin [gulp-tateru-cli](https://github.com/danielsitek/gulp-tateru-cli) supports TypeScript, so you can use type annotations in your gulp files for better type safety and developer experience.

```javascript
const { src, dest } = require("gulp");
const { gulpTateruCli } = require("gulp-tateru-cli");

/** @type {import('gulp-tateru-cli').GulpTateruCliOptions} */
const options = {
  env: "prod",
  lang: "cs",
};

const build = function build() {
  return src(["tateru.config.json"], {
    cwd: ".",
  })
    .pipe(gulpTateruCli(options))
    .pipe(dest("dist"));
};
```

### Format contents

```javascript
const { src, dest } = require("gulp");
const { gulpTateruCli } = require("gulp-tateru-cli");
const { html, js } = require("js-beautify");

/** @type {import('gulp-tateru-cli').Formatter} */
const formatContents = (contents, fileType) => {
  if (fileType && ["html", "xml"].includes(fileType)) {
    return html(contents, {
      indent_size: 4,
    });
  }

  if (fileType && ["json", "webmanifest"].includes(fileType)) {
    return js(contents, {
      indent_size: 2,
    });
  }

  return contents;
};

/** @type {import('gulp-tateru-cli').GulpTateruCliOptions} */
const options = {
  formatter: formatContents,
};

const build = function build() {
  return src(["tateru.config.json"], {
    cwd: ".",
  })
    .pipe(gulpTateruCli(options))
    .pipe(dest("dist"));
};
```

## API

### Options

```ts
env?: 'prod' | 'dev' | string
```

Optional. The environment to use from `tateru.config.json`. Example: `dev`, `prod`.

```ts
lang?: 'en' | 'cs' | string
```

Optional. The language to use from `tateru.config.json` for the generated files. Example: 'en', 'fr', 'es', etc.

```ts
page?: 'homepage' | 'about' | string
```

Optional. The page to use from `tateru.config.json` for the generated files. Example: 'home', 'about', 'contact', etc.

```ts
formatter?: (contents: string, fileType?: string) => string;
```

Optional. The formatter function to use for formatting the generated files, before minification.

- `contents` - The contents of the file to format.
- `fileType` - The file type to minify. Example: 'html', 'json', 'webmanifest', etc.

```ts
minify?: (contents: string, fileType?: string) => string;
```

Optional. The minify function to use for minifying the generated files.

- `contents` - The contents of the file to minify.
- `fileType` - The file type to minify. Example: 'html', 'json', 'webmanifest', etc.

## Contributing

Want to contribute? Feel free to open an **issue** or **pull request** on GitHub! 🚀 We welcome bug reports, feature requests, and code contributions.

1. Fork the repo
2. Create a new branch (`git checkout -b feature-branch`)
3. Make your changes
4. Commit the changes (`git commit -m "Add new feature"`)
5. Push to the branch (`git push origin feature-branch`)
6. Open a **pull request** 🚀

## Support

If you have any questions or need help, feel free to open an issue on GitHub or contact me via [GitHub profile](https://github.com/danielsitek).

## License

[MIT](./LICENSE) License © 2025 [Daniel Sitek](https://github.com/danielsitek)
