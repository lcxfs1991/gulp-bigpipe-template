/**
 *  @project gulp-bigpipe-template
 *  @author heyli
 *  @email lcxfs1991
 *  @github: https://github.com/lcxfs1991
 *  @reference: 
 *  1. https://github.com/Rise-Vision/gulp-html2string
 *  2. https://www.npmjs.com/package/gulp-node-simple 
 **/
var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var fs = require('fs');
var path = require('path');
var minify = require('html-minifier').minify;

// const
const PLUGIN_NAME = 'gulp-bigpipe-template';
const TPLREGEX = /<!--\s*bigpipe\s*-->/gim;
const tplArr = [];

// path of windows and linux should be consistent
var pathFix = function(path) {
    return path.replace(/\\/g, '/');
};

// learn from gulp-node-simple
var splitHtml = function(content, tplInfo, minifyOpt) {
    var arr = content.split(TPLREGEX);

    for (var i = 0, len = arr.length; i < len; i++) {
        var arrContent = (minifyOpt.isHtmlMinifiedSupport) ? 
                          minify(arr[i], minifyOpt.minHtmlOpt) : arr[i];
        tplArr.push(escapeContent(arrContent, tplInfo.quoteChar, tplInfo.indentString));
    }
};

// learn from gulp-html2string
var escapeContent = function(content, quoteChar, indentString) {
    var bsRegexp = new RegExp('\\\\', 'g');
    var quoteRegexp = new RegExp('\\' + quoteChar, 'g');
    var nlReplace = '\\n' + quoteChar + ' +\n' + indentString + indentString + quoteChar;
    return content.replace(bsRegexp, '\\\\').replace(quoteRegexp, '\\' + quoteChar).replace(/\r?\n/g, nlReplace);
};

var mkdir = function(tplFolder) {
    var childPath = pathFix(tplFolder).split('/');
    var childPathStr = '';
    var folderStr = '';
    
    for (var i = 0, len = childPath.length; i < len; i++) {
        childPathStr += childPath[i] + '/';
        folderStr = path.resolve(childPathStr);
        if (!fs.existsSync(folderStr)) {
            fs.mkdirSync(folderStr);
        }
    }
    console.log('Your tempalte folder should be ' + folderStr);
};

var combineFile = function(pathInfo,tplInfo) {
    var folder = path.resolve(pathInfo.tplFolder);
    mkdir(pathInfo.tplFolder);

    if (!fs.existsSync(folder)) {
        throw new PluginError(PLUGIN_NAME, folder + ' does not exist');
    }

    var filename = pathInfo.tplFolder + pathInfo.tplFileName + '.' + pathInfo.tplFileExt;
    if (!fs.exists(filename)) {
        fs.writeFileSync(filename, '');
    }

    for (var i = 0, len = tplArr.length; i < len; i++) {
        var tplStr = 'var tpl' + i + ' = function() { return ' + tplInfo.quoteChar  + tplArr[i] + tplInfo.quoteChar + ' };\n';
        fs.appendFileSync(filename, tplStr);
    }

    var exportBeginStr = 'module.exports = {';
    var exportStr = '';
    var exportEndStr = '};'
    for (var i = 0, len = tplArr.length; i < len; i++) {
        exportStr += 'tpl' + i + ': tpl' + i + ','
    }
    exportStr = exportBeginStr + exportStr + exportEndStr;

    fs.appendFileSync(filename, exportStr);
};


// function for gulp plugin
var bigPipeTpl = function(opt) {

    var opt = opt || {};
    var tplFolder = opt.tplFolder || pathFix(__dirname).replace('node_modules/' + PLUGIN_NAME, '') + 'server/tpl/';
    var tplFileName = opt.tplFileName || '';
    var tplFileExt = opt.tplFileExt || 'js';
    var quoteChar= opt.quoteChar || '"';
    var indentString= opt.indentString || '  ';
    var minHtmlOpt = opt.minHtmlOpt || {
        removeComments: true,
        collapseWhitespace: true,
    };
    var isHtmlMinifiedSupport = opt.isHtmlMinifiedSupport || true;
   
    // stream pipe
    return through.obj(function(file, enc, cb) {
        if (file.isNull()) {
            // return null file
            cb(null, file);
        }
        else if (file.isBuffer()) {
            tplFileName = file.path.replace(file.base, '').replace(/\.\w+/gi, '') || 'tpl';
            var content = String(file.contents);

            splitHtml(content, {
                tplFolder: tplFolder,
                tplFileName: tplFileName,
                tplFileExt: tplFileExt,
                quoteChar: quoteChar,
                indentString: indentString
            }, {
                minHtmlOpt: minHtmlOpt,
                isHtmlMinifiedSupport: isHtmlMinifiedSupport
            });

            combineFile({
                tplFolder: tplFolder,
                tplFileName: tplFileName,
                tplFileExt: tplFileExt,
            }, {
                quoteChar: quoteChar,
                indentString: indentString
            });
        }
        else if (file.isStream()) {
            throw new PluginError(PLUGIN_NAME, 'does not support stream');
        }

        cb(null, file);
    });
};

// export major function of the plugin
module.exports = bigPipeTpl;