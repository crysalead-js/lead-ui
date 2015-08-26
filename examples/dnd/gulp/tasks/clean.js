var config = require("../config");
var gulp = require("gulp");
var del = require('del');

gulp.task("clean", function(callback){
  del([
    config.webroot.path + "js/**",
    config.webroot.path + "css/**"
  ], {
    force: true
  }, callback);
});
