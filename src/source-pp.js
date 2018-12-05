var url_jquery, url_after
// see https://www.npmjs.com/package/preprocessor for more information
//
// #ifdef CDN
url_jquery = 'https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js';
url_after = [
    'https://cdn.jsdelivr.net/gh/noelboss/featherlight@1.7.1/release/featherlight.min.js',
    'https://cdn.jsdelivr.net/gh/google/code-prettify/loader/run_prettify.js?autorun=false',
    'https://cdn.jsdelivr.net/gh/notifyjs/notifyjs/dist/notify.js',
    'https://cdn.jsdelivr.net/gh/noelboss/featherlight@1.7.1/release/featherlight.min.css',
    'https://cdn.jsdelivr.net/gh/dom111/webdav-js/assets/css/style-min.css',
    'https://cdn.jsdelivr.net/gh/dom111/webdav-js/src/webdav-min.js'
];
// #else
url_jquery = '/webdav-js/external/jquery.min.js';
url_after = [
    '/webdav-js/external/featherlight.min.js',
    '/webdav-js/external/run_prettify.js',
    '/webdav-js/external/notify.js',
    '/webdav-js/external/featherlight.min.css',
    '/webdav-js/assets/css/style-min.css',
    '/webdav-js/src/webdav-min.js'
];
// #endif

var head = document.getElementsByTagName('head')[0],
_createScript = function(path, onload) {
    var element = document.createElement('script');
    element.src = path;
    element.type = 'text/javascript';

    if (onload) {
        element.onload = onload;
    }

    head.appendChild(element);
},
_createStyle = function(path) {
    var element = document.createElement('link');
    element.href = path;
    element.rel = 'stylesheet';
    head.appendChild(element);
},
_createViewPort = function() {
  var element = document.createElement('meta');
  element.name = "viewport";
  element.content = "width=device-width, initial-scale=1";
  head.appendChild(element);
};

_createScript(url_jquery, function() {
    url_after.forEach(function(file) {
        file.match(/css$/) ? _createStyle(file) : _createScript(file);
    });
});
_createViewPort();
