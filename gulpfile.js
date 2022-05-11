const { src, dest, watch, parallel, series } = require('gulp');
const scss = require('gulp-sass');
const concat = require('gulp-concat');
const autoprefixer = require('gulp-autoprefixer');
const uglify = require('gulp-uglify');
const imagemin = require('gulp-imagemin');
const del = require('del');
const browserSync = require('browser-sync').create();

// Конфиг
const app = 'app/',
		dist = 'dist/';
const config = {
	app: {
		html: app + '*.html',
		css: app + 'css/',
		scss: app + 'scss/style.scss',
		js: app + 'js/main.js',
		img: app + 'images/**/*.*',
		fonts: app + 'fonts/*.*'
	},
	dist: {
		html: dist,
		css: dist + 'css/',
		js: dist + 'js/',
		img: dist + 'images/',
		fonts: dist + 'fonts/'
	},
	watch: {
		html: app + '*.html',
		scss: app + 'scss/**/*.scss',
		js: app + 'js/**/*.js'
	}
}



// Браузер
function browsersync() {
	browserSync.init({
		server: {
			baseDir: app
		},
		notify: false
	})
}

// Стили
function styles() {
	return src(config.app.scss)
		.pipe(scss({
			outputStyle: 'compressed'
		}))
		.pipe(concat('style.min.css'))
		.pipe(autoprefixer({
			overrideBrowserslist: ['last 9 versions'],
			grid: true
		}))
		.pipe(dest(config.app.css))
		.pipe(browserSync.stream())
}

// Скрипты
function scripts() {
	return src([
		'node_modules/jquery/dist/jquery.js',
		config.app.js
	])
	.pipe(concat('main.min.js'))
	.pipe(uglify())
	.pipe(dest(app + 'js/'))
	.pipe(browserSync.stream())
}

// Картинки
function images() {
	return src(config.app.img)
		.pipe(imagemin([
			imagemin.gifsicle({interlaced: true}),
			imagemin.mozjpeg({quality: 75, progressive: true}),
			imagemin.optipng({optimizationLevel: 5}),
			imagemin.svgo({
				 plugins: [
					  {removeViewBox: true},
					  {cleanupIDs: false}
				 ]
			})
		]))
		.pipe(dest(config.dist.img))
}

// Билд
function build() {
	return src([
		config.app.html,
		'app/css/style.min.css',
		'app/js/main.min.js'
	], {base: 'app'})
	.pipe(dest(dist))
}

// Удаление
function clean() {
	return del(dist)
}


// Слежение ==================================================================================
function watching() {
	watch([config.watch.html]).on('change', browserSync.reload);
	watch([config.watch.scss], styles);
	watch([config.watch.js, '!app/js/main.min.js'], scripts)
}



// Экспорты ==================================================================================
exports.browsersync = browsersync;
exports.styles = styles;
exports.scripts = scripts;
exports.images = images;
exports.watching = watching;
exports.clean = clean;

exports.build = series(clean, images, build);
exports.default = parallel(styles, scripts, browsersync, watching)