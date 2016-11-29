var gulp = require('gulp'),
    connect = require('gulp-connect'),
    conf = require('./conf');

gulp.task('webserver', function () {
    connect.server(conf.server);
});