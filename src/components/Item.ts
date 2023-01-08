import { BasicLightBox, create } from 'basiclightbox';
import Element, {
  addClass,
  emit,
  off,
  on,
  removeClass,
  s,
} from '@dom111/element';
import joinPath, { trailingSlash } from '../lib/joinPath';
import DAV from '../lib/DAV';
import Entry from '../lib/Entry';
import Prism from 'prismjs';
import State from '../lib/State';
import TreeViewModal from './TreeViewModal';
import previewItems from '../lib/previewItems';
import { success } from 'melba-toast';
import { t } from 'i18next';

const template = (entry: Entry): string => `<li tabindex="0" data-full-path="${
  entry.fullPath
}" data-type="${entry.type}">
  <span class="title">${entry.title}</span>
  <input type="text" name="rename" class="hidden" readonly>
  <span class="size">${entry.displaySize}</span>
  <a href="${entry.fullPath}" download="${decodeURI(entry.name)}" title="${t(
  'download'
)} (⇧+⏎)"></a>
  <a href="#" title="${t('copy')}" class="copy"></a>
  <a href="#" title="${t('rename')} (F2)" class="rename"></a>
  <a href="#" title="${t('move')}" class="move"></a>
  <a href="#" title="${t('delete')} (␡)" class="delete"></a>
</li>`;

export default class Item extends Element {
  #dav: DAV;
  #entry: Entry;
  #state: State;
  #templates: {
    [key: string]: (entry: Entry, content?: string) => string;
  } = Object.freeze({
    video: (entry: Entry): string =>
      `<video autoplay controls><source src="${entry.fullPath}"/></video>`,
    audio: (entry: Entry): string =>
      `<audio autoplay controls><source src="${entry.fullPath}"/></audio>`,
    image: (entry: Entry): string =>
      `<img alt="${entry.title}" src="${entry.fullPath}"/>`,
    font: (entry: Entry): string => {
      const formats = {
          eot: 'embedded-opentype',
          otf: 'opentype',
          ttf: 'truetype',
        },
        extension = entry.name.replace(/^.+\.([^.]+)$/, '$1').toLowerCase(),
        fontName = entry.fullPath.replace(/\W+/g, '_'),
        demoText = `${t('pangram')} 0123456789<br/>
        ${t('alphabet')}`;

      return `<style>@font-face{font-family:"${fontName}";src:url("${
        entry.fullPath
      }") format("${formats[extension] || extension}")}</style>
<h1 style="font-family:'${fontName}'">${entry.title}</h1>
<p style="font-family:'${fontName}';font-size:1.5em">${demoText}</p>
<p style="font-family:'${fontName}'">${demoText}</p>
<p style="font-family:'${fontName}'"><strong>${demoText}</strong></p>
<p style="font-family:'${fontName}'"><em>${demoText}</em></p>`;
    },
    text: (entry: Entry, content: string): string =>
      `<pre><code class="language-${entry.extension}">${content.replace(
        /[<>]/g,
        (c: string): string => (c === '<' ? '&lt;' : '&gt;')
      )}</code></pre>`,
    pdf: (entry: Entry): string =>
      `<iframe src="${entry.fullPath}" height="100%" width="100%"></iframe>`,
  });

  constructor(entry: Entry, dav: DAV, state: State) {
    super(s(template(entry)));

    this.#dav = dav;
    this.#state = state;
    this.#entry = entry;

    this.addClass(
      ...[
        entry.directory ? 'directory' : 'file',
        entry.type ? entry.type : 'unknown',
      ]
    );

    if (entry.placeholder) {
      this.addClass('loading');
    }

    if (!entry.copy) {
      this.query('.copy').setAttribute('hidden', '');
    }

    if (!entry.del) {
      this.query('.delete').setAttribute('hidden', '');
    }

    if (!entry.move) {
      this.query('.move').setAttribute('hidden', '');
    }

    if (!entry.rename) {
      this.query('.rename').setAttribute('hidden', '');
    }

    this.bindEvents();
  }

  private bindEvents(): void {
    this.on('click', (event: MouseEvent): void => {
      if (event.ctrlKey || event.button === 1) {
        window.open(this.#entry.fullPath);

        return;
      }

      if (event.shiftKey) {
        this.download();

        return;
      }

      this.open();
    });

    const entryUpdatedHandler = (): void => {
      this.#entry.off('updated', entryUpdatedHandler);

      this.update();
    };

    this.#entry.on('updated', entryUpdatedHandler);

    on(this.query('[download]'), 'click', (event: MouseEvent): void =>
      event.stopPropagation()
    );

    on(this.query('.delete'), 'click', (event: MouseEvent): void => {
      event.preventDefault();
      event.stopPropagation();

      this.del();
    });

    on(this.query('.rename'), 'click', (event: MouseEvent): void => {
      event.stopPropagation();
      event.preventDefault();

      this.rename();
    });

    on(this.query('.copy'), 'click', (event): void => {
      event.stopPropagation();
      event.preventDefault();

      this.copy();
    });

    on(this.query('.move'), 'click', (event): void => {
      event.stopPropagation();
      event.preventDefault();

      this.move();
    });

    this.on('keydown', (event: KeyboardEvent): void => {
      if (['F2', 'Delete', 'Enter'].includes(event.key)) {
        event.preventDefault();

        if (event.key === 'F2' && this.#entry.rename) {
          this.rename();
        }

        if (event.key === 'Delete' && this.#entry.del) {
          this.del();
        }

        if (event.key === 'Enter' && !this.#entry.directory && event.shiftKey) {
          this.download();

          return;
        }

        if (event.key === 'Enter') {
          this.open();
        }
      }
    });
  }

  async copy(): Promise<void> {
    const entry = this.#entry,
      modal = new TreeViewModal(
        t('copyItemTitle', {
          file: entry.title,
        })
      );

    modal.open();

    const target = await modal.value();

    modal.close();

    if (!target) {
      return;
    }

    const destination = joinPath(target, entry.name),
      checkResponse = await this.#dav.check(destination, true);

    if (
      checkResponse.ok &&
      !confirm(
        t('overwriteFileConfirmation', {
          file: entry.name,
        })
      )
    ) {
      return;
    }

    const response = await this.#dav.copy(
      entry.fullPath,
      destination,
      entry,
      true
    );

    if (!response.ok) {
      return;
    }

    this.#dav.invalidateCache(trailingSlash(target));

    success(
      t('successfullyCopied', {
        interpolation: {
          escapeValue: false,
        },
        from: entry.title,
        to: destination,
      })
    );
  }

  async del(): Promise<void> {
    const entry = this.#entry;

    if (!entry.del) {
      throw new TypeError(`'${entry.name}' is read only.`);
    }

    this.addClass('loading');

    if (
      !confirm(
        t('deleteConfirmation', {
          file: entry.title,
        })
      )
    ) {
      this.removeClass('loading');

      return;
    }

    const response = await this.#dav.del(entry.fullPath);

    if (!response.ok) {
      return;
    }

    this.#state.getCollection().remove(this.#entry);
    this.element().remove();

    success(
      t('successfullyDeleted', {
        interpolation: {
          escapeValue: false,
        },
        file: entry.title,
      })
    );
  }

  download(): void {
    if (this.#entry.directory) {
      return;
    }

    emit(this.query<HTMLAnchorElement>('[download]'), new MouseEvent('click'));
  }

  async move(): Promise<void> {
    const entry = this.#entry,
      modal = new TreeViewModal(
        t('moveItemTitle', {
          file: entry.title,
        })
      );

    modal.open();

    const target = await modal.value();

    modal.close();

    if (!target) {
      return;
    }

    const destination = joinPath(target, entry.name),
      checkResponse = await this.#dav.check(destination, true);

    if (
      checkResponse.ok &&
      !confirm(
        t('overwriteFileConfirmation', {
          file: entry.name,
        })
      )
    ) {
      return;
    }

    const response = await this.#dav.move(
      entry.fullPath,
      destination,
      entry,
      true
    );

    if (!response.ok) {
      return;
    }

    this.#dav.invalidateCache(trailingSlash(target));
    this.#state.update(true);

    success(
      t('successfullyMoved', {
        interpolation: {
          escapeValue: false,
        },
        from: entry.title,
        to: destination,
      })
    );
  }

  async open(): Promise<void> {
    if (this.hasClass('open')) {
      return;
    }

    this.addClass('open', 'loading');

    const entry = this.#entry,
      response = await this.#dav.check(entry.fullPath);

    if (!response.ok) {
      this.removeClass('open', 'loading');

      return;
    }

    if (entry.directory) {
      this.#state.setPath(entry.fullPath);
      this.removeClass('open', 'loading');

      return;
    }

    const launchLightbox = (
      lightboxContent: string,
      onShow: ((lightbox: BasicLightBox) => any) | null = null
    ): void => {
      const close = (): void => lightbox.close(),
        keyListener = (event: KeyboardEvent): void => {
          if (!['Escape', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
            return;
          }

          const [previous, next] = previewItems(
            this.element(),
            'li:not(.directory):not([data-type="unknown"])'
          );

          close();

          if (event.key === 'ArrowUp' && previous) {
            emit(previous, new MouseEvent('click'));
          }

          if (event.key === 'ArrowDown' && next) {
            emit(next, new MouseEvent('click'));
          }
        },
        lightbox = create(lightboxContent, {
          className: entry.type,
          onShow: (): boolean => {
            this.removeClass('loading');

            on(document, 'keydown', keyListener);

            if (onShow) {
              onShow(lightbox);
            }

            this.#state.showPath(entry.fullPath);

            this.#state.on('updated', close);

            return true;
          },
          onClose: (): boolean => {
            off(document, 'keydown', keyListener);
            this.#state.off('updated', close);

            this.#state.showPath(entry.path);

            this.removeClass('open');

            return true;
          },
        });

      lightbox.show();
    };

    if (['video', 'audio', 'image', 'font', 'pdf'].includes(entry.type)) {
      launchLightbox(this.#templates[entry.type](entry));

      this.removeClass('loading');

      return;
    }

    if (entry.type !== 'text') {
      this.removeClass('open', 'loading');

      this.download();

      return;
    }

    const content = await this.#dav.get(entry.fullPath);

    if (!content) {
      this.removeClass('open', 'loading');

      return;
    }

    launchLightbox(
      this.#templates.text(entry, content),
      (lightbox: BasicLightBox): void =>
        Prism.highlightAllUnder(lightbox.element())
    );

    this.removeClass('loading');
  }

  async rename(): Promise<void> {
    const entry = this.#entry;

    if (!entry.rename) {
      throw new TypeError(`'${entry.name}' cannot be renamed.`);
    }

    const node = this.element(),
      title = this.query<HTMLElement>('.title'),
      input = this.query<HTMLInputElement>('input'),
      setInputSize = (): void => {
        title.innerText = input.value;
        input.style.setProperty('width', `${title.scrollWidth}px`);
      },
      save = async (): Promise<void> => {
        // don't process if there's no name change
        if (input.value !== entry.title) {
          this.addClass('loading');

          unbindListeners();

          const destinationPath = joinPath(entry.path, input.value),
            result = await this.#dav.move(
              entry.fullPath,
              encodeURI(destinationPath),
              entry
            );

          if (!result.ok) {
            return;
          }

          success(
            t('successfullyRenamed', {
              interpolation: {
                escapeValue: false,
              },
              from: entry.title,
              to: input.value,
            })
          );

          entry.name = input.value;
        }

        revert();
      },
      unbindListeners = (): void => {
        off(input, 'blur', blurListener);
        off(input, 'keydown', keyDownListener);
        off(input, 'input', inputListener);
      },
      revert = (): void => {
        removeClass(title, 'invisible');
        addClass(input, 'hidden');
        input.value = entry.title;
        setInputSize();
        unbindListeners();

        node.focus();
      },
      blurListener = async (): Promise<void> => {
        await save();
      },
      keyDownListener = async (event: KeyboardEvent): Promise<void> => {
        event.stopPropagation();

        if (event.key === 'Enter') {
          event.preventDefault();

          await save();
        }

        if (event.key === 'Escape') {
          revert();
        }
      },
      inputListener = (): void => {
        return setInputSize();
      };

    addClass(title, 'invisible');
    removeClass(input, 'hidden');

    input.value = entry.title;

    setInputSize();
    input.removeAttribute('readonly');
    on(input, 'blur', blurListener);
    on(input, 'keydown', keyDownListener);
    on(input, 'input', inputListener);
    input.focus();
  }

  update(): void {
    const newItem = new Item(this.#entry, this.#dav, this.#state);

    this.element().replaceWith(newItem.element());
  }
}
