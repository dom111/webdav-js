import { h, on, t } from '@dom111/element';
import joinPath, { leadingAndTrailingSlash } from '../lib/joinPath';
import Modal from './Modal';
import Tree from './Tree/Tree';
import WebDAV from './Tree/WebDAV';

type TreeViewModalEvents = {
  cancelled: [];
  selected: [string];
};

export class TreeViewModal extends Modal<TreeViewModalEvents> {
  #tree: Tree;

  constructor(title: string) {
    super();

    this.#tree = new Tree(new WebDAV());

    this.append(
      h('header', h('h2', t(title))),
      this.#tree,
      h(
        'footer',
        h('button[type="submit"]', t('Choose')),
        h('button', t('Cancel'))
      )
    );

    this.addClass('tree-view-modal');

    this.bindLocalEvents();
  }

  private bindLocalEvents(): void {
    on(this.query('button[type="submit"]'), 'click', () => {
      const value = this.#tree.value();

      if (value === null) {
        this.emitCustom('selected', null);

        return;
      }

      this.emitCustom('selected', leadingAndTrailingSlash(joinPath(...value)));
    });

    on(this.query('button:not([type="submit"])'), 'click', () => {
      this.emitCustom('cancelled');
    });
  }

  async value(): Promise<string | null> {
    return new Promise<string>((resolve) => {
      this.on('cancelled', () => resolve(null));

      this.on('selected', ({ detail: [path] }) => resolve(path));
    });
  }
}

export default TreeViewModal;
