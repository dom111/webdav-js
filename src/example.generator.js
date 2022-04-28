// eslint-disable-next-line no-undef
const process = require('process');

const args = process.argv.slice(2);

let version;
let type = 'local';

args.forEach((arg, i) => {
  if (arg === '--version') {
    version = args[i + 1].replace(/\//g, '%2F');
  } else if (arg === '--cdn') {
    type = 'cdn';
  }
});

const prefix =
  type === 'cdn'
    ? `https://cdn.jsdelivr.net/gh/dom111/webdav-js${
        version ? `@${version}` : ''
      }`
    : '/webdav-js';

process.stdout.write(`[
  '${prefix}/assets/css/style-min.css',
  '${prefix}/src/webdav-min.js'
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
});`);
