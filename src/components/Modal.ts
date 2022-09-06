import Element, { CustomEventMap, h } from '@dom111/element';

export class Modal<M extends CustomEventMap = CustomEventMap> extends Element<
  HTMLDialogElement,
  M
> {
  #contentArea: HTMLElement;

  constructor(...childNodes: Node[]) {
    super(h('dialog[tabindex="0"]'));

    this.#contentArea = h('.content', ...childNodes);

    this.element().append(this.#contentArea);

    document.body.append(this.element());

    this.bindEvents();
  }

  append(...childNodes: (Element | Node)[]): void {
    this.#contentArea.append(
      ...childNodes.map((node) =>
        node instanceof Element ? node.element() : node
      )
    );
  }

  private bindEvents(): void {
    this.on('click', (event) => {
      if (event.target !== this.element()) {
        return;
      }

      this.close();
    });

    this.on('keydown', (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return;
      }

      this.close();
    });
  }

  close(): void {
    this.element().removeAttribute('open');
  }

  open(): void {
    this.element().setAttribute('open', '');

    this.element().focus();
  }

  setLabel(label: string): void {
    this.element().setAttribute('aria-label', label);
  }
}

export default Modal;
