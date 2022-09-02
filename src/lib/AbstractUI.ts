import DAV from './DAV';
import Element from '@dom111/element';
import State from './State';

export abstract class AbstractUI extends Element {
  #dav: DAV;
  #state: State;

  constructor(container: HTMLElement, dav: DAV, state: State) {
    super(container);

    this.#dav = dav;
    this.#state = state;

    this.bindEvents();
  }

  protected abstract bindEvents(): void;

  dav(): DAV {
    return this.#dav;
  }

  state(): State {
    return this.#state;
  }
}

export default AbstractUI;
