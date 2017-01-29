
var gulp = require('gulp');
var sass = require('gulp-sass');

var babelify = require('babelify');
var browserify = require('browserify');
var source = require('vinyl-source-stream');

var nodemon = require('gulp-nodemon');

var spawn = require('child_process').spawn;

var jsxDir = './app/jsx';

var port = process.env.PORT || 7070;

// Define paths for all source files here
var paths = {
    client: ['./app/jsx/*.jsx', './app/common/ajax-functions.js'],
    sass: ['./scss/*.*'],

    server: './server.js',
    serverIgnore: ['./app/jsx', './app/common/ajax-functions.js'],

    tags: ['./app/**/*', './pug/**/*', './scss/**/*'],

};

gulp.task('build', function() {
    return browserify({entries: jsxDir + '/app.jsx',
        extensions: ['.jsx'], debug: true})
        .transform(babelify)
        .bundle()
        .pipe(source('./bundle.js'))
        .pipe(gulp.dest('build'));
});

gulp.task('build-test', function() {
    return browserify({entries:
        ['./app/common/ajax-functions.js', 'tests/ajax-functions.js'],
        extensions: ['.js'], debug: true})
        .transform(babelify)
        .bundle()
        .pipe(source('./bundleTests.js'))
        .pipe(gulp.dest('build'));
});

gulp.task('sass', function() {
    console.log('Watching folder ./scss for changes.');
	return gulp.src('./sass/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./build'));

});

gulp.task('serve', function(cb) {
    var called = false;
    nodemon({
        script: paths.server,
        ext: '.js',
        ignore: paths.serverIgnore,
        //exec: 'node',
        env: {
            NODE_ENV: process.env.NODE_ENV || 'development',
            DEBUG: process.env.DEBUG || 0,
            PORT: port
        }
    })
    .on('start', function() {
        if (!called) {
            console.log('Server started on port ' + port);
            called = true;
            cb();
        }
    })
    .on('restart', function(files) {
        if (files) {
            console.log('Nodemon will restart due to changes in: ', files);
        }
    });
});

// Bit unusual task. Builds ctags-file for easier src navigation in Vim
gulp.task('tags', function() {
    console.log('Building ctags for the project.');
    spawn('ctags', ['-R', 'app/', 'pug/', 'scss/']);
});

var watchDependents = [
  'build',
  'tags',
  'sass',
  'serve'
];

gulp.task('watch', watchDependents, function() {
    gulp.watch(paths.client, ['build']);
    gulp.watch(paths.server, ['serve']);
    gulp.watch(paths.sass, ['sass']);
    gulp.watch(paths.tags, ['tags']);
});

gulp.task('default', ['watch']);

