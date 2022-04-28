import Element from './Element';
import List from './List';

export default class Container extends Element {
  constructor() {
    const template = '<main></main>';

    super(template);

    const list = new List();

    this.element.appendChild(list.element);
  }
}
