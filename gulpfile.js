const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const fontfacegen = require('gulp-fontfacegen');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const babelify = require('babelify');
const imagemin = require('gulp-imagemin');
const changed = require('gulp-changed');
const svgSprite = require('gulp-svg-sprite');
const webp = require('gulp-webp');
const copy = require('gulp-copy');


// Browsersync init
function _bs() {
    browserSync.init({
        server: {
            baseDir: './src'
        },
        open: true
    });
}

// Whatching
function _whatching() {
    gulp.watch('src/**/*.html').on('change', browserSync.reload);
    gulp.watch('src/scss/**/*.scss', _sass);
    gulp.watch('src/img/**/*.+(png|jpg|jpeg|svg|ico|gif)', _imageMin);
}

// SCSS to CSS
function _sass() {
    return gulp.src(["src/scss/**/*.+(scss|css)"])
        .pipe(sass({
            outputStyle: 'compressed'
        }).on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(cleanCSS({
            compatibility: 'ie9'
        }))
        .pipe(gulp.dest("src/css"))
        .pipe(browserSync.stream());
}

// Generate fonts.scss
function _fonts() {
    return gulp.src("src/font/**/*.+(woff|woff2)")
        .pipe(fontfacegen({
            filepath: "./src/scss/base",
            filename: "_fonts.scss"
        }));
}

// Compile JS
function _compileJS() {
    return browserify({
        entries: ['./src/js/main.js'],
        debug: true,
        transform: [babelify.configure({ presets: ['@babel/preset-env'] })]
    })
        .bundle()
        .pipe(source('main.js'))
        .pipe(gulp.dest('dist/js'));
}

// Optimization images
function _imageMin() {
    return gulp.src(["src/s_img/**/*.+(png|jpg|jpeg)"])
    .pipe(changed('src/img', {
        extension: '.webp'
    }))
        .pipe(imagemin([
            imagemin.mozjpeg({
                quality: 70,
                progressive: true
            }),
            imagemin.optipng({
                optimizationLevel: 5
            }),
            imagemin.svgo()
        ], {
            verbose: true
        }))
        .pipe(webp())
        .pipe(gulp.dest("src/img"))
}

function _svgMin() {
    return gulp.src(["src/s_img/**/*.svg"])
        .pipe(changed('src/img'))
        .pipe(imagemin([
            imagemin.svgo()
        ], {
            verbose: true
        }))
        .pipe(gulp.dest("src/img"));
}

// Generate SVG sprites
function _svgSprite() {
    return gulp.src('src/svg-icons/*.svg')
        .pipe(svgSprite({
            shape: {
                dimension: {
                    maxWidth: 500,
                    maxHeight: 500
                },
                spacing: {
                    padding: 0
                }
            },
            mode: {
                symbol: {
                    dest: '.',
                    sprite: 'sprite.svg'
                }
            }
        })).on('error', function(error) {console.log(error)})
        .pipe(imagemin([
            imagemin.svgo({
                plugins: [
                    { removeViewBox: false },
                    { removeUnusedNS: false },
                    { removeUselessStrokeAndFill: true },
                    { cleanupIDs: false },
                    { removeComments: true },
                    { removeEmptyAttrs: true },
                    { removeEmptyText: true },
                    { collapseGroups: true },
                    { removeAttrs: { attrs: '(fill|stroke|style)' } }
                ]
            })
        ]))
        .pipe(gulp.dest('src/img'));
}

function _copy(done) {
    gulp.src('src/*.html')
        .pipe(gulp.dest('dist/'));

    gulp.src('src/css/**/*.css')
        .pipe(gulp.dest('dist/css'));

    gulp.src('src/img/**/*')
        .pipe(gulp.dest('dist/img'));

    gulp.src("src/font/**/*.+(woff|woff2)")
        .pipe(gulp.dest("dist/font"));

    gulp.src("src/js/**/*.js")
        .pipe(gulp.dest("dist/js"));

    done();
}

exports.default = gulp.parallel(
    _sass,
    _imageMin,
    _svgMin,
    _bs,
    _whatching
);

exports.compile = gulp.series(
    _copy,
    _compileJS,
);

exports.fonts = _fonts;