import EventObject from '../../EventObject.js';

export default class Element extends EventObject {
  #element;

  constructor(template = null) {
    super();

    if (template !== null) {
      this.#element = this.createNodeFromString(template);
    }
  }

  get element() {
    return this.#element;
  }

  createNodesFromString(html) {
    const container = document.createElement('div'),
      fragment = document.createDocumentFragment()
    ;

    container.innerHTML = html;

    for (const childNode of container.childNodes) {
      fragment.appendChild(childNode);
    }

    return fragment;
  }

  createNodeFromString(html) {
    return this.createNodesFromString(html).firstChild;
  }

  emptyNode() {
    while (this.element.firstChild) {
      this.element.removeChild(this.element.firstChild);
    }
  }
}
