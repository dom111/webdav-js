import Element, { emit, on, s } from '@dom111/element';
import Collection from '../lib/Collection';
import DAV from '../lib/DAV';
import Entry from '../lib/Entry';
import Item from './Item';
import State from '../lib/State';
import previewItems from '../lib/previewItems';
import supportsFocusWithin from '../lib/supportsFocusWithin';

export class List extends Element<HTMLUListElement> {
  #dav: DAV;
  #state: State;

  constructor(dav: DAV, state: State) {
    super(s('<ul class="loading"></ul>'));

    this.#dav = dav;
    this.#state = state;

    this.load();

    this.bindEvents();
  }

  private bindEvents(): void {
    this.#state.on('updated', (bypassCache: boolean): void => {
      if (this.#state.isDirectory()) {
        this.load(bypassCache);

        return;
      }

      const item = this.query<HTMLLIElement>(
        `[data-full-path="${this.#state.getPath()}"]`
      );

      if (!item) {
        return;
      }

      emit(item, new MouseEvent('click'));
    });

    this.#state.on('collection-updated', (): void => this.render());

    const arrowHandler = (event: KeyboardEvent): void => {
      if (!['ArrowUp', 'ArrowDown'].includes(event.key)) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const current = this.query(
          `li:focus${supportsFocusWithin ? ', li:focus-within' : ''}`
        ) as HTMLElement,
        [previous, next] = current
          ? previewItems(current)
          : [
              this.element().firstElementChild as HTMLElement,
              this.element().firstElementChild as HTMLElement,
            ];

      if (event.key === 'ArrowUp' && previous) {
        previous.focus();
      }

      if (event.key === 'ArrowDown' && next) {
        next.focus();
      }
    };

    on(document, 'keydown', arrowHandler);
  }

  async load(bypassCache: boolean = false): Promise<void> {
    const collection = await this.#dav.list(this.#state.getPath(), bypassCache);

    if (!collection) {
      return;
    }

    this.update(collection);
  }

  private render(): void {
    this.addClass('loading');

    this.empty();

    this.#state
      .getCollection()
      .forEach((entry: Entry): void =>
        this.append(new Item(entry, this.#dav, this.#state))
      );

    this.removeClass('loading');
  }

  update(collection: Collection): void {
    this.#state.setCollection(collection);

    this.render();
  }
}

export default List;
