var gulp = require('gulp');
var minifyCss = require('gulp-minify-css');
var jade = require('gulp-jade');
var stylus = require('gulp-stylus');
var nib = require('nib');
var plumber = require('gulp-plumber');
var connect = require('gulp-connect');
var open = require('gulp-open');
var imagemin = require('gulp-imagemin');


// Jade Task
gulp.task('jade', function() {
  gulp.src('app/jade/*.jade')
    .pipe(plumber())
    .pipe(jade({
      pretty: true
    }))
    .pipe(gulp.dest('public'))
    .pipe(connect.reload());
});

// Stylus Task
gulp.task('stylus', function() {
  gulp.src('app/styl/*.styl')
    .pipe(plumber())
    .pipe(stylus({
      'include css': true,
      use: [nib()]
    }))
    //.pipe(minifyCss())
    .pipe(gulp.dest('public/css'))
    .pipe(connect.reload());
});

//Images Task
gulp.task('images', function() {
  gulp.src('app/img/**/*')
    .pipe(imagemin())
    .pipe(gulp.dest('public/img'))
    .pipe(connect.reload());
});

//Scripts Task
gulp.task('js', function() {
  gulp.src('app/components/jquery/dist/jquery.min.js')
    .pipe(gulp.dest('public/js/vendor'));
  gulp.src('app/js/main.js')
    .pipe(gulp.dest('public/js'))
    .pipe(connect.reload());
});

// Watching files task
gulp.task('watch', ['jade', 'stylus', 'js'], function() {
  gulp.watch('app/jade/**/*.jade', ['jade']);
  gulp.watch('app/styl/**/*.styl', ['stylus']);
  gulp.watch('app/img/**/*', ['images']);
  gulp.watch('app/js/**/*', ['js']);
});

// Open task
gulp.task('open', function() {
  gulp.src(__filename)
    .pipe(open({
      uri: 'http://localhost:8888',
      app: 'chrome'
    }));
});

gulp.task('server', function() {
  connect.server({
    port: 8888,
    root: 'public',
    livereload: true
  });
});

// Default task
// Run development environment
gulp.task('default', ['images', 'watch', 'server', 'open']);