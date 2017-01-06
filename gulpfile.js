
var gulp = require('gulp');

var babelify = require('babelify');
var browserify = require('browserify');
var source = require('vinyl-source-stream');

var jsx = "./app/jsx";

gulp.task('build', function () {
    return browserify({entries: jsx + '/app.jsx', extensions: ['.jsx'], debug: true})
        .transform(babelify)
        .bundle()
        .pipe(source('./bundle.js'))
        .pipe(gulp.dest('build'));
});

gulp.task('watch', ['build'], function () {
    gulp.watch(jsx + '/*.jsx', ['build']);
});

gulp.task('default', ['watch']);
