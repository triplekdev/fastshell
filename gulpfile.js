var gulp = require('gulp'),
  less = require('gulp-less'),
  browserSync = require('browser-sync'),
  autoprefixer = require('gulp-autoprefixer'),
  uglify = require('gulp-uglify'),
  jshint = require('gulp-jshint'),
  header = require('gulp-header'),
  rename = require('gulp-rename'),
  minifyCSS = require('gulp-minify-css'),
  vendor = require('gulp-concat-vendor'),
  rimraf = require('gulp-rimraf'),
  gutil = require('gulp-util'),
  package = require('./package.json');

// Script Headers
//
var banner = [
  '/*!\n' +
  ' * <%= package.name %>\n' +
  ' * <%= package.title %>\n' +
  ' * <%= package.url %>\n' +
  ' * @author <%= package.author %>\n' +
  ' * @version <%= package.version %>\n' +
  ' * Copyright ' + new Date().getFullYear() + '. <%= package.license %> licensed.\n' +
  ' */',
  '\n'
].join('');

// Clean Javascripts
//
gulp.task('clean:js', function () {
  gulp.src('app/assets/js/*', {
    read: false
  })
    .pipe(rimraf({
      force: true
    }));
});

// Clean Stylesheets
//
gulp.task('clean:css', function () {
  gulp.src('app/assets/css/*', {
    read: false
  })
    .pipe(rimraf({
      force: true
    }));
});

// Compile Less
//
gulp.task('css', ['clean:css'], function () {
  gulp.src('src/less/app.less')
    .pipe(less().on('error', gutil.log))
    .pipe(minifyCSS())
    .pipe(header(banner, {
      package: package
    }))
    .pipe(rename('app.min.css'))
    .pipe(gulp.dest('app/assets/css'))
    .pipe(browserSync.reload({
      stream: true
    }));
});

// Compile Javascripts
//
gulp.task('js', ['clean:js'], function () {
  gulp.src('src/js/app.js')
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('default'))
    .pipe(uglify())
    .pipe(header(banner, {
      package: package
    }))
    .pipe(rename('app.min.js'))
    .pipe(gulp.dest('app/assets/js'))
    .pipe(browserSync.reload({
      stream: true,
      once: true
    }));
});

// Concat Vendor Scripts
//
gulp.task('vendor', function () {
  gulp.src([
      'src/vendor/*',
      'src/vendor/modernizr/modernizr.js'
    ])
    .pipe(vendor('vendor.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('app/assets/js'))
    .pipe(browserSync.reload({
      stream: true,
      once: true
    }));
});

// Server
//
gulp.task('browser-sync', function () {
  browserSync.init(null, {
    port: 8888,
    server: {
      baseDir: "app"
    }
  });
});

// Reloading browser
//
gulp.task('bs-reload', function () {
  browserSync.reload();
});

// Watchers
//
gulp.task('default', ['css', 'vendor', 'js', 'browser-sync'], function () {
  gulp.watch("src/less/**/*.less", ['css']);
  gulp.watch("src/vendor/**/*.js", ['vendor']);
  gulp.watch("src/js/*.js", ['js']);
  gulp.watch("app/*.html", ['bs-reload']);
});
