import Element, { s } from '@dom111/element';
import State from '../lib/State';

const getPath = (state: State): string => decodeURIComponent(state.getPath());

export class Header extends Element {
  #state: State;

  constructor(state: State) {
    super(
      s(`<header>
  <h1>${getPath(state)}</h1>
</header>`)
    );

    this.#state = state;

    this.bindEvents();
  }

  private bindEvents(): void {
    this.#state.on('updated', (): void => {
      if (this.#state.isDirectory()) {
        this.update();
      }
    });
  }

  private update(): void {
    this.query('h1').innerHTML = getPath(this.#state);
  }
}

export default Header;
