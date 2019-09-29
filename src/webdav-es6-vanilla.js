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
