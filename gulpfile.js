var gulp = require('gulp');
var minifyCss = require('gulp-minify-css');
var jade = require('gulp-jade');
var stylus = require('gulp-stylus');
var nib = require('nib');
var jeet = require('jeet');
var plumber = require('gulp-plumber');
var imagemin = require('gulp-imagemin');
var browserSync = require('browser-sync').create();
var del = require('del');

var path = {
  app: {
    html: 'app/*.jade',
    css: 'app/assets/styles/*.styl',
    js: 'app/assets/scripts/*.js',
    img: 'app/assets/images/**/*',
    fonts: 'app/assets/fonts/**/*',
    rootfiles: [
      'app/*',
      '!app/assets',
      '!app/layouts',
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
    html: [
      'app/*.jade',
      'app/layouts/*.jade'
    ],
    css: 'app/assets/styles/**/*',
    js: 'app/assets/scripts/**/*',
    img: 'app/assets/images/**/*',
    fonts: 'app/assets/fonts/**/*',
    rootfiles: [
      'app/*',
      '!app/*.jade'
    ]
  },
  clean: 'dist',
  gitkeep: 'app/**/.gitkeep'
}

// Копирует все файлы из корня папки app
gulp.task('copy', function() {
  gulp.src(path.app.rootfiles)
    .pipe(gulp.dest(path.dist.rootfiles));
});

// Компилирует jade шаблоны
gulp.task('html', function() {
  gulp.src(path.app.html)
    .pipe(plumber())
    .pipe(jade({
      pretty: true
    }))
    .pipe(gulp.dest(path.dist.html))
    .pipe(browserSync.stream());
});

// Компилирует stylus файлы
gulp.task('css', function() {
  gulp.src(path.app.css)
    .pipe(plumber())
    .pipe(stylus({
      'include css': true,
      use: [nib(),jeet()]
    }))
    //.pipe(minifyCss())
    .pipe(gulp.dest(path.dist.css))
    .pipe(browserSync.stream());
});

// Копирует скрипты
gulp.task('js', function() {
  gulp.src('bower_components/jquery/dist/jquery.min.js')
    .pipe(gulp.dest(path.dist.js + '/vendor'))
    .pipe(browserSync.stream());
  gulp.src(path.app.js)
    .pipe(gulp.dest(path.dist.js))
    .pipe(browserSync.stream());
});

// Сжимает и копирует изображения
gulp.task('img', function() {
  gulp.src(path.app.img)
    .pipe(plumber())
    .pipe(imagemin())
    .pipe(gulp.dest(path.dist.img))
    .pipe(browserSync.stream());
});

// Копирует шрифты
gulp.task('fonts', function() {
  gulp.src(path.app.fonts)
    .pipe(gulp.dest(path.dist.fonts));
});

// Собирает проект
gulp.task('build', ['html', 'css', 'js', 'img', 'fonts', 'copy']);

// Запускает сервер Browsersync
gulp.task('server', function() {
  browserSync.init({
    server: {
      baseDir: 'dist',
    },
    notify: false
  });
});

// Запускает слежку за изменениями файлов
gulp.task('watch', function() {
  gulp.watch(path.watch.html, ['html']);
  gulp.watch(path.watch.css, ['css']);
  gulp.watch(path.watch.js, ['js']);
  gulp.watch(path.watch.img, ['img']);
  gulp.watch(path.watch.fonts, ['fonts']);
  gulp.watch(path.watch.rootfiles, ['copy']);
});

// Очистка папки дистрибутива dist
gulp.task('clean', function() {
  del(path.clean);
});

// Удаляет файлы gitkeep из проекта
gulp.task('gitkeep', function() {
  del(path.gitkeep);
});

// Задача по-умолчанию
// Запускает окружение для разработки
gulp.task('default', ['build', 'server', 'watch']);
