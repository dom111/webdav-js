import NativeDOM from './lib/UI/NativeDOM.js';

const ui = new NativeDOM(document.body);

if (document.readyState !== 'loading') {
    ui.render();
}
else {
    window.addEventListener('DOMContentLoaded', () => ui.render());
}
