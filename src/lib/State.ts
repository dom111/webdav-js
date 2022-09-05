import Collection from './Collection';
import EventEmitter from '@dom111/typed-event-emitter/EventEmitter';
import { t } from 'i18next';
import { on } from '@dom111/element';

export class State extends EventEmitter<{
  'collection-updated': [];
  updated: [boolean?];
}> {
  #collection: Collection;
  #location: Location;
  #history: History;
  #document: Document;
  #window: Window;

  #collectionUpdatedListener = (): void => this.emit('collection-updated');

  constructor(document: Document, window: Window) {
    super();

    this.#document = document;
    this.#window = window;
    this.#location = window.location;
    this.#history = window.history;

    this.bindEvents();
    this.setTitle(this.getPath());
  }

  private bindEvents(): void {
    on(this.#window, 'popstate', () => this.update());
  }

  getCollection(): Collection {
    return this.#collection;
  }

  getPath(): string {
    return this.#location.pathname;
  }

  getTitleForPath(path: string): string {
    return t('title', {
      interpolation: {
        escapeValue: false,
      },
      path: decodeURIComponent(path),
    });
  }

  isDirectory(): boolean {
    return this.getPath().endsWith('/');
  }

  setCollection(collection: Collection): void {
    if (this.#collection) {
      this.#collection.off('updated', this.#collectionUpdatedListener);
    }

    this.#collection = collection;

    collection.on('updated', this.#collectionUpdatedListener);
  }

  setPath(path: string): void {
    if (this.#location.pathname !== path) {
      this.showPath(path);

      this.emit('updated');
    }
  }

  private setTitle(path: string): void {
    const title = this.getTitleForPath(path);

    if (this.#document.title !== title) {
      this.#document.title = title;
    }
  }

  showPath(path: string): void {
    if (this.#location.pathname !== path) {
      this.#history.pushState({ path }, this.getTitleForPath(path), path);

      this.setTitle(path);
    }
  }

  update(bypassCache: boolean = false): void {
    this.emit('updated', bypassCache);
  }
}

export default State;
