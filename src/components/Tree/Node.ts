import EventEmitter from '@dom111/typed-event-emitter/EventEmitter';

type NodeEvents = {
  updated: [];
};

export class Node extends EventEmitter<NodeEvents> {
  #fullPath: string[];
  #children: Node[] | null;
  #name: string;

  constructor(
    fullPath: string[],
    name: string,
    children: Node[] | null = null
  ) {
    super();

    this.#fullPath = fullPath;
    this.#name = name;
    this.#children = children;
  }

  children(): Node[] | null {
    return this.#children;
  }

  fullPath(): string[] {
    return this.#fullPath;
  }

  hasChildren(): boolean | null {
    if (this.#children === null) {
      return null;
    }

    return this.#children.length > 0;
  }

  name(): string {
    return this.#name;
  }

  setChildren(children: Node[]): void {
    this.#children = children;

    this.emit('updated');
  }
}

export default Node;
