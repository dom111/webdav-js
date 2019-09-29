import UI from './UI.js';
import * as BasicLightbox from '../../../node_modules/basiclightbox/src/scripts/main.js';
// import '../../../node_modules/highlight.js/lib/highlight.js';
import Prism from '../../../node_modules/prismjs/prism.js';

export default class NativeDOM extends UI {
    #templates = Object.freeze({
        base: `<main>
    <ul class="loading"></ul>
</main>
<footer class="upload">
    <span class="droppable">Drop files anywhere to upload</span> or
    <span class="files">Upload files <input type="file" multiple></span> or
    <a href="#" class="create-directory">create a new directory</a>
</footer>`,
        entry: (entry) => `<li tabindex="0" data-full-path=${entry.fullPath}">
    <span class="title">${entry.title}</span>
    <input type="text" name="rename" class="hidden" readonly>
    <span class="size">${entry.displaySize}</span>
    <a href="#" title="Delete" class="delete"></a>
    <!--<a href="#" title="Move" class="move"></a>-->
    <a href="#" title="Rename" class="rename"></a>
    <!--<a href="#" title="Copy" class="copy"></a>-->
    <a href="${entry.fullPath}" download="${entry.title}" title="Download" class="download"></a>
</li>`,
        video: (entry) => `<video autoplay controls><source src="${entry.fullPath}"/></video>`,
        audio: (entry) => `<audio autoplay controls><source src="${entry.fullPath}"/></audio>`,
        image: (entry) => `<img alt="${entry.title}" src="${entry.fullPath}"/>`,
        font: (entry) => {
            const formats = {
                    eot: 'embedded-opentype',
                    otf: 'opentype',
                    ttf: 'truetype'
                },
                extension = entry.name.replace(/^.+\.([^\.]+)$/, '$1').toLowerCase(),
                fontName = entry.fullPath.replace(/\W+/g, '_'),
                demoText = 'The quick brown fox jumps over the lazy dog. 0123456789<br/>Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz'
            ;

            return `<style type="text/css">@font-face{font-family:"${fontName}";src:url("${entry.fullPath}") format("${formats[extension] || extension}")}</style>
<h1 style="font-family:'${fontName}'">${entry.name}</h1>
<p style="font-family:'${fontName}';font-size:1.5em">${demoText}</p>
<p style="font-family:'${fontName}'">${demoText}</p>
<p style="font-family:'${fontName}'"><strong>${demoText}</strong></p>
<p style="font-family:'${fontName}'"><em>${demoText}</em></p>`
        },
        text: (entry, content) => `<pre><code class="language-${entry.extension}">${content.replace(/[<>]/g, (c) => ({'<': '&lt;', '>': '&gt;'}[c]))}</code></pre>`
    });

    #list;

    // DOM helpers
    createNodesFromString(html) {
        const container = document.createElement('div'),
            fragment = document.createDocumentFragment()
        ;
        container.innerHTML = html;

        for (const childNode of container.childNodes) {
            fragment.appendChild(childNode);
        }

        return fragment;
    }

    createNodeFromString(html) {
        return this.createNodesFromString(html).firstChild
    }

    emptyNode(node) {
        while (node.firstChild) {
            node.removeChild(node.firstChild);
        }

        return node;
    }

    createNodeFromEntry(entry) {
        const node = this.createNodeFromString(this.#templates.entry(entry));
        node.classList.add(
            ...[
                entry.directory ? 'directory' : 'file',
                entry.type      ? entry.type : 'unknown',
                entry.isGoUp    ? 'parent'    : ''
            ]
            // ensure empty classes are removed
                .filter((entry) => entry)
        );

        node.addEventListener('click', async (event) => {
            event.preventDefault();

            node.classList.add('loading');

            if (entry.directory) {
                return this.update(entry.fullPath);
            }

            const escapeListener = (event) => {
                    if (event.key === 'Escape') {
                        lightbox.close();
                    }
                }
            ;

            let lightbox,
                lightboxContent,
                onShow
            ;

            if (['video', 'audio', 'image', 'font'].includes(entry.type)) {
                lightboxContent = this.#templates[entry.type](entry);
            }
            else if (entry.type === 'text') {
                const file = await this.dav.get(entry.fullPath);

                lightboxContent = this.#templates.text(entry, await file.text());
                onShow = () => Prism.highlightAllUnder(lightbox.element());
            }

            lightbox = BasicLightbox.create(lightboxContent, {
                className: entry.type,
                onShow: () => {
                    node.classList.remove('loading');
                    document.addEventListener('keydown', escapeListener);

                    if (onShow) {
                        onShow();
                    }
                },
                onClose: () => document.removeEventListener('keydown', escapeListener)
            });
            lightbox.show();
        });

        node.querySelector('.delete').addEventListener('click', async (event) => {
            event.preventDefault();
            event.stopPropagation();

            if (! entry.delete) {
                throw new TypeError(`'${entry.name}' is read only.`);
            }

            await HTTP.DELETE(entry.fullPath);
            return this.update(entry.path);
        });

        node.querySelector('.rename').addEventListener('click', async (event) => {
            event.preventDefault();
            event.stopPropagation();

            const title = node.querySelector('.title'),
                input = node.querySelector('input'),
                setInputSize = () => {
                    title.innerText = input.value;
                    input
                        .style
                        .setProperty(
                            'width',
                            title.scrollWidth + 'px'
                        )
                    ;
                }
            ;

            title.classList.add('invisible');
            input.classList.remove('hidden');
            input.value = entry.name;
            input.removeAttribute('readonly');
            input.focus();
            setInputSize();

            input.addEventListener('keydown', async (event) => {
                // on Enter
                if (event.which === 13) {
                    event.preventDefault();

                    input.setAttribute('readonly', '');

                    await HTTP.MOVE(entry.fullPath, {
                        // TODO: make safer
                        headers: {
                            Destination: `${window.location.protocol}//${window.location.host + entry.path + input.value}`
                        }
                    });

                    return this.update(entry.path);
                }
                // on Escape
                else if (event.which === 27) {
                    title.classList.remove('invisible');
                    return input.classList.add('hidden');
                }
            });

            input.addEventListener('input', async () => {
                return setInputSize();
            });
        });

        node.querySelector('.download').addEventListener('click', async (event) => {
            event.stopPropagation();
        });

        return node;
    };

    render() {
        this.emptyNode(this.container)
            .append(this.createNodesFromString(this.#templates.base))
        ;

        this.#list = this.container.querySelector('main ul');

        // TODO: could use modernizr?
        if ('ontouchstart' in document.body) {
            document.body.classList.add('is-touch');

            this.container.querySelector('input[type="file"]').addEventListener('change', (event) => {
                handleUpload(event.originalEvent.target.files || event.originalEvent.dataTransfer.files);

                this.value = null;
            });
        }

        document.addEventListener('dragenter', (event) => {
            event.stopPropagation();
            event.preventDefault();

            if (event.target.classList.contains('directory') || event.target === this.container) {
                event.target.classList.add('active');
            }
        });

        document.addEventListener('dragover', (event) => {
            event.preventDefault();
        });

        document.addEventListener('dragleave', (event) => {
            event.stopPropagation();

            if (event.target.classList.contains('directory') || event.target === this.container) {
                event.target.classList.remove('active');
            }
        });

        document.addEventListener('dragend', (event) => {
            event.stopPropagation();

            if (event.target.classList.contains('directory') || event.target === this.container) {
                event.target.classList.remove('active');
            }
        });

        document.addEventListener('drop', (event) => {
            event.preventDefault();

            const files = event.target.files || event.dataTransfer.files;

            for (const element of this.container.querySelectorAll('.active')) {
                element.classList.remove('active');
            }

            if (event.target.classList.contains('directory')) {
                this.dav.upload(event.target.dataset('full-path'), files);
            }
            else {
                this.dav.upload(location.pathname, files);
            }

            return false;
        });

        this.update();
    }

    async update(path = location.pathname) {
        const prevPath = location.pathname;

        if (path !== prevPath) {
            history.pushState(history.state, path, path);
        }

        this.#list.classList.add('loading');

        const entries = await this.dav.list(path);

        this.emptyNode(this.#list)
            .append(...entries.map(
                (entry) => this.createNodeFromEntry(entry)
            ))
        ;
        this.#list.classList.remove('loading');
    };
}
