import config from '../config';
import gulp from 'gulp';
import del from 'del';

gulp.task('clean', function(callback){
  del([
    config.webroot.path + 'js/**',
    config.webroot.path + 'css/**'
  ], {
    force: true
  }, callback);
});
