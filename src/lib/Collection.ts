import Entry from './Entry';
import { EntryObject } from './Response';
import EventEmitter from '@dom111/typed-event-emitter/EventEmitter';
import joinPath from './joinPath';

type CollectionEvents = {
  updated: [];
};

type EntryIterator<T = any> = (entry: Entry, index: number) => T;

export default class Collection extends EventEmitter<CollectionEvents> {
  readOnly: boolean;
  #path: string;
  #entries: Entry[];
  #sortDirectoriesFirst: boolean;

  // don't need to handle equal paths as that's invalid
  #sort = (): void => {
    this.#entries.sort(
      (a, b) =>
        (this.#sortDirectoriesFirst && this.#sortDirectories(a, b)) ||
        this.#sortAlphabetically(a, b)
    );
  };
  #sortAlphabetically = (a: Entry, b: Entry): number =>
    a.fullPath < b.fullPath ? -1 : 1;
  #sortDirectories = (a: Entry, b: Entry): number =>
    (b.directory ? 1 : 0) - (a.directory ? 1 : 0);

  constructor(readOnly: boolean, items: EntryObject[], { sortDirectoriesFirst = false } = {}) {
    super();

    this.readOnly = readOnly;
    this.#sortDirectoriesFirst = sortDirectoriesFirst;

    this.#entries = items.map(
      (item: EntryObject): Entry =>
        new Entry({
          ...item,
          collection: this,
          copy: !readOnly,
          del: !readOnly,
          move: !readOnly,
          rename: !readOnly,
        })
    );

    // the first entry is a stub for the directory itself, we can remove that for the root path...
    const parent = this.#entries.shift();

    this.#path = joinPath(parent.fullPath);

    if (parent.fullPath !== '/') {
      // ...but change the details for all others.
      this.#entries.unshift(parent.createParentEntry());
    }

    this.#sort();
  }

  add(entry: Entry): void {
    entry.collection = this;

    this.#entries.push(entry);

    this.#sort();

    this.emit('updated');
  }

  filter(iterator: EntryIterator<boolean>): Entry[] {
    return this.#entries.filter(iterator);
  }

  forEach(iterator: EntryIterator<void>): void {
    this.#entries.forEach(iterator);
  }

  map(iterator: EntryIterator): any[] {
    return this.#entries.map(iterator);
  }

  path(): string {
    return this.#path;
  }

  remove(entry: Entry): void {
    this.#entries = this.#entries.filter((item): boolean => item !== entry);

    this.emit('updated');
  }
}
