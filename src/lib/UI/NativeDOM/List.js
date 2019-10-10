import Element from './Element.js';
import Item from './List/Item.js';

export default class List extends Element {
  #items;

  constructor(ui) {
    const template = '<ul class="loading"></ul>';

    super(ui, template);

    this.bindEvents();
  }

  bindEvents(ui) {
    this.ui.on('update-list:request', () => this.loading());
    this.ui.on('update-list:complete', (collection) => this.update(collection));
  }

  loading(loading = true) {
    if (loading) {
      return this.element.classList.add('loading');
    }

    this.element.classList.remove('loading');
  }

  update(collection) {
    this.emptyNode();

    this.#items = collection.map((entry) => new Item(this.ui, entry));

    this.element.append(...this.#items.map((item) => item.element));

    this.loading(false);
  }
}
