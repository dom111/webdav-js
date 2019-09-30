import Entry from "./Entry.js";

export default class Collection {
    #path;
    #entries;

    // don't need to handle equal paths as that's invalid
    #sort = () => this.#entries.sort((a, b) => a.fullPath < b.fullPath ? -1 : 1);

    constructor(items) {
        this.#entries = items
            .map((item) => new Entry(item))
        ;

        // the first entry is a stub for the directory itself, we can remove that for the root path...
        const parent = this.#entries.shift();

        this.#path = parent.fullPath;

        if (parent.fullPath !== '/') {
            // ...but change the details for all others.
            this.#entries.unshift(
                Entry.createParentEntry(parent)
            );
        }

        this.#sort();
    }

    add(entry) {
        this.#entries.push(entry);
        return this.#sort();
    }

    remove(entry) {
        return this.#entries = this.#entries.filter((item) => item !== entry);
    }

    map(iterator) {
        return this.#entries.map(iterator);
    }

    get path() {
        return this.#path;
    }
}
