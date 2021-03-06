import config from '../config';
import gulp from 'gulp';

gulp.task('watch', ['default'], function() {
  gulp.watch(config.js.watch, ['js']);
  gulp.watch('../../src/**/*.js', ['js']);
  gulp.watch(config.scss.watch, ['css']);
});
