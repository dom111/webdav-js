import Element from './Element.js';
import List from './List.js';

export default class Container extends Element {
  constructor(ui, list = new List(ui)) {
    const template = '<main></main>';

    super(ui, template);

    this.element.append(list.element);

    this.bindEvents(this.element);
  }

  bindEvents(element) {
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
  }
}