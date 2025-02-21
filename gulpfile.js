// @ts-check

const { src, dest } = require('gulp');
// const { gulpTateru } = require('./index.cjs');
const { gulpTateru } = require('./lib/cjs/index');

const build = function build() {
  return src(['tateru.config.json'], {
    cwd: '.',
  })
    .pipe(gulpTateru())
    .pipe(dest('example/dist'));
};

module.exports = {
  default: build,
};
