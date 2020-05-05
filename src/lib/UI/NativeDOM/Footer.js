import Element from './Element.js';
import joinPath from '../../joinPath.js';

export default class Footer extends Element {
  constructor() {
    const template = `<footer class="upload">
  <span class="droppable">Drop files anywhere to upload</span> or
  <span class="files">Upload files <input type="file" multiple></span> or
  <a href="#" class="create-directory">create a new directory</a>
</footer>`;

    super(template);

    this.bindEvents();
  }

  bindEvents(element = this.element) {
    element.querySelector('input[type="file"]').addEventListener('change', async (event) => {
      for (const file of event.target.files) {
        this.trigger('upload', location.pathname, file);
      }

      this.value = null;
    });

    element.querySelector('.create-directory').addEventListener('click', async (event) => {
      event.preventDefault();

      // TODO: i18m
      const directoryName = prompt('', 'Directory name');

      if (! directoryName) {
        return;
      }

      this.trigger('create-directory', `${joinPath(location.pathname, directoryName)}/`, directoryName, location.pathname);
    });
  }
}
