import Element, { s } from '@dom111/element';

export default class Container extends Element {
  constructor() {
    const template = '<main></main>';

    super(s(template));
  }
}
