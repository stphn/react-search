var gulp        = require('gulp'),
    browserSync = require('browser-sync'),
    harp        = require('harp'),
    stylish     = require('jshint-stylish')
    plugins     = require('gulp-load-plugins')(),
    del         = require('del'),
    files       = require('./config/files')

var port = process.env.PORT || 9000

/*
 * Catch errors and output them in the console
 */
var catchError = function(err) {

	console.error(err.toString())
	this.emit('end')

}

/*
 * Serve the Harp Site from the src directory
 */
gulp.task('serve', ['babel'], function() {

	harp.server(__dirname, { port: port }, function(err) {

		if (err!=null) {
			console.error(err)
			return false
		}

		browserSync({
			proxy     : 'localhost:' + port,
			port      : port,
			open      : true,
			notify    : false,
			ghostMode : false
		})

		// Watch for scss changes, tell BrowserSync to refresh main.css
		gulp.watch([files.styles.css, files.styles.scss], function() {
			browserSync.reload(files.styles.main, { stream: true })
		})

		// Watch for js changes
		gulp.watch([files.scripts.src], ['babel', 'reload'])

		/* Watch for all other changes, reload the whole page */
		gulp.watch([files.harp, files.data, files.sites, files.images, files.partials], ['reload'])

	})

})

/*
 * Lint all styles and scripts
 */
gulp.task('lint', function() {

	gulp.src(files.styles.scss)
	    .pipe(plugins.scssLint({'config': files.scsslint}))

	gulp.src(files.scripts.src)
	    .pipe(plugins.jshint())
	    .pipe(plugins.jshint.reporter(stylish))

})

/*
 * Convert JSX and ES2015 to ES5 using Babel
 */
gulp.task('babel', function() {

	return gulp.src(files.scripts.src)
	           .pipe(plugins.babel())
	           .on('error', catchError)
	           .pipe(gulp.dest(files.scripts.dist))

})

/*
 * Compile to static files
 */
gulp.task('export', ['babel'], function() {

	// Remove dist folder
	del(files.dist, function() {

		// Compile to static files
		harp.compile(__dirname, files.dist, function(err) {

			if (err!=null) {
				console.error(err)
				return false
			}

			return true

		})

	})

})

/*
 * Reload browser
 * This is a shortcut-task for the reload function
 */
gulp.task('reload', browserSync.reload)

/*
 * Default task, running gulp will fire up the Harp site,
 * launch BrowserSync & watch files.
 */
gulp.task('default', ['serve'])