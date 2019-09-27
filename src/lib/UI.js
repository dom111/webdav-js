import DAV from './DAV.js';
import Unimplemented from './Unimplemented.js';

export default class UI {
    DAV;
    container;

    constructor(container) {
        if (! (container instanceof HTMLElement)) {
            throw new TypeError(`Invalid container element: '${container}'.`);
        }

        this.DAV       = DAV;
        this.container = container;

        window.addEventListener('popstate', () => {
            this.update();
        });
    }

    render() {
        throw new Unimplemented(`'render' must be implemented in the child class.`)
    }

    update() {
        throw new Unimplemented(`'update' must be implemented in the child class.`)
    }
}
