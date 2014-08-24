var gulp = require('gulp'),
    less = require('gulp-less'),
    browserSync = require('browser-sync'),
    autoprefixer = require('gulp-autoprefixer'),
    clean = require('gulp-clean'),
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
    fs = require('fs'),
    concat = require('gulp-concat'),
    replace = require('gulp-replace'),
    htmlreplace = require('gulp-html-replace'),
    package = require('./package.json'),
    revall = require("gulp-rev-all"),
    bower = require('./bower.json');

// Script Headers
var banner = [
  '/*!\n' +
  ' * <%= package.name %>\n' +
  ' * <%= package.title %>\n' +
  ' * <%= package.url %>\n' +
  ' * @author <%= package.author %>\n' +
  ' * @version <%= package.version %>\n' +
  ' * Copyright ' + new Date()
    .getFullYear() + '. <%= package.license %> licensed.\n' +
  ' */',
  '\n'
].join('');

// Vendor Scripts
var vendor_scripts = [
    './src/vendor/jquery/dist/jquery.min.js'
];

// Font paths
var font_paths = [
    './src/fonts/**/*.*'
];

// Image paths
var image_paths = [
    './src/images/**/*.*'
];

// Clean
gulp.task('clean', function () {
    return gulp.src(['./dist', './final'], {
        read: false
    })
        .pipe(clean());
});

// Copy all static images
gulp.task('images', function () {
    return gulp.src(image_paths)
        .pipe(gulp.dest('./dist/images/'));
});

// Copy all static fonts
gulp.task('fonts', function () {
    return gulp.src(font_paths)
        .pipe(gulp.dest('./dist/fonts/'));
});

// Compile all .less files, producing .css
gulp.task('less', function () {
    return gulp.src('./src/less/app.less')
        .pipe(replace('url(../images/', 'url(images/'))
        .pipe(replace('url(../fonts/', 'url(fonts/'))
        .pipe(less())
        .pipe(replace("../../", ""))
        .pipe(minifyCSS())
        .pipe(header(banner, {
            package: package
        }))
        .pipe(rename('app.css'))
        .pipe(gulp.dest('./dist/'));
});

// HTML
gulp.task('html', function () {
    return gulp.src('./src/index.html')
        .pipe(htmlreplace({
            'css': 'app.css',
            'vendor': 'vendor.min.js',
            'js': 'app.min.js',
            'debug': ''
        }))
        .pipe(gulp.dest('./dist/'));
});

// Favico
gulp.task('favicon', function () {
    return gulp.src('./src/favicon.ico')
        .pipe(gulp.dest('./dist/'));
});

// Vendors
gulp.task('vendor', function () {
    // Vendor scripts
    return gulp.src(vendor_scripts)
        .pipe(concat('vendor.min.js'))
        .pipe(uglify())
        .pipe(header(banner, {
            package: package
        }))
        .pipe(gulp.dest('./dist'));
});

// Compile App JS
gulp.task('js', function () {
    // App scripts
    var b = browserify({
        entries: "./src/js/bootstrap.js"
    });

    b.transform('brfs');

    return b.bundle()
        .on('error', gutil.log)
        .pipe(source("app.min.js"))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(header(banner, {
            package: package
        }))
        .pipe(gulp.dest('./dist'));
});

// Watchers
gulp.task('default', ['fonts', 'images', 'less', 'vendor', 'js', 'html', 'favicon'], function () {
    // Revisions
    gulp.src('./dist/**/*.*')
        .pipe(revall({
            ignore: [/^\/favicon.ico$/g, '.html']
        }))
        .pipe(gulp.dest('./final'));

    console.log('\nPlaced optimized files in `dist/`\n');

    gulp.watch('./src/fonts/**/*', ['fonts']);
    gulp.watch('./src/images/**/*', ['images']);
    gulp.watch('./src/less/**/*', ['less']);
    gulp.watch('./src/vendor/**/*', ['vendor']);
    gulp.watch('./src/js/**/*', ['js']);
    gulp.watch('./src/**/*.html', ['html']);
    gulp.watch('./src/**/*.ico', ['favicon']);

    console.log('\Watching files in `src/`\n');
});
