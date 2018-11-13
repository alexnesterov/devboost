'use strict';

import gulp from 'gulp';
import yargs from 'yargs';
import yaml from 'js-yaml';
import panini from 'panini';
import htmlbeautify from 'gulp-html-beautify';
import sass from 'gulp-sass';
import prefix from 'gulp-autoprefixer';
import cssnano from 'gulp-cssnano';
import gulpIf from 'gulp-if';
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
const PRODUCTION = !!(yargs.argv.production);
const { COMPATIBILITY, PORT, PATHS } = loadConfig();

function loadConfig() {
  let ymlFile = fs.readFileSync('config.yml', 'utf8');
  return yaml.load(ymlFile);
}

export const clean = () => {
  return del(PATHS.dist);
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
  return gulp.src('src/*.{html,hbs,handlebars}')
    .pipe(panini({
      root: 'src/',
      layouts: 'src/layouts/',
      partials: 'src/components/',
      helpers: 'src/helpers/',
      data: 'src/data/'
    }))
    .pipe(htmlbeautify({
      indent_size: 2,
      max_preserve_newlines: 0,
      end_with_newline: true,
      extra_liners: []
    }))
    .pipe(gulp.dest(PATHS.dist));
}

export function refresh(done) {
  panini.refresh();
  done();
}

export function styles() {
  return gulp.src('src/assets/styles/*.scss')
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
      browsers: COMPATIBILITY
    }))
    .pipe(gulpIf(PRODUCTION, cssnano({
      autoprefixer: false
    })))
    .pipe(gulp.dest(PATHS.dist + '/assets/styles'))
    .pipe(reload({stream: true}));
}

export function scripts() {
  return gulp.src(PATHS.entries)
    .pipe(gulp.dest(PATHS.dist + '/assets/scripts'))
    .pipe(reload({stream: true}));
}

export function images() {
  return gulp.src('src/assets/images/**/*')
    .pipe(cache(imagemin()))
    .pipe(gulp.dest(PATHS.dist + '/assets/images'));
}

export function fonts() {
  return gulp.src('src/assets/fonts/**/*')
    .pipe(gulp.dest(PATHS.dist + '/assets/fonts'));
}

export function rootfiles() {
  return gulp.src(['src/*.*', '!src/*.html'])
    .pipe(gulp.dest(PATHS.dist));
}

export function serve() {
  browserSync.init({
    server: {
      baseDir: PATHS.dist,
    },
    port: PORT,
    notify: false
  });

  gulp.watch('src/**/*.html').on('all', gulp.series(html, reload));
  gulp.watch(PATHS.dist + '/*.html').on('all', gulp.series(reload));
  gulp.watch('src/{layouts,components}/**/*.html').on('all', gulp.series(refresh, html, reload));
  gulp.watch('src/data/**/*.{js,json,yml').on('all', gulp.series(refresh, html, reload));
  gulp.watch('src/helpers/**/*.js').on('all', gulp.series(refresh, html, reload));
  gulp.watch('src/assets/styles/**/*').on('all', styles);
  gulp.watch('src/assets/scripts/**/*.js').on('all', gulp.series(scripts, reload));
  gulp.watch('src/assets/images/**/*').on('all', gulp.series(images, reload));
  gulp.watch('src/assets/fonts/**/*').on('all', gulp.series(fonts, reload));
  gulp.watch(['src/*.*', '!src/*.html']).on('all', gulp.series(rootfiles, reload));
}

gulp.task('zip', () => {
  return gulp.src(PATHS.dist)
    .pipe(zip('project.pack.zip'))
    .pipe(gulp.dest('./'));
});

gulp.task('gh-pages', gulp.series('build', () => {
  return gulp.src(PATHS.dist + '/**/*')
    .pipe(ghPages());
}));


