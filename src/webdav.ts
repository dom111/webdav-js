import 'basiclightbox/src/styles/main.scss';
import 'prismjs/themes/prism.css';
import 'melba-toast/dist/Melba.css';
import '../assets/scss/style.scss';
import 'whatwg-fetch'; // IE11 compatibility
import NativeDOM from './lib/UI/NativeDOM';

const ui = new NativeDOM(document.body, {
  bypassCheck: !!document.querySelector('[data-disable-check]'),
  sortDirectoriesFirst: !!document.querySelector(
    '[data-sort-directories-first]'
  ),
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => ui.render());
} else {
  ui.render();
}
