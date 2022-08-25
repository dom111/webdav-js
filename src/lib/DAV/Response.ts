import Collection from './Collection';

export default class Response {
  #collection;
  #document;
  #parser;

  #getTag = (doc: Element, tag: string) => doc.getElementsByTagName(tag)[0];

  #getTagContent = (doc: Element, tag) => {
    const node = this.#getTag(doc, tag);

    return node ? node.textContent : '';
  };

  constructor(rawDocument: string, parser: DOMParser = new DOMParser()) {
    this.#parser = parser;
    this.#document = parser.parseFromString(rawDocument, 'application/xml');
  }

  collection({ sortDirectoriesFirst = false } = {}) {
    if (!this.#collection) {
      this.#collection = new Collection(
        this.responseToPrimitives(
          this.#document.getElementsByTagName('D:response')
        ),
        {
          sortDirectoriesFirst,
        }
      );
    }

    return this.#collection;
  }

  responseToPrimitives(responses: HTMLCollection) {
    return Array.from(responses).map((response) => ({
      directory: !!this.#getTag(response, 'D:collection'),
      fullPath: this.#getTagContent(response, 'D:href'),
      modified: Date.parse(
        this.#getTagContent(response, 'lp1:getlastmodified')
      ),
      size: parseInt(this.#getTagContent(response, 'lp1:getcontentlength'), 10),
      mimeType: this.#getTagContent(response, 'D:getcontenttype'),
    }));
  }
}
