var gulp = require('gulp');
var panini = require('panini');
var sass = require('gulp-sass');
var prefix = require('gulp-autoprefixer');
var cssnano = require('gulp-cssnano');
var fs = require('fs');
var plumber = require('gulp-plumber');
var notify = require('gulp-notify');
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');
var browserSync = require('browser-sync');
var del = require('del');
var runSequence = require('run-sequence');
var reload = browserSync.reload;
var zip = require('gulp-zip');
var ghPages = require('gulp-gh-pages');

var PROJECT_NAME = 'devboost';
var PATH = {
  app: {
    html: ['app/*.html'],
    styles: 'app/assets/styles/*.scss',
    scripts: 'app/assets/scripts/*.js',
    images: 'app/assets/images/**/*',
    fonts: 'app/assets/fonts/**/*',
    rootfiles: ['app/*.*', '!app/*.html']
  },
  dist: {
    html: 'dist',
    styles: 'dist/assets/styles/',
    scripts: 'dist/assets/scripts/',
    images: 'dist/assets/images/',
    fonts: 'dist/assets/fonts/',
    rootfiles: 'dist'
  },
  watch: {
    html: 'dist/*.html',
    handlebars: 'app/**/*.html',
    styles: 'app/assets/styles/**/*',
    scripts: 'app/assets/scripts/**/*',
    images: 'app/assets/images/**/*',
    fonts: 'app/assets/fonts/**/*',
    rootfiles: ['app/*.*', '!app/*.html']
  },
  clean: './dist',
  serve: 'dist',
  zip: 'dist/**/*'
};

gulp.task('html', ['refresh'], function() {
  return gulp.src(PATH.app.html)
    .pipe(panini({
      root: './app/',
      layouts: './app/layouts/',
      partials: './app/components/',
      helpers: './app/helpers/',
      data: './app/data/'
    }))
    .pipe(gulp.dest(PATH.dist.html));
});

gulp.task('refresh', function(done) {
  panini.refresh();
  done();
});

gulp.task('styles', function() {
  return gulp.src(PATH.app.styles)
    .pipe(plumber({
      errorHandler: notify.onError(function(err) {
        return {
          title: 'Styles',
          message: err.message
        };
      })
    }))
    .pipe(sass({
      outputStyle: 'expanded'
    }))
    .pipe(prefix({
      browsers: ['last 15 versions']
    }))
    .pipe(cssnano({
      autoprefixer: false
    }))
    .pipe(gulp.dest(PATH.dist.styles))
    .pipe(reload({stream: true}));
});

gulp.task('scripts', function() {
  return gulp.src(PATH.app.scripts)
    .pipe(gulp.dest(PATH.dist.scripts))
    .pipe(reload({stream: true}));
});

gulp.task('images', function() {
  return gulp.src(PATH.app.images)
    .pipe(cache(imagemin()))
    .pipe(gulp.dest(PATH.dist.images));
});

gulp.task('fonts', function() {
  return gulp.src(PATH.app.fonts)
    .pipe(gulp.dest(PATH.dist.fonts));
});

gulp.task('rootfiles', function() {
  return gulp.src(PATH.app.rootfiles)
    .pipe(gulp.dest(PATH.dist.rootfiles));
});

gulp.task('clear', function(done) {
  return cache.clearAll(done);
});

gulp.task('clean', ['clear'], function() {
  return del(PATH.clean);
});

gulp.task('build', ['clean'], function(callback) {
  runSequence(
    ['styles', 'scripts'],
    'html',
    'images',
    'fonts',
    'rootfiles',
    callback);
});

gulp.task('serve', ['build'], function() {
  browserSync.init({
    server: {
      baseDir: PATH.serve,
    },
    port: 1508,
    notify: false
  });

  gulp.watch(PATH.watch.html).on('change', reload);
  gulp.watch(PATH.watch.handlebars, ['html']);
  gulp.watch(PATH.watch.styles, ['styles']);
  gulp.watch(PATH.watch.scripts, ['scripts']);
  gulp.watch(PATH.watch.images, ['images']);
  gulp.watch(PATH.watch.fonts, ['fonts']);
  gulp.watch(PATH.watch.rootfiles, ['rootfiles']);
});

gulp.task('zip', function() {
  return gulp.src(PATH.zip)
    .pipe(zip(PROJECT_NAME + '.pack.zip'))
    .pipe(gulp.dest('./'));
});

gulp.task('gh-pages', ['build'], function() {
  return gulp.src(PATH.serve + '/**/*')
    .pipe(ghPages());
});

gulp.task('default', ['serve']);
