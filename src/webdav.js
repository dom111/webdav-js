import 'basiclightbox/src/styles/main.scss';
import 'prismjs/themes/prism.css';
import 'melba-toast/src/Melba.scss';
import 'webdav-js/assets/scss/style.scss';

import NativeDOM from './lib/UI/NativeDOM.js';

const ui = new NativeDOM(document.body);

window.addEventListener('popstate', () => {
  ui.update();
});

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', () => ui.render());
}
else {
  ui.render();
}
