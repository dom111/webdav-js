import DAV from '../DAV.js';
import EventObject from '../EventObject';
import Unimplemented from '../Unimplemented.js';

export default class UI extends EventObject {
  #container;
  #dav;
  #options;

  constructor(container, options = {}, dav = new DAV({
    bypassCheck: options.bypassCheck,
    sortDirectoriesFirst: options.sortDirectoriesFirst,
  })) {
    super();

    if (! (container instanceof HTMLElement)) {
      throw new TypeError(`Invalid container element: '${container}'.`);
    }

    this.#container = container;
    this.#dav       = dav;
    this.#options   = options;
  }

  get options() {
    // return a clone so these cannot be changed
    return {
      ...this.#options
    };
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
