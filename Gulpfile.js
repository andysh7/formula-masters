var gulp = require('gulp');
var less = require('gulp-less');
var jade = require('gulp-jade');
var browserSync = require('browser-sync');
var concat = require('gulp-concat');
var csso = require('gulp-csso');
var prettify = require('gulp-prettify');
var gutil = require('gulp-util');
var watch = require('gulp-watch');
var autoprefixer = require('gulp-autoprefixer');
var runSequence = require('run-sequence');
var base64 = require('gulp-base64');
var plumber = require('gulp-plumber');
var reload = browserSync.reload;
var rimraf = require('rimraf');
var argv = require('yargs').argv;

var src = './src';
var dest = './dist';

var config = {
    project: {
        title: 'FormulaRus',
        src: src,
        dest: dest
    },

    css: {
        src: [
            src + '/css/libs/normalize.less',
            src + '/css/libs/**/*.{less,css}',
            src + '/css/plugins/**/*.{less,css}',
            src + '/css/variables.less',
            src + '/css/bootstrap-mixins.less',
            src + '/css/mixins.less',
            src + '/css/base.less',
            src + '/css/fonts.less',
            src + '/css/*.less',
            src + '/blocks/**/*.less'
        ],
        dest: dest + '/css/',
        filename: 'main.css',
        watchDirs: [ src + '/css/**', src + '/blocks/**/*.less']
    },

    js: {
        src: {
            common: [
                src + '/js/libs/jquery-1.11.2.min.js',
                 src + '/js/libs/jquery-ui-1.10.4.custom.min.js',
                 src + '/js/core.js',
                 src + '/js/libs/*.js',
                 src + '/js/plugins/*.js',
                 src + '/js/i18n/*.js',
                src + '/js/**/*.{js,json}'
            ],
            blocks: [
                src + '/blocks/**/*.js'
            ]
        },
        dest: dest + '/js',
        filename: 'main.js',
        blocksFilename: 'blocks.js',
        watchDirs: [ src + '/js/**', src + '/blocks/**/*.js']
    },

    fonts: {
        src: [ src + '/fonts/**'],
        dest: dest + '/fonts',
        watchDirs: [ src + '/fonts/**' ]
    },

    images: {
        src: [ src + '/images/**', '!' + src + '/images/base64', '!' + src + '/images/base64/**'],
        dest: dest + '/images',
        watchDirs: [ src + '/images/**' ]
    },

    jade: {
        blocks: {
            src: [ src + '/blocks/**/*.jade'],
            dest: src + '/jade/',
            filename: '_mixins.jade'
        },
        pages: {
            src: [ src + '/jade/pages/*.jade']
        },
        dest: dest,
        watchDirs: {
            blocks: [
                src + '/blocks/**/*.jade'
            ],
            pages: [
                src + '/jade/**',
                '!' + src + '/jade/_mixins.jade'
            ]
        }
    },
    browserSync: {
        files: ['css/*', '*.html', 'js/**', 'img/*'],
        port: 3000,
        server: {
            baseDir: dest,
            index: 'index.html'
        },
        logLevel: 'info',
        notify: false,
        ghostMode: false,
        logPrefix: 'FormulaRus'
    }
};

// If --page parameter passed rebuild only specified page and open it in browser
if (argv.page) {
    config.jade.pages.src = src + '/jade/pages/' + argv.page + '.jade';
    config.browserSync.server.index = argv.page + '.html';
}

gulp.task('css', function () {
    gulp.src(config.css.src)
        .pipe(plumber())
        .pipe(concat(config.css.filename))
        .pipe(less({
            compress: false
        }))
        .pipe(autoprefixer({
            browsers: ['last 4 versions'],
            cascade: false
        }))
        .pipe(base64({
            debug: false,
            baseDir: src + '/images',
            maxImageSize: 8*1024,
            extensions: ['png']
        }))
        //.pipe(csso())
        .pipe(gulp.dest(config.css.dest))
        .pipe(reload({stream: true}));
});


gulp.task('js', function () {
    gulp.src(config.js.src.common, {base: './src/js'})
        .pipe(plumber())
        .pipe(concat(config.js.filename))
        .pipe(gulp.dest(config.js.dest));
});


gulp.task('jade:blocks', function (cb) {
    // Удаляем старый файл с блоками
    rimraf(config.jade.blocks.dest + config.jade.blocks.filename, {force: true}, function () {
        // Создаем новый файл со всеми блоками
        gulp.src(config.jade.blocks.src)
            .pipe(plumber())
            .pipe(concat(config.jade.blocks.filename))
            .pipe(gulp.dest(config.jade.blocks.dest))
            .on('end', cb);
    });
});


gulp.task('jade:pages', function () {
    gulp.src(config.jade.pages.src)
        .pipe(plumber())
        .pipe(jade({
            pretty: true,
            compileDebug: true
        }))
        .on('error', gutil.log)
        .pipe(gulp.dest(config.jade.dest))
        .pipe(reload({stream: true}));
});

gulp.task('jade', function(cb) {
    runSequence(
        'jade:blocks',
        'jade:pages',
        cb
    );
});

gulp.task('fonts', function () {
    gulp.src(config.fonts.src)
        .pipe(plumber())
        .pipe(gulp.dest(config.fonts.dest));
});

gulp.task('images', function() {
    gulp.src(config.images.src)
        .pipe(plumber())
        .pipe(gulp.dest(config.images.dest));
});


gulp.task('default', ['watch']);

gulp.task('watch', ['browserSync'], function() {
    gulp.watch(config.css.watchDirs, ['css']);
    gulp.watch(config.images.watchDirs, ['images']);
    gulp.watch(config.fonts.watchDirs, ['fonts']);
    gulp.watch(config.js.watchDirs, ['js']);
    gulp.watch(config.jade.watchDirs.blocks, ['jade']);
    gulp.watch(config.jade.watchDirs.pages, ['jade']);
});

gulp.task('browserSync', ['build'], function () {
    browserSync(config.browserSync);
});

gulp.task('build', ['css', 'jade', 'js', 'images', 'fonts']);
