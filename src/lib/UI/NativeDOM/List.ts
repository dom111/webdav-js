import Element from './Element';
import Item from './List/Item';
import supportsFocusWithin from '../supportsFocusWithin';

export default class List extends Element {
  #collection;
  #items;

  constructor() {
    super('<ul class="loading"></ul>');

    this.bindEvents();
  }

  bindEvents() {
    this.on('list:update:request', () => this.loading());
    this.on('list:update:success', (collection) => this.update(collection));
    this.on('list:update:failed', () => this.loading(false));

    this.on('collection:update', (collection) => {
      if (collection === this.#collection) {
        this.update();
      }
    });

    this.on('entry:update', (entry) => {
      if (entry.collection === this.#collection) {
        this.update();
      }
    });

    const arrowHandler = (event) => {
      if (!['ArrowUp', 'ArrowDown'].includes(event.key)) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const current = this.element.querySelector(
          `li:focus${supportsFocusWithin ? ', li:focus-within' : ''}`
        ),
        isPreview = document.body.classList.contains('preview-open'),
        previewItems = [
          ...this.element.querySelectorAll(
            'li:not(.directory):not([data-type="unknown"])'
          ),
        ],
        currentItemIndex = previewItems.indexOf(current),
        next = isPreview
          ? currentItemIndex > -1
            ? previewItems.slice(currentItemIndex + 1).shift()
            : null
          : current
          ? current.nextElementSibling
          : this.element.querySelector('li:first-child'),
        previous = isPreview
          ? currentItemIndex > -1
            ? previewItems.slice(0, currentItemIndex).pop()
            : null
          : current
          ? current.previousElementSibling
          : null;

      if (event.key === 'ArrowUp' && previous) {
        previous.focus();

        if (isPreview) {
          this.element.dispatchEvent(
            new CustomEvent('preview:close', {
              bubbles: true,
              detail: {
                preview: true,
              },
            })
          );

          previous.dispatchEvent(new CustomEvent('click'));
        }
      } else if (event.key === 'ArrowDown' && next) {
        next.focus();

        if (isPreview) {
          this.element.dispatchEvent(
            new CustomEvent('preview:close', {
              bubbles: true,
              detail: {
                preview: true,
              },
            })
          );

          next.dispatchEvent(new CustomEvent('click'));
        }
      }
    };

    document.addEventListener('keydown', arrowHandler);
    this.element.addEventListener('keydown', arrowHandler);
  }

  loading(loading = true) {
    if (loading) {
      return this.element.classList.add('loading');
    }

    this.element.classList.remove('loading');
  }

  update(collection = this.#collection) {
    this.emptyNode();

    this.#items = collection.map((entry) => new Item(entry));

    [...this.#items.map((item) => item.element)].forEach((element) =>
      this.element.appendChild(element)
    );

    this.loading(false);

    this.#collection = collection;
  }
}
