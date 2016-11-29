exports.srcPaths = {
    styles: 'css',
    vendor: 'bower_components',
    scripts: 'js'
};

exports.servePaths = {
    styles: 'serve/css',
    scripts: 'serve/js'
};

exports.server = {
    root: [__dirname + '/../'],
    livereload: true,
    port: 3000
};