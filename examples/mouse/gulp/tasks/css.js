import config from '../config';
import gulp from 'gulp';
import gulpif from 'gulp-if';
import sass from 'gulp-sass';
import sourcemaps from 'gulp-sourcemaps';
import cssMin from 'gulp-minify-css';

var env = process.env.LEAD_ENV;

gulp.task('css', function() {
  return gulp.src(config.entries.scss)
    .pipe(sourcemaps.init())
    .pipe(sass())
    .on('error', function(err) {console.trace(err.toString());this.emit('end');})
    .pipe(sourcemaps.write('.', {includeContent:false}))
    .pipe(gulpif(env === 'production', cssMin({ keepSpecialComments: 0 })))
    .pipe(gulp.dest(config.webroot.path + 'css'));
});
