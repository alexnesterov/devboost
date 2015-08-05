var gulp = require('gulp');
var minifyCss = require('gulp-minify-css');
var jade = require('gulp-jade');
var stylus = require('gulp-stylus');
var nib = require('nib');
var plumber = require('gulp-plumber');
var imagemin = require('gulp-imagemin');
var browserSync = require('browser-sync').create();

var appFolder = {
  fonts: 'app/assets/fonts',
  img: 'app/assets/img',
  css: 'app/assets/css',
  js: 'app/assets/js',
  templates: 'app/templates'
}

var distFolder = {
  fonts: 'dist/assets/fonts',
  img: 'dist/assets/img',
  css: 'dist/assets/css',
  js: 'dist/assets/js',
  templates: 'dist'
}

//Fonts Tasks
gulp.task('fonts', function() {
  gulp.src(appFolder.fonts + '/**/*')
  gulp.dest(distFolder.fonts);
});

//Images Task
gulp.task('img', function() {
  gulp.src(appFolder.img + '/**/*')
    .pipe(plumber())
    .pipe(imagemin())
    .pipe(gulp.dest(distFolder.img))
    .pipe(browserSync.stream());
});

// Styles Task
gulp.task('css', function() {
  gulp.src(appFolder.css + '/*.styl')
    .pipe(plumber())
    .pipe(stylus({
      'include css': true,
      use: [nib()]
    }))
    //.pipe(minifyCss())
    .pipe(gulp.dest(distFolder.css))
    .pipe(browserSync.stream());
});

//Scripts Task
gulp.task('js', function() {
  gulp.src('app/components/jquery/dist/jquery.min.js')
    .pipe(gulp.dest(distFolder.js + '/vendor'))
    .pipe(browserSync.stream());
  gulp.src(appFolder.js + '/common.js')
    .pipe(gulp.dest(distFolder.js))
    .pipe(browserSync.stream());
});

// Templates Task
gulp.task('templates', function() {
  gulp.src(appFolder.templates + '/*.jade')
    .pipe(plumber())
    .pipe(jade({
      pretty: true
    }))
    .pipe(gulp.dest(distFolder.templates))
    .pipe(browserSync.stream());
});

// Watching files task
gulp.task('watch', ['fonts', 'img', 'css', 'js', 'templates'], function() {
  gulp.watch(appFolder.fonts + '/**/*', ['fonts']);
  gulp.watch(appFolder.img + '/**/*', ['img']);
  gulp.watch(appFolder.css + '/**/*.styl', ['css']);
  gulp.watch(appFolder.js + '/**/*', ['js']);
  gulp.watch(appFolder.templates + '/**/*.jade', ['templates']);
});

// Browsersync Task
gulp.task('server', ['watch'], function () {
  browserSync.init({
    server: {
      baseDir: 'dist',
      notify: false
    }
  });
});

// Default task
// Run development environment
gulp.task('default', ['server']);
