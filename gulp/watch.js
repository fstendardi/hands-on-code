var gulp = require('gulp'),
    conf = require('./conf');

gulp.task('watch', function() {
    gulp.watch(conf.srcPaths.styles + '/*.scss', ['sass']);
    gulp.watch(conf.srcPaths.scripts + '/**/*.js', ['scripts']);
});