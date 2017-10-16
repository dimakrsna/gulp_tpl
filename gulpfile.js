// инициализируем переменные
var gulp             = require('gulp'); 
var browserSync      = require('browser-sync'); 
var less             = require('gulp-less'); 
var autoprefixer     = require('gulp-autoprefixer'); 
var plumber          = require('gulp-plumber'); 
var concatCss        = require('gulp-concat-css'); 
var concatJs         = require('gulp-concat'); 
var rename           = require('gulp-rename');
var uglify           = require('gulp-uglifyjs'); 
var minCss           = require('gulp-clean-css'
var tinypng 				 = require('gulp-tinypng-extended');
var spritesmith      = require('gulp.spritesmith');
var cache            = require('gulp-cache');
var del              = require('del');
var babel   				 = require('gulp-babel'); 
var stripCssComments = require('gulp-strip-css-comments');
var svgSprite				 = require('gulp-svg-sprite');



/* ----------------------
/		Подготовка вотчера
------------------------*/
 
// компиляция less
gulp.task('less', function () {
		return gulp.src('src/less/style.less')
		.pipe(plumber())
		.pipe(less())
		.pipe(autoprefixer(['last 3 versions']))
		.pipe(concatCss('style.css'))
		.pipe(gulp.dest('src/css'))
		.pipe(browserSync.reload({stream: true}))
});


// babel транспиляция в ES5
gulp.task('transJs', function(){
		return gulp.src('src/babel/**/*.js')
		.pipe(concatJs('main.js'))
		.pipe(babel({
		    presets: ['env']
		 }))
		.pipe(gulp.dest('src/js'))
		.pipe(browserSync.reload({stream: true}))
});

// конкатенация js плагинов 
gulp.task('libsJs', function(){
		gulp.src([
				'src/libs/',
				'src/libs/',
				'src/libs/',
				'src/libs/'
				])
		.pipe(plumber())
		.pipe(concatJs('libs.min.js'))
		.pipe(gulp.dest('src/js'))
		.pipe(browserSync.reload({stream: true}))
});


// конкатенация css плагинов
gulp.task('libsCss', function(){
		gulp.src([
			'src/libs/',
			'src/libs/',
			'src/libs/',
			'src/libs/'
			])
		.pipe(plumber())
		.pipe(concatCss('libs.min.css'))
		.pipe(gulp.dest('src/css/'))
		.pipe(browserSync.reload({stream: true}));
});


// cпрайт .png
gulp.task('spritePng', ['clear'], function () {
	var spriteData = gulp.src('layout/sprite/png/*.png').pipe(spritesmith({
		imgName: 'sprite-png.png',
		cssName: '_sprite-png.less',
		cssFormat: "less",
		imgPath: '../img/sprite-png.png',
		padding: 2
// Для иконок @2x нужно разкоментировать
/*	retinaSrcFilter: ['layout/sprite/png/*@2x.png'], 
		retinaImgName: 'sprite-png@2x.png',	  */			
}));
	spriteData.img.pipe(gulp.dest('src/img/'));
	spriteData.css
		.pipe(stripCssComments())
		.pipe(gulp.dest('src/less/mixins/'))
		.pipe(browserSync.reload({stream: true}));
});


// спрайт svg
svgConfig = {
	mode : {
		css	: {
			prefix: ".",
			sprite: "../img/sprite-svg.svg",
			bust: false,
			render : {
				less : {
					dest: "../less/mixins/_sprite-svg.less",
					template: "src/less/mixins/sprite-svg-tpl.less"
				}
			}
		}
	},
	shape : {
		spacing	: {
			// padding: 2
		},
	},
};

gulp.task('spriteSvg', ['less'], function(){
	return gulp.src('layout/sprite/svg/*.svg')
		.pipe(svgSprite(svgConfig))
		.pipe(gulp.dest('src/'))
		.pipe(browserSync.reload({stream: true}));
});


// инициализируем релоад сервера
gulp.task('browser-sync', function(){
		browserSync({
				server: {
						baseDir: 'src',
						index: 'index.html'
				},
				notify: false
		});
});

// запускаем watch
gulp.task('watch', ['browser-sync', 'spritePng', 'spriteSvg', 'less', 'transJs', 'libsJs', 'libsCss'], function (){
		gulp.watch('layout/sprite/png/*', ['spritePng']);
		gulp.watch('layout/sprite/svg/*', ['spriteSvg']);
		gulp.watch('src/less/**/*.less', ['less']);
		gulp.watch('src/libs/**/*.js', ['libsJs']);
		gulp.watch('src/libs/**/*.css', ['libsCss']);
		gulp.watch('src/babel/**/*.js', ['transJs']);
		gulp.watch('src/*.html', browserSync.reload);
});


/* ----------------------
/		Подготовка билда
------------------------*/

// удаление папки dist
gulp.task('cleen', function(){
		return del.sync('dist');
});


// чистка кеша
gulp.task('clear', function(){
		return cache.clearAll();
});


// оптимизация изображений
gulp.task('tinypng', ['clear'], function () {
	gulp.src('src/img/**/*.{png,jpg,jpeg}')
	.pipe(plumber())
	.pipe(tinypng({
		key: '8ce0enDjq1yjWSn0YmAiqZ_mpdMKf2cw',
		sigFile: 'images/.tinypng-sigs',
		log: true
	}))
	.pipe(gulp.dest('dist/img'));
});


// Запуск билда
gulp.task('build', ['cleen', 'tinypng'], function(){

		// JS
		gulp.src('src/js/main.js')
				.pipe(gulp.dest('dist/js'));

		gulp.src('src/js/libs.min.js')
				.pipe(uglify())
				.pipe(gulp.dest('dist/js'));

		// CSS
		gulp.src('src/css/style.css')
				.pipe(gulp.dest('dist/css'));

		gulp.src('src/css/libs.min.css')
				.pipe(minCss({
						keepBreak : true, 
						advanced : false,
						aggressiveMerging : false,
						processImportFrom : ['local'],
						roundingPrecision : 1
				}))
				.pipe(gulp.dest('dist/css'));

		// Перенос шрифтов
		gulp.src('src/fonts/**/*')
				.pipe(gulp.dest('dist/fonts'));

		// Перенос видео
		gulp.src('src/video/**/*')
				.pipe(gulp.dest('dist/video'));

		// Перенос html
		gulp.src('src/*.html')
				.pipe(gulp.dest('dist/'));

});


// Переименовывание
// .pipe(rename({suffix: '.min'}))