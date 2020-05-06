import Entry from './Entry.js';
import EventObject from '../EventObject.js';
import joinPath from '../joinPath.js';

export default class Collection extends EventObject {
    #path;
    #entries;
    #sortDirectoriesFirst;

    // don't need to handle equal paths as that's invalid
    #sort = () => this.#entries.sort((a, b) => this.#sortDirectoriesFirst &&
      this.#sortDirectories(a, b) ||
      this.#sortAlphabetically(a, b)
    );
    #sortAlphabetically = (a, b) => a.fullPath < b.fullPath ? -1 : 1;
    #sortDirectories = (a, b) => b.directory - a.directory;

    constructor(items, {
      sortDirectoriesFirst =  false
    } = {}) {
      super();

      this.#sortDirectoriesFirst = sortDirectoriesFirst;

      this.#entries = items
        .map((item) => new Entry({
          ...item,
          collection: this
        }))
      ;

      // the first entry is a stub for the directory itself, we can remove that for the root path...
      const parent = this.#entries.shift();

      this.#path = joinPath(parent.fullPath);

      if (parent.fullPath !== '/') {
        // ...but change the details for all others.
        this.#entries.unshift(
          parent.createParentEntry()
        );
      }

      this.#sort();

      this.bindEvents();
    }

    bindEvents() {
      this.on('upload:request', (path, file) => {
        if (joinPath(path) === this.#path) {
          this.add(new Entry({
            fullPath: joinPath(path, file.name),
            modified: file.lastModifiedDate,
            size: file.size,
            mimeType: file.type,
            placeholder: true
          }));
        }
      });

      this.on('upload:success', (path, completedFile) => {
        const [completedEntry] = this.filter((entry) => entry.fullPath === joinPath(path, completedFile.name));

        if (completedEntry) {
          completedEntry.placeholder = false;
        }
      });

      this.on('upload:failed', (path, failedFile) => {
        const [failedEntry] = this.filter((entry) => entry.fullPath === joinPath(path, failedFile.name));

        if (failedEntry) {
          this.remove(failedEntry);
        }
      });

      this.on('delete:success', (path) => {
        const [deletedFile] = this.filter((entry) => entry.fullPath === path);

        if (deletedFile) {
          this.remove(deletedFile);
        }
      });

      this.on('move:success', (sourceFullPath, destinationFullPath) => {
        const [entry] = this.filter((entry) => entry.fullPath === sourceFullPath);

        if (! entry) {
          return;
        }

        const newEntry = new Entry({
          directory: entry.directory,
          fullPath: destinationFullPath,
          modified: entry.modified,
          size: entry.size,
          mimeType: entry.mimeType,
          del: entry.del
        });

        this.remove(entry);

        if (entry.path === newEntry.path) {
          return this.add(newEntry);
        }

        this.trigger('cache:invalidate', newEntry.path);
      });

      this.on('mkcol:success', (destination, directoryName, path) => {
        if (joinPath(path) === this.#path) {
          this.add(new Entry({
            directory: true,
            fullPath: destination,
            modified: new Date()
          }));
        }
      });
    }

    add(entry) {
      entry.collection = this;
      this.#entries.push(entry);

      this.#sort();

      this.trigger('collection:update', this);

      return this;
    }

    remove(entry) {
      this.#entries = this.#entries.filter((item) => item !== entry);

      this.trigger('collection:update', this);

      return this;
    }

    map(iterator) {
      return this.#entries.map(iterator);
    }

    filter(iterator) {
      return this.#entries.filter(iterator);
    }

    get path() {
      return this.#path;
    }
}
