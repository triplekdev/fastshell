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
  source = require('vinyl-source-stream'),
  browserify = require('browserify'),
  buffer = require('gulp-buffer'),
  fs = require('fs')
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
  var b = browserify({
    entries: "./src/js/app.js"
  });

  b.bundle().on('error', gutil.log)
    .pipe(source("app.min.js"))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(header(banner, {
      package: package
    }))
    .pipe(gulp.dest('app/assets/js'))
    .pipe(browserSync.reload({
      stream: true,
      once: true
    }));
});

// Concat Vendor Scripts
//
gulp.task('vendor', function () {
  if (fs.existsSync('src/vendor') && fs.readdirSync('src/vendor/').length >= 1) {
    gulp.src([
        'src/vendor/*'
        //'src/vendor/modernizr/modernizr.js'
    ])
      .pipe(vendor('vendor.min.js'))
      .pipe(uglify())
      .pipe(header(banner, {
        package: package
      }))
      .pipe(gulp.dest('app/assets/js'))
      .on('error', gutil.log);
  }

  // Bootstrap Fonts
  // gulp.src([
  //     'src/vendor/bootstrap/fonts/**/*.{ttf,woff,eot,svg}'
  //   ])
  //   .pipe(gulp.dest('app/assets/fonts'))
  //   .on('error', gutil.log);
});

// Concat All
//
/*gulp.task('all', function () {
  gulp.src([
      'app/assets/js/vendor.min.js', 'app/assets/js/app.min.js'
    ])
    .pipe(vendor('bundle.js'))
    .pipe(uglify())
    .pipe(header(banner, {
      package: package
    }))
    .pipe(gulp.dest('app/assets/js'))
    .on('error', gutil.log);
});*/

// Server
//
gulp.task('browser-sync', function () {
  browserSync.init(null, {
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
