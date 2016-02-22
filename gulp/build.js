'use strict';

let GSSID = '1-BxTbzc5z-04-0-3Q4KJTJtLKmmjAOE5s8X8bzEdv5Q';
let BOOL_FIELDS = ['hasslider', 'canbeonxaxis', 'shownonthelist', 'preliminary', 'editable'];
let NUMBER_FIELDS = ['importancerank', 'interval']
let UNWANTED_FIELDS = ['_xml', '_links'];

var path = require('path');
var fs   = require('fs');
var _    = require('lodash');
var gulp = require('gulp');
var conf = require('./conf');
var Gss  = require('google-spreadsheet');
var extractTranslate = require('gulp-angular-translate-extractor');

var $ = require('gulp-load-plugins')({
  pattern: ['gulp-*', 'main-bower-files', 'uglify-save-license', 'del']
});

gulp.task('partials', ['markups'], function () {
  return gulp.src([
    path.join(conf.paths.src, '/app/**/*.html'),
    path.join(conf.paths.tmp, '/serve/app/**/*.html')
  ])
    .pipe($.minifyHtml({
      empty: true,
      spare: true,
      quotes: true
    }))
    .pipe($.angularTemplatecache('templateCacheHtml.js', {
      module: 'oekoKostenrechner',
      root: 'app'
    }))
    .pipe(gulp.dest(conf.paths.tmp + '/partials/'));
});

gulp.task('html', ['inject', 'partials'], function () {
  var partialsInjectFile = gulp.src(path.join(conf.paths.tmp, '/partials/templateCacheHtml.js'), { read: false });
  var partialsInjectOptions = {
    starttag: '<!-- inject:partials -->',
    ignorePath: path.join(conf.paths.tmp, '/partials'),
    addRootSlash: false
  };

  var htmlFilter = $.filter('*.html', { restore: true });
  var jsFilter = $.filter('**/*.js', { restore: true });
  var cssFilter = $.filter('**/*.css', { restore: true });
  var assets;

  return gulp.src(path.join(conf.paths.tmp, '/serve/*.html'))
    .pipe($.inject(partialsInjectFile, partialsInjectOptions))
    .pipe(assets = $.useref.assets())
    .pipe($.rev())
    .pipe(jsFilter)
    .pipe($.sourcemaps.init())
    .pipe($.ngAnnotate())
    .pipe($.uglify({ preserveComments: $.uglifySaveLicense })).on('error', conf.errorHandler('Uglify'))
    .pipe($.sourcemaps.write('maps'))
    .pipe(jsFilter.restore)
    .pipe(cssFilter)
    .pipe($.sourcemaps.init())
    .pipe($.replace('../../bower_components/bootstrap/fonts/', '../fonts/'))
    .pipe($.minifyCss({ processImport: false }))
    .pipe($.sourcemaps.write('maps'))
    .pipe(cssFilter.restore)
    .pipe(assets.restore())
    .pipe($.useref())
    .pipe($.revReplace())
    .pipe(htmlFilter)
    .pipe($.minifyHtml({
      empty: true,
      spare: true,
      quotes: true,
      conditionals: true
    }))
    .pipe(htmlFilter.restore)
    .pipe(gulp.dest(path.join(conf.paths.dist, '/')))
    .pipe($.size({ title: path.join(conf.paths.dist, '/'), showFiles: true }));
  });

// Only applies for fonts from bower dependencies
// Custom fonts are handled by the "other" task
gulp.task('fonts', function () {
  return gulp.src($.mainBowerFiles())
    .pipe($.filter('**/*.{eot,svg,ttf,woff,woff2}'))
    .pipe($.flatten())
    .pipe(gulp.dest(path.join(conf.paths.dist, '/fonts/')));
});

gulp.task('other', function () {
  var fileFilter = $.filter(function (file) {
    return file.stat.isFile();
  });

  return gulp.src([
    path.join(conf.paths.src, '/**/*'),
    path.join('!' + conf.paths.src, '/**/*.{html,css,js,less,coffee,jade}')
  ])
    .pipe(fileFilter)
    .pipe(gulp.dest(path.join(conf.paths.dist, '/')));
});

gulp.task('gss:settings', function (cb) {

  let gss = new Gss(GSSID);

  gss.getRows(1, function(err, rows){
    var data = _.map(rows, function(row) {
      // Remove unwanted properties
      for(let k of UNWANTED_FIELDS) delete row[k];
      // Convert values to boolean
      for(let k of BOOL_FIELDS) row[k] = row[k].toLowerCase()[0] === 't';
      // Convert values to number
      for(let k of NUMBER_FIELDS) row[k] = 1 * row[k];
      // Convert to null when empty
      for(let k in row) {
        if( row[k] === '' ) row[k] = null;
      }
      return row;
    });
    var file = JSON.stringify(data, null, 2);
    // And override the existinng JSON file
    fs.writeFile(path.join(__dirname, '../src/assets/settings.json'), file, cb);
  });
});

gulp.task('gss:display', function (cb) {

  let gss = new Gss(GSSID);

  gss.getRows(2, function(err, rows){
    var data = _.map(rows, function(row) {
      // Remove unwanted properties
      for(let k of UNWANTED_FIELDS) delete row[k];
      return row;
    });
    var file = JSON.stringify(data, null, 2);
    // And override the existinng JSON file
    fs.writeFile(path.join(__dirname, '../src/assets/display.json'), file, cb);
  });
});



gulp.task('gss', ["gss:settings", "gss:display"]);

gulp.task('vehicle', function() {
    gulp.src('processor/vehicle.js')
        .pipe($.browserify({
          insertGlobals : true,
          standalone: 'Vehicle'
        }))
        .pipe($.rename('processor.vehicle.js'))
        .pipe(gulp.dest('src/app/components/processor/'))
});

gulp.task('locales', function () {
  var i18nsrc = ['./src/app/**/*.{jade,coffee,js,html}'];
  var i18ndest = './src/assets/locales';
  return gulp.src(i18nsrc)
    .pipe(extractTranslate({
      defaultLang: 'en',
        lang: ['en', 'de'],
        dest: i18ndest,
        safeMode: true,
        stringifyOptions: true
    }))
    .pipe(gulp.dest(i18ndest));
});

gulp.task('clean', function () {
  return $.del([path.join(conf.paths.dist, '/'), path.join(conf.paths.tmp, '/')]);
});

gulp.task('deploy', ['build'], function() {
  return gulp.src("./dist/**/*").pipe($.ghPages({
    remoteUrl: "git@github.com:jplusplus/oeko-kostenrechner.git"
  }));
});


gulp.task('build', ['html', 'fonts', 'other', 'vehicle', 'locales']);
