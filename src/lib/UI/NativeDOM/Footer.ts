import Element from './Element';
import joinPath from '../../joinPath';
import trailingSlash from '../../trailingSlash';

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
    element
      .querySelector('input[type="file"]')
      .addEventListener('change', async (event) => {
        for (const file of event.target.files) {
          this.trigger('upload', location.pathname, file);
        }

        element.value = null;
      });

    element
      .querySelector('.create-directory')
      .addEventListener('click', async (event) => {
        event.preventDefault();

        // TODO: i18m
        const directoryName = prompt('', 'Directory name');

        if (!directoryName) {
          return;
        }

        this.trigger(
          'create-directory',
          trailingSlash(joinPath(location.pathname, directoryName)),
          directoryName,
          location.pathname
        );
      });
  }
}
