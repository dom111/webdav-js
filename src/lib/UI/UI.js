import DAV from '../DAV.js';
import EventObject from "./EventObject";
import Unimplemented from '../Unimplemented.js';

export default class UI extends EventObject {
  #container;
  #dav;

  constructor(container, dav = new DAV()) {
    super();

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
}
