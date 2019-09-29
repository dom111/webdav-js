import Entry from './Entry.js';

export default class Response {
    #parser;
    #document;
    #entries;

    #getTag = (doc, tag) => doc.querySelector(tag);

    #getTagContent = (doc, tag) => {
        const node = this.#getTag(doc, tag);

        return node ? node.textContent : '';
    };

    constructor(rawDocument, parser = new DOMParser()) {
        this.#parser = parser;
        this.#document = parser.parseFromString(rawDocument, 'application/xml');
    }

    entries() {
        if (! this.#entries) {
            this.#entries = Array.from(
                    this.#document.querySelectorAll('response')
                ).map((item) => this.responseToEntry(item))
            ;

            // the first entry is a stub for the directory itself, we can remove that for the root path...
            const parent = this.#entries.shift();

            if (parent.fullPath !== '/') {
                // ...but change the details for all others.
                this.#entries.unshift(
                    Entry.createParentEntry(parent)
                );
            }
        }

        return this.#entries;
    }

    responseToEntry(response) {
        return new Entry({
            directory: !!this.#getTag(response,'collection'),
            fullPath: this.#getTagContent(response, 'href'),
            modified: Date.parse(
                    this.#getTagContent(response, 'getlastmodified')
                )
            ,
            size: parseInt(
                    this.#getTagContent(response, 'getcontentlength'),
                    10
                )
            ,
            mimeType: this.#getTagContent(response, 'getcontenttype'),
            del: true
        });
    }
}