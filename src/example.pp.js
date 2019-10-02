// see https://www.npmjs.com/package/preprocessor for more information
//
// #ifdef CDN
[
  'https://cdn.jsdelivr.net/gh/dom111/webdav-js/assets/css/style-min.css',
  'https://cdn.jsdelivr.net/gh/dom111/webdav-js/src/webdav-min.js'
]
// #else
[
  '/webdav-js/assets/css/style-min.css',
  '/webdav-js/src/webdav-min.js'
]
// #endif
.forEach(function(file, element) {
  if (/css$/.test(file)) {
    // create style
    element = document.createElement('link');
    element.href = file;
    element.rel = 'stylesheet';
  }
  else {
    // create script
    element = document.createElement('script');
    element.src = file;
  }

  document.head.appendChild(element);
});
