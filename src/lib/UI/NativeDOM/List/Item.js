import * as BasicLightbox from 'basiclightbox';
import Element from '../Element.js'
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
        demoText = 'The quick brown fox jumps over the lazy dog. 0123456789<br/>Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz'
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

  constructor(ui, entry, base64Encoder = btoa) {
    const template = `<li tabindex="0" data-full-path=${entry.fullPath}">
  <span class="title">${entry.title}</span>
  <input type="text" name="rename" class="hidden" readonly>
  <span class="size">${entry.displaySize}</span>
  <a href="#" title="Delete" class="delete"></a>
  <!--<a href="#" title="Move" class="move"></a>-->
  <a href="#" title="Rename" class="rename"></a>
  <!--<a href="#" title="Copy" class="copy"></a>-->
  <a href="${entry.fullPath}" download="${entry.title}" title="Download" class="download"></a>
</li>`;

    super(ui, template);

    this.#base64Encoder = base64Encoder;
    this.#entry = entry;

    this.element.classList.add(
      ...[
        entry.directory ? 'directory' : 'file',
        entry.type      ? entry.type  : 'unknown'
      ]
    );

    this.bindEvents();
  }

  bindEvents(element = this.element) {
    element.addEventListener('click', () => this.open());

    element.addEventListener('keydown', (event) => {
      if (['F2', 'Delete', 'Enter'].includes(event.key)) {
        event.preventDefault();

        if (event.key === 'F2') {
          this.rename();
        }
        else if (event.key === 'Delete') {
          this.del();
        }
        else if (event.key === 'Enter') {
          this.open();
        }
      }
    });
  }

  async del() {
    const entry = this.#entry;

    if (!entry.del) {
      throw new TypeError(`'${entry.name}' is read only.`);
    }

    this.element.classList.add('loading');

    // TODO: i18n
    if (!confirm(`Are you sure you want to delete '${entry.name}?'`)) {
      return;
    }

    this.ui.trigger('delete', entry.fullPath, entry.path);
  }

  async open() {
    const entry = this.#entry;
    this.element.classList.add('loading');

    if (entry.directory) {
      return this.ui.trigger('go', entry.fullPath);
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
              this.element.classList.remove('loading');
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
      this.ui.trigger('check', entry.fullPath, (response) => {
        launchLightbox(this.#templates[entry.type](entry));
      });
    }
    else {
      this.ui.trigger('get', entry.fullPath, async (content) => {
        if (!content) {
          return this.element.classList.remove('loading');
        }

        if (entry.type !== 'text') {
          return location.href = `data:application/octet-stream;base64,${this.#base64Encoder(content)}`;
        }

        launchLightbox(this.#templates.text(entry, content), (lightbox) => Prism.highlightAllUnder(lightbox.element()));
      });

      this.element.classList.remove('loading');
    }

    event.preventDefault();
  }

  async rename() {
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
      cancel = () => {
        title.classList.remove('invisible');
        input.classList.add('hidden');

        return node.focus();
      }
    ;

    title.classList.add('invisible');
    input.classList.remove('hidden');
    input.value = entry.name;
    input.removeAttribute('readonly');
    input.focus();
    setInputSize();

    input.addEventListener('blur', async () => {
      cancel();
    });

    input.addEventListener('keydown', async (event) => {
      // on Enter
      if (event.key === 'Enter') {
        event.stopPropagation();
        event.preventDefault();

        input.setAttribute('readonly', '');

        this.ui.trigger('move', entry.fullPath, `${window.location.protocol}//${window.location.host}${entry.path}${input.value}`);
      }
      // on Escape
      else if (event.key === 'Escape') {
        cancel();
      }
    });

    input.addEventListener('input', async () => {
      return setInputSize();
    });
  };
}
