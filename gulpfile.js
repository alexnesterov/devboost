var gulp = require('gulp');
var minifyCss = require('gulp-minify-css');
var jade = require('gulp-jade');
var stylus = require('gulp-stylus');
var nib = require('nib');
var jeet = require('jeet');
var plumber = require('gulp-plumber');
var imagemin = require('gulp-imagemin');
var browserSync = require('browser-sync').create();
var clean = require('gulp-clean');

var path = {
  app: {
    html: 'app/*.jade',
    css: 'app/assets/css/*.styl',
    js: 'app/assets/js/*.js',
    img: 'app/assets/img/**/*',
    fonts: 'app/assets/fonts/**/*'
  },
  dist: {
    html: 'dist',
    css: 'dist/assets/css',
    js: 'dist/assets/js',
    img: 'dist/assets/img',
    fonts: 'dist/assets/fonts'
  },
  watch: {
    html: [
      'app/*.jade',
      'app/layouts/*.jade'
    ],
    css: 'app/assets/css/**/*',
    js: 'app/assets/js/**/*',
    img: 'app/assets/img/**/*',
    fonts: 'app/assets/fonts/**/*'
  },
  clean: 'dist',
  gitkeep: 'app/**/.gitkeep'
}

// Templates Task
gulp.task('html', function() {
  gulp.src(path.app.html)
    .pipe(plumber())
    .pipe(jade({
      pretty: true
    }))
    .pipe(gulp.dest(path.dist.html))
    .pipe(browserSync.stream());
});

// Styles Task
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

//Scripts Task
gulp.task('js', function() {
  gulp.src('bower_components/jquery/dist/jquery.min.js')
    .pipe(gulp.dest(path.dist.js + '/vendor'))
    .pipe(browserSync.stream());
  gulp.src(path.app.js)
    .pipe(gulp.dest(path.dist.js))
    .pipe(browserSync.stream());
});

//Images Task
gulp.task('img', function() {
  gulp.src(path.app.img)
    .pipe(plumber())
    .pipe(imagemin())
    .pipe(gulp.dest(path.dist.img))
    .pipe(browserSync.stream());
});

//Fonts Tasks
gulp.task('fonts', function() {
  gulp.src(path.app.fonts)
    .pipe(gulp.dest(path.dist.fonts));
});

// Build project
gulp.task('build', ['html', 'css', 'js', 'img', 'fonts']);

// Browsersync Task
gulp.task('server', function() {
  browserSync.init({
    server: {
      baseDir: 'dist',
      notify: false
    }
  });
});

// Watching files task
gulp.task('watch', function() {
  gulp.watch(path.watch.html, ['html']);
  gulp.watch(path.watch.css, ['css']);
  gulp.watch(path.watch.js, ['js']);
  gulp.watch(path.watch.img, ['img']);
  gulp.watch(path.watch.fonts, ['fonts']);
});

// Clean Task
gulp.task('clean', function() {
  return gulp.src(path.clean, {read: false})
    .pipe(clean());
});

// Remove gitkeep files
gulp.task('gitkeep', function() {
  return gulp.src(path.gitkeep, {read: false})
    .pipe(clean());
});

// Default task
// Run development environment
gulp.task('default', ['build', 'server', 'watch']);
