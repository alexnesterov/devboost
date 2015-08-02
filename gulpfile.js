var gulp = require('gulp');
var minifyCss = require('gulp-minify-css');
var jade = require('gulp-jade');
var stylus = require('gulp-stylus');
var nib = require('nib');
var plumber = require('gulp-plumber');
var connect = require('gulp-connect');
var open = require('gulp-open');
var imagemin = require('gulp-imagemin');

var appFolder = {
  fonts: "app/assets/fonts",
  images: "app/assets/images",
  styles: "app/assets/styles",
  scripts: "app/assets/scripts",
  templates: "app/templates"
}

var distFolder = {
  fonts: "dist/assets/fonts",
  images: "dist/assets/images",
  styles: "dist/assets/styles",
  scripts: "dist/assets/scripts",
  templates: "dist"
}

// Templates Task
gulp.task('templates', function() {
  gulp.src(appFolder.templates + '/*.jade')
    .pipe(plumber())
    .pipe(jade({
      pretty: true
    }))
    .pipe(gulp.dest(distFolder.templates))
    .pipe(connect.reload());
});

// Styles Task
gulp.task('styles', function() {
  gulp.src(appFolder.styles + '/*.styl')
    .pipe(plumber())
    .pipe(stylus({
      'include css': true,
      use: [nib()]
    }))
    //.pipe(minifyCss())
    .pipe(gulp.dest(distFolder.styles))
    .pipe(connect.reload());
});

//Images Task
gulp.task('images', function() {
  gulp.src(appFolder.images + '/**/*')
    .pipe(imagemin())
    .pipe(gulp.dest(distFolder.images))
    .pipe(connect.reload());
});

//Scripts Task
gulp.task('scripts', function() {
  gulp.src('app/components/jquery/dist/jquery.min.js')
    .pipe(gulp.dest(distFolder.scripts + '/vendor'));
  gulp.src(appFolder.scripts + '/main.js')
    .pipe(gulp.dest(distFolder.scripts))
    .pipe(connect.reload());
});

// Watching files task
gulp.task('watch', ['templates', 'styles', 'scripts'], function() {
  gulp.watch(appFolder.templates + '/**/*.jade', ['templates']);
  gulp.watch(appFolder.styles + '/**/*.styl', ['styles']);
  gulp.watch(appFolder.images + '/**/*', ['images']);
  gulp.watch(appFolder.scripts + '/**/*', ['scripts']);
});

// Server tasks
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
    root: 'dist',
    livereload: true
  });
});

// Default task
// Run development environment
gulp.task('default', ['images', 'watch', 'server', 'open']);