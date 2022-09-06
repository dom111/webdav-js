import Element, { empty, on, s, t } from '@dom111/element';
import DataProvider from './DataProvider';
import Node from './Node';

const template = (node: Node): string => `
<div
    class="leaf"
    tabindex="0"
    aria-selected="false"
    aria-expanded="false"
>
  <span class="toggle"></span>
  <span class="name"></span>
  <section class="children"></section>
</div>
`;

export type LeafEvents = {
  'leaf-collapsed': [Leaf];
  'leaf-deselected': [Leaf];
  'leaf-expanded': [Leaf];
  'leaf-selected': [Leaf];
};

export class Leaf extends Element<HTMLDivElement, LeafEvents> {
  #dataProvider: DataProvider;
  #node: Node;

  constructor(node: Node, dataProvider: DataProvider) {
    super(s(template(node)));

    this.query('.name').append(t(node.name()));

    this.#dataProvider = dataProvider;
    this.#node = node;

    this.bindEvents();
    this.update();
  }

  private bindEvents(): void {
    const getChildren = async (node: Node) => {
        if (node.hasChildren() === null) {
          await this.#dataProvider.getChildren(this.#node);
        }

        if (node.hasChildren()) {
          this.#node
            .children()
            .forEach((childNode) => this.#dataProvider.getChildren(childNode));
        }
      },
      expand = () => {
        this.emit(
          new CustomEvent<[Leaf]>(
            this.expanded() ? 'leaf-collapsed' : 'leaf-expanded',
            {
              bubbles: true,
              detail: [this],
            }
          )
        );

        this.element().setAttribute(
          'aria-expanded',
          this.expanded() ? 'false' : 'true'
        );

        getChildren(this.#node);
      },
      select = () => {
        this.emit(
          new CustomEvent<[Leaf]>(
            this.selected() ? 'leaf-deselected' : 'leaf-selected',
            {
              bubbles: true,
              detail: [this],
            }
          )
        );

        this.element().setAttribute(
          'aria-selected',
          this.selected() ? 'false' : 'true'
        );

        getChildren(this.#node);
      };

    on(this.toggle(), 'click', (event) => {
      event.preventDefault();
      event.stopPropagation();

      expand();
    });

    this.on('click', (event) => {
      if (event.button) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      select();

      if (
        this.#node.hasChildren() &&
        this.element().matches('[aria-expanded="false"]')
      ) {
        expand();
      }
    });

    this.#node.on('updated', () => this.update());
  }

  private children(): HTMLDivElement {
    return this.query<HTMLDivElement>('.children');
  }

  private expanded(): boolean {
    return this.element().getAttribute('aria-expanded') === 'true';
  }

  node(): Node {
    return this.#node;
  }

  private selected(): boolean {
    return this.element().getAttribute('aria-selected') === 'true';
  }

  private toggle(): HTMLSpanElement {
    return this.query<HTMLSpanElement>('.toggle');
  }

  private update(): void {
    if (this.#node.hasChildren() === null) {
      return;
    }

    if (this.#node.hasChildren()) {
      this.addClass('hasChildren');

      empty(this.children());

      this.#node.children().forEach((child) => {
        const leaf = new Leaf(child, this.#dataProvider);

        this.children().append(leaf.element());
      });

      return;
    }

    this.addClass('hasNoChildren');
  }
}

export default Leaf;
