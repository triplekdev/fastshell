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
gulp.task('images', ['clean'], function () {
    return gulp.src(image_paths)
        .pipe(gulp.dest('./dist/images/'));
});

// Copy all static fonts
gulp.task('fonts', ['clean'], function () {
    return gulp.src(font_paths)
        .pipe(gulp.dest('./dist/fonts/'));
});

// Compile all .less files, producing .css
gulp.task('less', ['clean'], function () {
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
        .pipe(gulp.dest('./dist/'))
        .pipe(browserSync.reload({stream:true, once: true}));
});

// HTML
gulp.task('html', ['clean'], function () {
    return gulp.src('./src/index.html')
        .pipe(htmlreplace({
            'css': 'app.css',
            'js': 'bundled.min.js',
            'debug': ''
        }))
        .pipe(gulp.dest('./dist/'))
        .pipe(browserSync.reload({once: true}));
});

// Favico
gulp.task('favicon', ['clean'], function () {
    return gulp.src('./src/favicon.ico')
        .pipe(gulp.dest('./dist/'));
});

// Compile App JS
gulp.task('js', ['vendor'], function () {
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
        .pipe(gulp.dest('./dist'))
        .pipe(browserSync.reload({stream:true, once: true}));
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
        .pipe(gulp.dest('./dist/'))
        .pipe(browserSync.reload({stream:true, once: true}));
});

// Bundle Vendor + App
gulp.task('bundled', ['vendor', 'js'], function () {
    return gulp.src(['./dist/vendor*.js', './dist/app*.js'])
        .pipe(concat('bundled.min.js'))
        .pipe(uglify())
        .pipe(header(banner, {
            package: package
        }))
        .pipe(gulp.dest('./dist/'))
        .pipe(browserSync.reload({stream:true, once: true}));
});

// Browser-sync
gulp.task('browser-sync', function() {
    browserSync.init(null, {
        server: {
            baseDir: "app"
        }
    });
});

gulp.task('bs-reload', function () {
    browserSync.reload();
});

// Watchers
gulp.task('default', ['fonts', 'images', 'less', 'vendor', 'js', 'bundled', 'html', 'favicon', 'bs-reload'], function (callback) {

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
    gulp.watch('./src/js/**/*', ['js']);
    gulp.watch('./src/vendor/**/*', ['vendor']);
    gulp.watch('./src/**/*.html', ['bs-reload']);

    console.log('\nWatching `src/` for changes `dist/`\n');
});
