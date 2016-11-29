var gulp = require('gulp'),
    sass = require('gulp-sass'),
    conf = require('./conf'),
    connect = require('gulp-connect');

gulp.task('sass', function () {
    gulp.src(conf.srcPaths.styles + '/main.scss')
        .pipe(sass())
        .pipe(gulp.dest(conf.servePaths.styles))
        .pipe(connect.reload());
});