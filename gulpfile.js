// @ts-check

const { src, dest } = require('gulp');
const rename = require('gulp-rename');
const { gulpTateru } = require('./lib/cjs/index');
// const { gulpTateru } = require('@tateru/gulp-tateru');

const build = function build() {
  return src(['tateru.config.json'], {
    cwd: '.',
  })
    .pipe(gulpTateru())
    .pipe(rename({ extname: '.md' }))
    .pipe(dest('dist'));
};

module.exports = {
  default: build,
};
