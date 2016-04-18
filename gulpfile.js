var gulp = require('gulp');
var rename = require("gulp-rename");
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var runSequence = require('run-sequence');

gulp.task('copyFiles', function() {
   return gulp.src(['src/wires-domain.js'])
      .pipe(gulp.dest('dist/'))
});
gulp.task('uglify', function() {
   return gulp.src(['dist/wires-domain.js'])
      .pipe(rename("dist/wires-domain.min.js"))
      .pipe(uglify())
      .pipe(gulp.dest("./"));
});

gulp.task('build', function() {
   runSequence(
      'copyFiles',
      'uglify'
   );
});
