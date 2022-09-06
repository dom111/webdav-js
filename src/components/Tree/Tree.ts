import Element, { s } from '@dom111/element';
import Leaf, { LeafEvents } from './Leaf';
import DataProvider from './DataProvider';
import Node from './Node';

interface TreeOptions {
  multiple: boolean;
  rootLabel: string;
}

type TreeEvents = LeafEvents & {
  selected: [Node | null];
};

export class Tree extends Element<HTMLDivElement, TreeEvents> {
  #dataProvider: DataProvider;
  #options: TreeOptions = {
    multiple: false,
    rootLabel: '/',
  };
  #rootNode: Node;
  #selected: Node | null = null;

  constructor(dataProvider: DataProvider, options: Partial<TreeOptions> = {}) {
    super(s(`<div class="tree"></div>`));

    this.#dataProvider = dataProvider;
    this.#options = {
      ...this.#options,
      ...options,
    };
    this.#rootNode = new Node([], this.#options.rootLabel);

    this.bindEvents();
    this.build(this.#rootNode);
  }

  private bindEvents(): void {
    this.on('leaf-deselected', () => this.setSelected(null));

    this.on('leaf-selected', ({ detail: [leaf] }) => {
      if (!this.#options.multiple) {
        this.clearSelected();
      }

      this.setSelected(leaf.node());
    });
  }

  private async build(node: Node): Promise<void> {
    this.append(new Leaf(node, this.#dataProvider));

    this.#dataProvider.getChildren(node);
  }

  private clearSelected(): void {
    this.queryAll('.leaf[aria-selected="true"]').forEach((leafNode) =>
      leafNode.setAttribute('aria-selected', 'false')
    );
  }

  private setSelected(selected: Node | null): void {
    this.#selected = selected;

    this.emitCustom('selected', selected);
  }

  value(): string[] | null {
    return this.#selected && this.#selected.fullPath();
  }
}

export default Tree;
