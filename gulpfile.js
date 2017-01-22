
var gulp = require('gulp');
var sass = require('gulp-sass');

var babelify = require('babelify');
var browserify = require('browserify');
var source = require('vinyl-source-stream');

var spawnSync = require('child_process').spawnSync;

var jsxDir = "./app/jsx";

gulp.task('build', function () {
    return browserify({entries: jsxDir + '/app.jsx', extensions: ['.jsx'], debug: true})
        .transform(babelify)
        .bundle()
        .pipe(source('./bundle.js'))
        .pipe(gulp.dest('build'));
});

gulp.task('sass', function() {
    console.log("Watching folder ./scss for changes.");
	return gulp.src('./sass/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./build'));

});

gulp.task('watch', ['build'], function () {
    //gulp.watch(jsxDir + '/*.jsx', ['build']);
    gulp.watch('./app/**/*.*', ['build']);
    gulp.watch('./scss/*.*', ['sass']);
});

gulp.task('tags', function() {
    console.log("Building ctags for the project.");
    spawnSync('ctags', ['-R', 'app/', 'pug/', 'scss/']);
});

gulp.task('default', ['watch']);

