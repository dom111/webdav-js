import * as BasicLightbox from 'basiclightbox';
import Element from '../Element.js';
import Prism from 'prismjs';
import i18next from 'i18next';
import joinPath from '../../../joinPath.js';

export default class Item extends Element {
  #base64Encoder;
  #entry;
  #templates = Object.freeze({
    video: (entry) => `<video autoplay controls><source src="${entry.fullPath}"/></video>`,
    audio: (entry) => `<audio autoplay controls><source src="${entry.fullPath}"/></audio>`,
    image: (entry) => `<img alt="${entry.title}" src="${entry.fullPath}"/>`,
    font: (entry) => {
      const formats = {
          eot: 'embedded-opentype',
          otf: 'opentype',
          ttf: 'truetype'
        },
        extension = entry.name.replace(/^.+\.([^.]+)$/, '$1').toLowerCase(),
        fontName = entry.fullPath.replace(/\W+/g, '_'),
        demoText = `${i18next.t('pangram')} 0123456789<br/>
        ${i18next.t('alphabet')}`
      ;

      return `<style type="text/css">@font-face{font-family:"${fontName}";src:url("${entry.fullPath}") format("${formats[extension] || extension}")}</style>
<h1 style="font-family:'${fontName}'">${entry.title}</h1>
<p style="font-family:'${fontName}';font-size:1.5em">${demoText}</p>
<p style="font-family:'${fontName}'">${demoText}</p>
<p style="font-family:'${fontName}'"><strong>${demoText}</strong></p>
<p style="font-family:'${fontName}'"><em>${demoText}</em></p>`;
    },
    text: (entry, content) => `<pre><code class="language-${entry.extension}">${content.replace(/[<>]/g, (c) => ({'<': '&lt;', '>': '&gt;'}[c]))}</code></pre>`,
    pdf: (entry) => `<iframe src="${entry.fullPath}" frameborder="0" border="0" height="100%" width="100%"></iframe>`
  });

  constructor(entry, base64Encoder = btoa) {
    const template = `<li tabindex="0" data-full-path=${entry.fullPath}">
  <span class="title">${entry.title}</span>
  <input type="text" name="rename" class="hidden" readonly>
  <span class="size">${entry.displaySize}</span>
  <a href="#" title="${i18next.t('delete')} (␡)" class="delete"></a>
  <!--<a href="#" title="Move" class="move"></a>-->
  <a href="#" title="${i18next.t('rename')} (F2)" class="rename"></a>
  <!--<a href="#" title="Copy" class="copy"></a>-->
  <a href="${entry.fullPath}" download="${entry.name}" title="${i18next.t('download')} (⇧+⏎)"></a>
</li>`;

    super(template);

    this.#base64Encoder = base64Encoder;
    this.#entry = entry;

    this.element.classList.add(
      ...[
        entry.directory ? 'directory' : 'file',
        entry.type      ? entry.type  : 'unknown'
      ]
    );

    if (entry.placeholder) {
      this.element.classList.add('loading');
    }

    if (! entry.del) {
      this.element.querySelector('.delete').setAttribute('hidden', '');
    }

    if (! entry.rename) {
      this.element.querySelector('.rename').setAttribute('hidden', '');
    }

    this.bindEvents();
  }

  bindEvents(element = this.element) {
    this.on('entry:update', (entry) => {
      if (entry === this.#entry) {
        this.update();
      }
    });

    this.on('move:failed', (sourcePath) => {
      if (sourcePath === this.#entry.fullPath) {
        this.loading(false);
      }
    });

    this.on('delete:failed', (sourcePath) => {
      if (sourcePath === this.#entry.fullPath) {
        this.loading(false);
      }
    });

    element.addEventListener('click', () => this.open());

    element.querySelector('[download]').addEventListener('click', (event) => event.stopPropagation());

    element.querySelector('.delete').addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();

      this.del();
    });

    element.querySelector('.rename').addEventListener('click', (event) => {
      event.stopPropagation();
      event.preventDefault();

      this.rename();
    });

    element.addEventListener('keydown', (event) => {
      if ([113, 46, 13].includes(event.which)) { // if (['F2', 'Delete', 'Enter'].includes(event.key)) {
        event.preventDefault();

        if (event.which === 113) { // if (event.key === 'F2') {
          if (this.#entry.rename) {
            this.rename();
          }
        }
        else if (event.which === 46) { // else if (event.key === 'Delete') {
          if (this.#entry.del) {
            this.del();
          }
        }
        else if (event.which === 13 && ! this.#entry.directory) { // else if (event.key === 'Enter' && ! this.#entry.directory) {
          if (event.shiftKey) {
            return this.download();
          }

          this.open();
        }
      }
    });
  }

  del() {
    const entry = this.#entry;

    if (! entry.del) {
      throw new TypeError(`'${entry.name}' is read only.`);
    }

    this.loading();

    if (! confirm(i18next.t('deleteConfirm', {
      file: entry.title
    }))) {
      return this.loading(false);
    }

    this.trigger('delete', entry.fullPath, entry);
  }

  download() {
    if (this.#entry.directory) {
      return;
    }

    this.element.querySelector('[download]').click();
  }

  loading(loading = true) {
    if (loading) {
      return this.element.classList.add('loading');
    }

    this.element.classList.remove('loading');
  }

  open() {
    const entry = this.#entry;

    this.loading();

    if (entry.directory) {
      return this.trigger('go', entry.fullPath, {
        failure: () => this.loading(false)
      });
    }

    const launchLightbox = (lightboxContent, onShow) => {
      const escapeListener = (event) => {
          if (event.which === 27) { // if (event.key === 'Escape') {
            lightbox.close();
          }
        },
        lightbox = BasicLightbox.create(lightboxContent, {
          className: entry.type,
          onShow: () => {
            this.loading(false);
            document.addEventListener('keydown', escapeListener);

            if (onShow) {
              onShow(lightbox);
            }
          },
          onClose: () => document.removeEventListener('keydown', escapeListener)
        })
      ;

      lightbox.show();
    };

    if (['video', 'audio', 'image', 'font', 'pdf'].includes(entry.type)) {
      this.trigger('check', entry.fullPath, () => {
        launchLightbox(this.#templates[entry.type](entry));
      }, () => this.loading(false));
    }
    else {
      this.trigger('get', entry.fullPath, (content) => {
        if (! content) {
          return this.loading(false);
        }

        if (entry.type !== 'text') {
          return this.download();
        }

        launchLightbox(this.#templates.text(entry, content), (lightbox) => Prism.highlightAllUnder(lightbox.element()));
      });

      this.loading(false);
    }

    event.preventDefault();
  }

  rename() {
    const entry = this.#entry;

    if (! entry.rename) {
      throw new TypeError(`'${entry.name}' cannot be renamed.`);
    }

    const node = this.element,
      title = node.querySelector('.title'),
      input = node.querySelector('input'),
      setInputSize = () => {
        title.innerText = input.value;
        input
          .style
          .setProperty(
            'width',
            `${title.scrollWidth}px`
          )
        ;
      },
      save = () => {
        // don't process if there's no name change
        if (input.value !== entry.title) {
          this.loading();

          unbindListeners();

          return this.trigger('move', entry.fullPath, joinPath(entry.path, input.value), entry);
        }

        revert();
      },
      unbindListeners = () => {
        input.removeEventListener('blur', blurListener);
        input.removeEventListener('keydown', keyDownListener);
        input.removeEventListener('input', inputListener);
      },
      revert = () => {
        title.classList.remove('invisible');
        input.classList.add('hidden');
        input.value = entry.title;
        setInputSize();
        unbindListeners();

        return node.focus();
      },
      blurListener = () => {
        save();
      },
      keyDownListener = (event) => {
        if (event.which === 13) { // if (event.key === 'Enter') {
          event.stopPropagation();
          event.preventDefault();

          save();
        }
        else if (event.which === 27) { // else if (event.key === 'Escape') {
          revert();
        }
      },
      inputListener = () => {
        return setInputSize();
      }
    ;

    title.classList.add('invisible');

    input.classList.remove('hidden');
    input.value = entry.title;
    setInputSize();
    input.removeAttribute('readonly');
    input.addEventListener('blur', blurListener);
    input.addEventListener('keydown', keyDownListener);
    input.addEventListener('input', inputListener);
    input.focus();
  }

  update() {
    if (this.#entry.placeholder && this.element.classList.contains('placeholder')) {
      this.element.classList.remove('placeholder');
    }
  }
}
