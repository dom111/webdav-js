import DataProvider from './DataProvider';
import Node from './Node';

export class PlainObject implements DataProvider {
  #object: { [key: string]: any };
  #seen: Map<any, string[]> = new Map();

  constructor(object: { [key: string]: any }) {
    this.#object = object;
  }

  async getChildren(node: Node): Promise<Node[] | null> {
    if (node.hasChildren() !== null) {
      return node.children();
    }

    const object = node.fullPath().reduce((object: any, key) => {
      if (typeof object === 'object' && object !== null && key in object) {
        return object[key];
      }

      return null;
    }, this.#object);

    if (object === null || typeof object !== 'object') {
      node.setChildren([]);

      return [];
    }

    const children = Object.entries(object).map(([key, value]) => {
      if (value && typeof value === 'object' && this.#seen.has(value)) {
        const duplicatePath = this.#seen.get(value);

        return new Node(
          [...node.fullPath(), key],
          `#<Duplicate: <root>${duplicatePath.reduce((s, piece) => {
            if (typeof piece === 'number' || /^\d+$/.test(piece)) {
              return s + `[${piece}]`;
            }

            if (typeof piece !== 'string') {
              return s;
            }

            if (!/\W|^\d/.test(piece)) {
              return s + `.${piece}`;
            }

            if (/'/.test(piece)) {
              return s + `['${piece.replace(/'/g, "\\'")}']`;
            }

            return s + `['${piece}']`;
          }, '')}>`,
          []
        );
      }

      this.#seen.set(value, [...node.fullPath(), key]);

      return new Node(
        [...node.fullPath(), key],
        key +
          (['string', 'number', 'boolean'].includes(typeof value)
            ? ': ' + value
            : '')
      );
    });

    node.setChildren(children);

    return children;
  }
}

export default PlainObject;
