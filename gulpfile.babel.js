import gulp from 'gulp';
import panini from 'panini';
import htmlbeautify from 'gulp-html-beautify';
import sass from 'gulp-sass';
import prefix from 'gulp-autoprefixer';
import cssnano from 'gulp-cssnano';
import fs from 'fs';
import plumber from 'gulp-plumber';
import notify from 'gulp-notify';
import imagemin from 'gulp-imagemin';
import cache from 'gulp-cache';
import browserSync from 'browser-sync';
import del from 'del';
import zip from 'gulp-zip';
import ghPages from 'gulp-gh-pages';

const reload = browserSync.reload;

const PROJECT_NAME = 'devboost';
const PATH = {
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

export const clean = () => {
  return del(PATH.clean);
};

gulp.task('build', gulp.series(
  clean,
  styles,
  scripts,
  html,
  images,
  fonts,
  rootfiles
));

gulp.task('default', gulp.series('build', serve));

export function html() {
  return gulp.src(PATH.app.html)
    .pipe(panini({
      root: './app/',
      layouts: './app/layouts/',
      partials: './app/components/',
      helpers: './app/helpers/',
      data: './app/data/'
    }))
    .pipe(htmlbeautify({
      indent_size: 2,
      max_preserve_newlines: 0,
      end_with_newline: true,
      extra_liners: []
    }))
    .pipe(gulp.dest(PATH.dist.html));
}

export function refresh(done) {
  panini.refresh();
  done();
}

export function styles() {
  return gulp.src(PATH.app.styles)
    .pipe(plumber({
      errorHandler: notify.onError((err) => {
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
      browsers: [
        '> 1%',
        'last 15 versions',
        'ie >= 9'
      ]
    }))
    .pipe(cssnano({
      autoprefixer: false
    }))
    .pipe(gulp.dest(PATH.dist.styles))
    .pipe(reload({stream: true}));
}

export function scripts() {
  return gulp.src(PATH.app.scripts)
    .pipe(gulp.dest(PATH.dist.scripts))
    .pipe(reload({stream: true}));
}

export function images() {
  return gulp.src(PATH.app.images)
    .pipe(cache(imagemin()))
    .pipe(gulp.dest(PATH.dist.images));
}

export function fonts() {
  return gulp.src(PATH.app.fonts)
    .pipe(gulp.dest(PATH.dist.fonts));
}

export function rootfiles() {
  return gulp.src(PATH.app.rootfiles)
    .pipe(gulp.dest(PATH.dist.rootfiles));
}

export function serve() {
  browserSync.init({
    server: {
      baseDir: PATH.serve,
    },
    port: 1508,
    notify: false
  });

  gulp.watch(PATH.watch.html).on('change', reload);
  gulp.watch(PATH.watch.handlebars, gulp.series(refresh, 'html'));
  gulp.watch(PATH.watch.styles, gulp.series('styles'));
  gulp.watch(PATH.watch.scripts, gulp.series('scripts'));
  gulp.watch(PATH.watch.images, gulp.series('images'));
  gulp.watch(PATH.watch.fonts, gulp.series('fonts'));
  gulp.watch(PATH.watch.rootfiles, gulp.series('rootfiles'));
}

gulp.task('zip', () => {
  return gulp.src(PATH.zip)
    .pipe(zip(PROJECT_NAME + '.pack.zip'))
    .pipe(gulp.dest('./'));
});

gulp.task('gh-pages', gulp.series('build', () => {
  return gulp.src(PATH.serve + '/**/*')
    .pipe(ghPages());
}));


