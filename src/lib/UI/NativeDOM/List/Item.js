import * as BasicLightbox from 'basiclightbox';
import Element from '../Element.js';
import Prism from 'prismjs';

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
        demoText = `The quick brown fox jumps over the lazy dog. 0123456789<br/>
        Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz`
      ;

      return `<style type="text/css">@font-face{font-family:"${fontName}";src:url("${entry.fullPath}") format("${formats[extension] || extension}")}</style>
<h1 style="font-family:'${fontName}'">${entry.name}</h1>
<p style="font-family:'${fontName}';font-size:1.5em">${demoText}</p>
<p style="font-family:'${fontName}'">${demoText}</p>
<p style="font-family:'${fontName}'"><strong>${demoText}</strong></p>
<p style="font-family:'${fontName}'"><em>${demoText}</em></p>`;
    },
    text: (entry, content) => `<pre><code class="language-${entry.extension}">${content.replace(/[<>]/g, (c) => ({'<': '&lt;', '>': '&gt;'}[c]))}</code></pre>`
  });

  constructor(entry, base64Encoder = btoa) {
    const template = `<li tabindex="0" data-full-path=${entry.fullPath}">
  <span class="title">${entry.title}</span>
  <input type="text" name="rename" class="hidden" readonly>
  <span class="size">${entry.displaySize}</span>
  <a href="#" title="Delete" class="delete"></a>
  <!--<a href="#" title="Move" class="move"></a>-->
  <a href="#" title="Rename" class="rename"></a>
  <!--<a href="#" title="Copy" class="copy"></a>-->
  <a href="${entry.fullPath}" download="${entry.name}" title="Download"></a>
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
      event.stopPropagation();

      this.del();
    });

    element.querySelector('.rename').addEventListener('click', (event) => {
      event.stopPropagation();
      event.preventDefault();

      this.rename();
    });

    element.addEventListener('keydown', (event) => {
      if (['F2', 'Delete', 'Enter'].includes(event.key)) {
        event.preventDefault();

        if (event.key === 'F2') {
          this.rename();
        }
        else if (event.key === 'Delete') {
          this.del();
        }
        else if (event.key === 'Enter' && ! this.#entry.directory) {
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

    // TODO: i18n
    if (! confirm(`Are you sure you want to delete '${entry.name}?'`)) {
      return;
    }

    this.trigger('delete', entry.fullPath, entry.path);
  }

  loading(loading = true) {
    if (loading) {
      return this.element.classList.add('loading');
    }

    this.element.classList.remove('loading');
  }

  download() {
    if (this.#entry.directory) {
      return;
    }

    this.element.querySelector('[download]').click();
  }

  open() {
    const entry = this.#entry;

    this.loading();

    if (entry.directory) {
      return this.trigger('go', entry.fullPath, false, () => this.loading(false));
    }

    const launchLightbox = (lightboxContent, onShow) => {
      const escapeListener = (event) => {
          if (event.key === 'Escape') {
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
    }
    ;

    if (['video', 'audio', 'image', 'font'].includes(entry.type)) {
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
    const entry = this.#entry,
      node = this.element,
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

          return this.trigger('move', entry.fullPath, entry.path + input.value);
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
        if (event.key === 'Enter') {
          event.stopPropagation();
          event.preventDefault();

          save();
        }
        else if (event.key === 'Escape') {
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
