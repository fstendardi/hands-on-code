var gulp = require('gulp'),
    concat = require('gulp-concat'),
    connect = require('gulp-connect'),
    uglify = require('gulp-uglify'),
    sourcemaps = require('gulp-sourcemaps'),
    conf = require('./conf');

gulp.task('scripts-jq', function() {  
    return gulp.src([conf.srcPaths.vendor + '/jquery/dist/jquery.js', conf.srcPaths.scripts + '/jq/**/*.js'])
        .pipe(sourcemaps.init())
        .pipe(concat('scripts-jq.min.js'))
        .pipe(uglify({ preserveComments: 'license' }))
        .pipe(gulp.dest(conf.servePaths.scripts))
        .pipe(sourcemaps.write('maps'))
        .pipe(gulp.dest(conf.servePaths.scripts))
        .pipe(connect.reload());
});

gulp.task('scripts-ng', function() {  
    return gulp.src([conf.srcPaths.vendor + '/angular/angular.js', conf.srcPaths.scripts + '/ng/**/*.js'])
        .pipe(sourcemaps.init())
        .pipe(concat('scripts-ng.min.js'))
        .pipe(uglify({ preserveComments: 'license' }))
        .pipe(gulp.dest(conf.servePaths.scripts))
        .pipe(sourcemaps.write('maps'))
        .pipe(gulp.dest(conf.servePaths.scripts))
        .pipe(connect.reload());
});

gulp.task('scripts', ['scripts-jq', 'scripts-ng']);