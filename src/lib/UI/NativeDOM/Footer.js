import Element from './Element.js'

export default class Footer extends Element {
  constructor(ui) {
    const template = `<footer class="upload">
  <span class="droppable">Drop files anywhere to upload</span> or
  <span class="files">Upload files <input type="file" multiple></span> or
  <a href="#" class="create-directory">create a new directory</a>
</footer>`;

    super(ui, template);

    this.bindEvents();
  }

  bindEvents(element = this.element) {
    element.querySelector('input[type="file"]').addEventListener('change', async (event) => {
      this.trigger('upload', location.pathname, event.originalEvent.dataTransfer.files);

      this.value = null;
    });

    element.querySelector('.create-directory').addEventListener('click', async (event) => {
      event.preventDefault();

      // TODO: i18m
      const directoryName = prompt('', 'Directory name');

      if (!directoryName) {
          return;
      }

      this.ui.trigger('create-directory', location.pathname + directoryName, location.pathname);
    });
  }
}
