/**
 * paths location.
 */
var src = "./src/";
var webroot = "./webroot/";

global.window = global;

module.exports = {
  webroot: {
    path:  webroot
  },
  entries: {
    js: src + "app.js",
    scss: src + "app.scss"
  },
  js: {
    path: src,
    watch: [
      src + "**/*.js",
      src + "**/*.*tml"
    ]
  },
  scss: {
    watch: [
      src + "**/*.scss"
    ]
  }
};
