var config = require("../config");
var path = require('path');
var gulp = require("gulp");
var gulpif = require('gulp-if');
var uglify = require("uglify-js");
var browserify = require("browserify");
var babelify = require("babelify");
var exorcist = require('exorcist');
var map = require("vinyl-map");
var buffer = require("vinyl-buffer");
var source = require("vinyl-source-stream");

var through = require("through");
require("babel/register")({
  only: /src/
});
var Transpiler = require("../../../../src/transpiler");

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
    stream.queue("module.exports = function(" + Transpiler.renderer + ", " + Transpiler.scope + ", c) {return " + transpiler.transpile(data) + "}");
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
      blacklist: ["react"],
      nonStandard: false,
      sourceMapRelative: path.dirname(path.dirname(path.dirname(__dirname)))
    }));
  }
  return bundler;
}

var jsMin = map(function(code, filename) {
  return uglify.minify(code.toString(), {
    fromString: true
  }).code;
});

gulp.task("js", function() {
  return getBundler()
    .bundle()
    .on("error", function(err) {console.trace(err.toString());this.emit("end");})
    .pipe(gulpif(env !== 'production', exorcist(config.webroot.path + 'js/app.js.map')))
    .pipe(source("app.js"))
    .pipe(buffer())
    .pipe(gulpif(env === 'production', jsMin))
    .pipe(gulp.dest(config.webroot.path + 'js'));
    //.pipe(fs.createWriteStream(config.webroot + "dist/app.js"));
});
