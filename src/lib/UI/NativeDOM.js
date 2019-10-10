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

  bindEvents() {
    // TODO: could use modernizr?
    if ('ontouchstart' in document.body) {
      document.body.classList.add('is-touch');
    }

    window.addEventListener('popstate', () => {
      this.trigger('go');
    });

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

    this.on('create-directory', async (directoryName, path) => {
      await this.dav.mkcol(directoryName);

      this.trigger('go', path, true);
    });

    this.on('go', async (path = location.pathname, bypassCache = false, callback) => {
      const prevPath = location.pathname;

      if (path !== prevPath) {
        history.pushState(history.state, path, path);
      }

      this.trigger('update-list:request', collection);

      // TODO: store the collection to allow manipulation
      const collection = await this.dav.list(path, bypassCache);

      this.trigger('update-list:complete', collection);

      document.title = `${decodeURIComponent(path)} | WebDAV`;
    });
  }
}
