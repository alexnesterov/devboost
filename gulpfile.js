var gulp = require('gulp');
var sass = require('gulp-sass');
var bourbon = require('node-bourbon');
var prefix = require('gulp-autoprefixer');
var cssnano = require('gulp-cssnano');
var pug = require('gulp-pug');
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

// Пути проекта
var p = {
  name: 'devboost',   // Имя проекта
  app: 'app',         // Исходники проекта
  dist: 'dist'        // Собранный проект
};

// Компилирует pug файлы
gulp.task('build-html', function() {
  return gulp.src([p.app + '/*.pug', '!' + p.app + '/config.pug'])
    .pipe(plumber({
      errorHandler: notify.onError(function(err) {
        return {
          title: 'Html',
          message: err.message
        }
      })
    }))
    .pipe(pug({
      pretty: true
    }))
    .pipe(gulp.dest(p.dist));
});

gulp.task('jade-watch', ['build-html'], reload);

// Компилирует sass файлы
gulp.task('build-styles', function() {
  return gulp.src(p.app + '/assets/styles/*.sass')
    .pipe(plumber({
      errorHandler: notify.onError(function(err) {
        return {
          title: 'Styles',
          message: err.message
        }
      })
    }))
    .pipe(sass({
      outputStyle: 'expanded',
      includePaths: [bourbon.includePaths, 'node_modules/susy/sass']
    }))
    .pipe(prefix({
      browsers: ['last 15 versions']
    }))
    .pipe(cssnano({
      autoprefixer: false
    }))
    .pipe(gulp.dest(p.dist + '/assets/styles/'))
    .pipe(reload({stream: true}));
});

// Копирует скрипты
gulp.task('build-scripts', function() {
  return gulp.src(p.app + '/assets/scripts/*.js')
    .pipe(gulp.dest(p.dist + '/assets/scripts/'));
});

gulp.task('scripts-watch', ['build-scripts'], reload);

// Сжимает и копирует изображения
gulp.task('build-images', function() {
  return gulp.src(p.app + '/assets/images/**/*')
    .pipe(plumber({
      errorHandler: notify.onError(function(err) {
        return {
          title: 'Images',
          message: err.message
        }
      })
    }))
    .pipe(cache(imagemin()))
    .pipe(gulp.dest(p.dist + '/assets/images/'));
});

// Копирует шрифты
gulp.task('build-fonts', function() {
  return gulp.src(p.app + '/assets/fonts/**/*')
    .pipe(gulp.dest(p.dist + '/assets/fonts/'));
});

// Копирует все файлы из корня папки app, кроме файлов с расширением pug
gulp.task('copy-rootfiles', function() {
  return gulp.src([p.app + '/*.*', '!' + p.app + '/*.pug'])
    .pipe(gulp.dest(p.dist));
});

// Очистка кэша
gulp.task('clear', function (done) {
  return cache.clearAll(done);
});

// Очистка папки дистрибутива dist
gulp.task('clean', ['clear'], function() {
  return del(p.dist);
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

// Запускает сервер Browsersync и слежку за файлами
gulp.task('serve', ['build'], function() {

  browserSync.init({
    server: {
      baseDir: p.dist,
    },
    port: 1508,
    notify: false
  });

  gulp.watch(p.app + '/**/*.pug', ['jade-watch']);
  gulp.watch([p.app + '/*.*', '!' + p.app + '/*.pug'], ['copy-rootfiles']);
  gulp.watch(p.app + '/assets/styles/**/*', ['build-styles']);
  gulp.watch(p.app + '/assets/scripts/**/*', ['scripts-watch']);
  gulp.watch(p.app + '/assets/images/**/*', ['build-images']);
  gulp.watch(p.app + '/assets/fonts/**/*', ['build-fonts']);

});

// Создает архив собранного проекта
gulp.task('zip', function () {
  return gulp.src(p.dist + '/**/*')
    .pipe(zip(p.name + '.pack.zip'))
    .pipe(gulp.dest('./'))
});

// Деплой на gh-pages
gulp.task('deploy', function() {
  return gulp.src('./dist/**/*')
    .pipe(ghPages());
});

// Задача по-умолчанию
// Запускает окружение для разработки
gulp.task('default', ['serve']);
