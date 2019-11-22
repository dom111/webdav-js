import Container from './NativeDOM/Container.js';
import Footer from './NativeDOM/Footer.js';
import Melba from 'melba-toast';
import UI from './UI.js';

export default class NativeDOM extends UI {
  render(container = new Container(), footer = new Footer()) {
    this.container.appendChild(container.element);
    this.container.appendChild(footer.element);

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
      this.container.classList.add('is-touch');
    }

    if (! supportsDragDrop) {
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

        for (const file of files) {
          this.trigger('upload', location.pathname, file);
        }
      });
    }

    // global listeners
    this.on('error', ({method, url, response}) => {
      new Melba({
        content: `${method} ${url} failed: ${response.statusText} (${response.status})`,
        type: 'error'
      });
    });

    // local events
    this.on('upload', async (path, file) => {
      const collection = await this.dav.list(path),
        [existingFile] = collection.filter((entry) => entry.name === file.name)
      ;

      if (existingFile) {
        // TODO: nicer notification
        // TODO: i18m
        if (! confirm(`A file called '${existingFile.title}' already exists, would you like to overwrite it?`)) {
          return false;
        }
      }

      await this.dav.upload(path, file);
    });

    this.on('upload:success', async (path, file) => {
      new Melba({
        content: `'${file.name}' has been successfully uploaded.`,
        type: 'success',
        hide: 5
      });
    });

    this.on('move', async (source, destination, entry) => {
      await this.dav.move(source, destination, entry);
    });

    this.on('move:success', (source, destination, entry) => {
      const [, destinationUrl, destinationFile] = destination.match(/^(.*)\/([^/]+\/?)$/),
        destinationPath = destinationUrl && destinationUrl.replace(
          `${location.protocol}//${location.hostname}${location.port ? `:${location.port}` : ''}`,
          ''
        )
      ;

      if (entry.path === destinationPath) {
        return new Melba({
          content: `'${entry.title}' successfully renamed to '${decodeURIComponent(destinationFile)}'.`,
          type: 'success',
          hide: 5
        });
      }

      new Melba({
        content: `'${entry.title}' successfully moved to '${decodeURIComponent(destinationPath)}'.`,
        type: 'success',
        hide: 5
      });
    });

    this.on('delete', async (path, entry) => {
      await this.dav.del(path, entry);
    });

    this.on('delete:success', (path, entry) => {
      new Melba({
        content: `'${entry.title}' has been deleted.`,
        type: 'success',
        hide: 5
      });
    });

    this.on('get', async (file, callback) => {
      const response = await this.dav.get(file);

      callback(response && await response.text());
    });

    this.on('check', async (uri, callback, failure) => {
      const response = await this.dav.check(uri);

      if (response && response.ok && callback) {
        callback(response);

        return;
      }

      if (failure) {
        failure();
      }
    });

    this.on('create-directory', async (fullPath, directoryName, path) => {
      await this.dav.mkcol(fullPath, directoryName, path);
    });

    this.on('mkcol:success', (fullPath, directoryName) => {
      new Melba({
        content: `'${directoryName}' has been created.`,
        type: 'success',
        hide: 5
      });
    });

    this.on('go', async (path = location.pathname, bypassCache = false, failure = null) => {
      const prevPath = location.pathname;

      this.trigger('list:update:request', path);

      // TODO: store the collection to allow manipulation
      const collection = await this.dav.list(path, bypassCache);

      if (! collection) {
        this.trigger('list:update:failed');

        if (failure) {
          failure();
        }

        return;
      }

      this.trigger('list:update:success', collection);

      if (path !== prevPath) {
        history.pushState(history.state, path, path);
      }

      document.title = `${decodeURIComponent(path)} | WebDAV`;
    });
  }
}
