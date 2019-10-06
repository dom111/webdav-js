javascript:[
  'https://cdn.jsdelivr.net/gh/dom111/webdav-js/assets/css/style-min.css',
  'https://cdn.jsdelivr.net/gh/dom111/webdav-js/src/webdav-min.js'
]
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