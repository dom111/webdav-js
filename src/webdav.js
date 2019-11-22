import 'basiclightbox/src/styles/main.scss';
import 'prismjs/themes/prism.css';
import 'melba-toast/dist/css/Melba.css';
import 'webdav-js/assets/scss/style.scss';
import 'whatwg-fetch'; // IE11 compatibility
import NativeDOM from './lib/UI/NativeDOM.js';

const ui = new NativeDOM(document.body);

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', () => ui.render());
}
else {
  ui.render();
}
