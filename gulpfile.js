var gulp = require('gulp');
var cssnano = require('gulp-cssnano');
var jade = require('gulp-jade');
var stylus = require('gulp-stylus');
var nib = require('nib');
var jeet = require('jeet');
var plumber = require('gulp-plumber');
var imagemin = require('gulp-imagemin');
var browserSync = require('browser-sync');
var del = require('del');
var runSequence = require('run-sequence');
var reload = browserSync.reload;

var path = {
  app: {
    html: 'app/*.jade',
    css: 'app/assets/styles/*.styl',
    js: 'app/assets/scripts/*.js',
    img: 'app/assets/images/**/*',
    fonts: 'app/assets/fonts/**/*',
    rootfiles: [
      'app/*.*',
      '!app/*.jade'
    ]
  },
  dist: {
    html: 'dist',
    css: 'dist/assets/styles',
    js: 'dist/assets/scripts',
    img: 'dist/assets/images',
    fonts: 'dist/assets/fonts',
    rootfiles: 'dist'
  },
  watch: {
    html: 'app/**/*.jade',
    css: 'app/assets/styles/**/*',
    js: 'app/assets/scripts/**/*',
    img: 'app/assets/images/**/*',
    fonts: 'app/assets/fonts/**/*',
    rootfiles: [
      'app/*',
      '!app/*.jade'
    ]
  },
  clean: 'dist/*'
}

// Очистка папки дистрибутива dist
gulp.task('clean', function() {
  return del(path.clean);
});

// Копирует все файлы из корня папки app
gulp.task('copy-rootfiles', function() {
  return gulp.src(path.app.rootfiles)
    .pipe(gulp.dest(path.dist.rootfiles));
});

// Компилирует jade шаблоны
gulp.task('build-html', function() {
  return gulp.src(path.app.html)
    .pipe(plumber())
    .pipe(jade({
      pretty: true
    }))
    .pipe(gulp.dest(path.dist.html));
});

gulp.task('jade-watch', ['build-html'], reload);

// Компилирует stylus файлы
gulp.task('build-styles', function() {
  return gulp.src(path.app.css)
    .pipe(plumber())
    .pipe(stylus({
      'include css': true,
      use: [nib(),jeet()]
    }))
    .pipe(cssnano())
    .pipe(gulp.dest(path.dist.css))
    .pipe(reload({stream: true}));
});

// Копирует скрипты
gulp.task('build-scripts', function() {
  return gulp.src(path.app.js)
    .pipe(gulp.dest(path.dist.js));
});

gulp.task('scripts-watch', ['build-scripts'], reload);

// Сжимает и копирует изображения
gulp.task('build-images', function() {
  return gulp.src(path.app.img)
    .pipe(plumber())
    .pipe(imagemin())
    .pipe(gulp.dest(path.dist.img));
});

// Копирует шрифты
gulp.task('build-fonts', function() {
  return gulp.src(path.app.fonts)
    .pipe(gulp.dest(path.dist.fonts));
});

// Собирает проект
gulp.task('build', ['clean'], function(callback) {
  runSequence(
    'build-fonts',
    'build-images',
    'build-styles',
    'build-scripts',
    ['build-html', 'copy-rootfiles'],
    callback);
});

// Запускает сервер Browsersync
gulp.task('server', ['build'], function() {

  browserSync.init({
    server: {
      baseDir: 'dist',
    },
    notify: false
  });

  gulp.watch(path.watch.html, ['jade-watch']);
  gulp.watch(path.watch.rootfiles, ['copy-rootfiles']);
  gulp.watch(path.watch.css, ['build-styles']);
  gulp.watch(path.watch.js, ['scripts-watch']);
  gulp.watch(path.watch.img, ['build-images']);
  gulp.watch(path.watch.fonts, ['build-fonts']);

});

// Задача по-умолчанию
// Запускает окружение для разработки
gulp.task('default', ['server']);
