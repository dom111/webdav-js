// see https://www.npmjs.com/package/preprocessor for more information
//
// #ifdef CDN
[
    'https://cdn.jsdelivr.net/gh/MLaritz/Vanilla-Notify/dist/vanilla-notify.min.js',
    'https://cdn.jsdelivr.net/gh/MLaritz/Vanilla-Notify/dist/vanilla-notify.css',
    'https://cdn.jsdelivr.net/gh/electerious/basicLightbox/dist/basicLightbox.min.js',
    'https://cdn.jsdelivr.net/gh/electerious/basicLightbox/dist/basicLightbox.min.css',
    'https://cdn.jsdelivr.net/gh/google/code-prettify/loader/run_prettify.js?autorun=false',

    'https://cdn.jsdelivr.net/gh/dom111/webdav-js/assets/css/style-min.css',
    'https://cdn.jsdelivr.net/gh/dom111/webdav-js/src/webdav-min.js'
]
// #else
[
    '/webdav-js/external/vanilla-notify.min.js',
    '/webdav-js/external/vanilla-notify.css',
    '/webdav-js/external/basicLightbox.min.js',
    '/webdav-js/external/basicLightbox.min.css',
    '/webdav-js/external/run_prettify.js?autorun=false',

    '/webdav-js/assets/css/style-min.css',
    '/webdav-js/src/webdav-min.js'
]
// #endif
.forEach(function(file, element) {
    if (file.match(/css$/)) {
        // create style
        element = document.createElement('link');
        element.href = file;
        element.rel = 'stylesheet';
    }
    else {
        // create script
        element = document.createElement('script');
        element.src = file;
        element.type = 'text/javascript';
    }

    document.head.appendChild(element);
});
