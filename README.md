# gulp-bigpipe-template
====================

> gulp plugin, compile html template into js file


## Install
```
npm install gulp-bigpipe-template --save-dev
```

## Example
### `gulpfile.js`
```js
var bpTpl = require('gulp-bigpipe-template');

gulp.task('tmpl', function() {
  return gulp.src('./tmpl/*.html')
    .pipe(bpTpl({
      
    }))
    .pipe(gulp.dest('./tmpl/'));
});
```

### `index.html`
```
<html>
	<head>
		<style></style>
	</head>
	<!-- bigpipe -->
	<body>
		<div></div>
		<!-- bigpipe -->
		<script></script>
	</body>
</html>
```

### `/server/tpl/index.js`
```
var tpl0 = function() { return "<html>" +
	"<head>" +
	"<style></style>" +
	"</head>";};
var tpl1 = function() { return "<body>" +
		"<div></div>";};
var tpl2 = function() { return "<script></script>" +
	"</body>" +
	"</html>";};
module.exports = {tpl0: tpl0,tpl1: tpl1,tpl2: tpl2,};
```

## options

Type: `Object`

#### options.tplFolder
Type: `String`
Default: `__dirname.replace('node_modules\\' + PLUGIN_NAME, '') + "/server/tpl/"`  
template folder

#### options.tplFileName
Type: `String`  
Default: Same as input html file
template filename

#### options.tplFileExt
Type: `String`  
Default: `js`  
template file extension

#### options.quoteChar
Type: `String`  
Default: `"`  
quote char

#### options.indentString
Type: `String`  
Default: `    `  
indention string

#### options.minHtmlOpt
Type: `Object`  
Default: `{removeComments: true, collapseWhitespace: true,}`  
html-minifier option
https://github.com/kangax/html-minifier