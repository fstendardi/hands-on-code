var gulp = require('gulp'),
  wrench = require('wrench');

wrench.readdirSyncRecursive('./gulp').filter(function (file) {
  return (/\.(js|coffee)$/i).test(file);
}).map(function (file) {
  require('./gulp/' + file);
});

gulp.task('serve', ['sass', 'webserver', 'watch', 'scripts']);