# gulp-tateru

> [gulp](http://gulpjs.com/) plugin to build templates, using [tateru-cli](https://github.com/danielsitek/tateru-cli)

## Issues

Simple [gulp](https://github.com/gulpjs/gulp) plugin for streamlining integration of the [Tateru CLI](https://github.com/danielsitek/tateru-cli) into gulp workflow. If it looks like you are having issues related to file generation, please contact [tateru-cli issues](https://github.com/danielsitek/tateru-cli/issues). Only create a new issue if it looks like you're having a problem with the plugin itself.

## Install

```
npm i -D gulp-tateru
```

## API

### Basic usage

```javascript
const gulp = require("gulp");
const { gulpTateru } = require("gulp-tateru");

const build = function build() {
  return src(["tateru.config.json"], {
    cwd: ".",
  })
    .pipe(gulpTateru())
    .pipe(dest("dist"));
};
```

### Options

```javascript
const gulp = require("gulp");
const { gulpTateru } = require("gulp-tateru");

const options = {
  env: "prod",
  lang: "cs",
};

const build = function build() {
  return src(["tateru.config.json"], {
    cwd: ".",
  })
    .pipe(gulpTateru(options))
    .pipe(dest("dist"));
};
```

### Format code

```javascript
const gulp = require("gulp");
const { gulpTateru } = require("gulp-tateru");
const { html, js } = require("js-beautify");

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

const options = {
  formatter: formatContents,
};

const build = function build() {
  return src(["tateru.config.json"], {
    cwd: ".",
  })
    .pipe(gulpTateru(options))
    .pipe(dest("dist"));
};
```
