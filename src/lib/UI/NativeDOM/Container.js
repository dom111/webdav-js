import Element from './Element.js';
import List from './List.js';

export default class Container extends Element {
  constructor() {
    const template = '<main></main>';

    super(template);

    const list = new List();

    this.element.append(list.element);
  }
}
