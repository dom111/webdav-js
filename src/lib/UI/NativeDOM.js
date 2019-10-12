import Footer from './NativeDOM/Footer.js';
import Container from './NativeDOM/Container.js';
import Melba from 'melba-toast';
import UI from './UI.js';

export default class NativeDOM extends UI {
  render(container = new Container(this), footer = new Footer(this)) {
    this.container.append(container.element, footer.element);

    this.bindEvents();

    this.trigger('go');
  }

  bindEvents(element = this.container) {
    const supportsEvent = (eventName) => {
        const element = document.createElement('span');
        element.setAttribute(`on${eventName}`, '');

        return typeof element[`on${eventName}`] === 'function';
      },
      isTouch = supportsEvent('touchstart'),
      supportsDragDrop = supportsEvent('dragstart') && supportsEvent('drop')
    ;

    // DOM events
    if (isTouch) {
      this.contaier.classList.add('is-touch');
    }

    if (!supportsDragDrop) {
      this.container.classList.add('no-drag-drop');
    }

    window.addEventListener('popstate', () => {
      this.trigger('go');
    });

    if (supportsDragDrop) {
      ['dragenter', 'dragover'].forEach((eventName) => {
        element.addEventListener(eventName, (event) => {
          event.preventDefault();
          event.stopPropagation();

          element.classList.add('active');
        });
      });

      ['dragleave', 'drop'].forEach((eventName) => {
        element.addEventListener(eventName, (event) => {
          event.preventDefault();
          event.stopPropagation();

          element.classList.remove('active');
        });
      });

      element.addEventListener('drop', async (event) => {
        const {files} = event.dataTransfer;

        // TODO: show placeholder when items are dropped
        this.trigger('upload', location.pathname, files);
      });
    }

    // global listeners
    document.addEventListener('webdav:http-error', ({
      detail: {
        method,
        url,
        response
      }
    }) => {
      new Melba({
        content: `${method} ${url} failed: ${response.statusText} (${response.status})`,
        type: 'error'
      });
    });

    // local events
    this.on('upload', async (path, files) => {
      await this.dav.upload(path, files);

      this.trigger('go', path, true);
    });

    this.on('move', async (source, destination, path = location.pathname) => {
      await this.dav.move(source, destination);

      // TODO: save transfer and have DAV update the list?
      this.trigger('go', path, true);
    });

    this.on('delete', async (file, path = location.pathname) => {
      await this.dav.del(file);

      this.trigger('go', path, true);
    });

    this.on('get', async (file, callback) => {
      const response = await this.dav.get(file);

      callback(response && await response.text());
    });

    this.on('check', async (uri, callback) => {
      const response = await this.dav.check(uri);

      if (response && response.ok && callback) {
        callback(response);
      }
    });

    this.on('create-directory', async (directoryName, path) => {
      await this.dav.mkcol(directoryName);

      this.trigger('go', path, true);
    });

    this.on('go', async (path = location.pathname, bypassCache = false, callback) => {
      const prevPath = location.pathname;

      this.trigger('update-list:request', collection);

      // TODO: store the collection to allow manipulation
      const collection = await this.dav.list(path, bypassCache);

      if (!collection) {
        this.trigger('update-list:failed', collection);
        return;
      }

      this.trigger('update-list:complete', collection);

      if (path !== prevPath) {
        history.pushState(history.state, path, path);
      }

      document.title = `${decodeURIComponent(path)} | WebDAV`;
    });
  }
}
