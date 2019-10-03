import DAV from '../DAV/DAV.js';
import Unimplemented from '../Unimplemented.js';

export default class UI {
    #dav;
    #container;

    constructor(container, dav = new DAV()) {
      if (!(container instanceof HTMLElement)) {
        throw new TypeError(`Invalid container element: '${container}'.`);
      }

      this.#dav       = dav;
      this.#container = container;
    }

    get dav() {
      return this.#dav;
    }

    get container() {
      return this.#container;
    }

    render() {
      throw new Unimplemented('\'render\' must be implemented in the child class.');
    }

    update() {
      throw new Unimplemented('\'update\' must be implemented in the child class.');
    }
}
