import config from '../config';
import path from 'path';
import gulp from 'gulp';
import gulpif from 'gulp-if';
import uglify from 'uglify-js';
import browserify from 'browserify';
import babelify from 'babelify';
import exorcist from 'exorcist';
import map from 'vinyl-map';
import buffer from 'vinyl-buffer';
import source from 'vinyl-source-stream';
import through from 'through';
import Transpiler from '../../../../src/transpiler';

var env = /*'production';*/ process.env.LEAD_ENV;

var bundler;

function hyperscriptify(file) {
  if (!/.thtml$/.test(file)) {
    return through();
  }
  var data = '';
  var stream = through(write, end);

  var transpiler = new Transpiler();

  function write(buf) {
    data += buf;
  };

  function end() {
    stream.queue('module.exports = function(' + Transpiler.renderer + ', ' + Transpiler.scope + ', c) {return ' + transpiler.transpile(data) + '}');
    stream.queue(null);
  };

  return stream;
}

function getBundler() {
  if (!bundler) {
    bundler = browserify({
      entries: config.entries.js,
      debug: env !== 'production'
    })
    .transform(hyperscriptify)
    .transform(babelify.configure({
      blacklist: ['react'],
      nonStandard: false,
      sourceMapRelative: path.dirname(path.dirname(path.dirname(__dirname)))
    }));
  }
  return bundler;
}

function getJsMin() {
  return map(function(code, filename) {
    return uglify.minify(code.toString(), {
      fromString: true
    }).code;
  });
}

gulp.task('js', function() {
  return getBundler()
    .bundle()
    .on('error', function(err) {console.trace(err.toString());this.emit('end');})
    .pipe(gulpif(env !== 'production', exorcist(config.webroot.path + 'js/app.js.map')))
    .pipe(source('app.js'))
    .pipe(buffer())
    .pipe(getJsMin())
    .pipe(gulp.dest(config.webroot.path + 'js'));
    //.pipe(fs.createWriteStream(config.webroot + 'dist/app.js'));
});
