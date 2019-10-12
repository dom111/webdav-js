import Element from './Element.js';
import List from './List.js';

export default class Container extends Element {
  constructor(ui, list = new List(ui)) {
    const template = '<main></main>';

    super(ui, template);

    this.element.append(list.element);
  }
}
