import Element from './Element';
import i18next from 'i18next';
import joinPath from '../../joinPath';
import trailingSlash from '../../trailingSlash';

export default class Footer extends Element {
  constructor() {
    const template = `<footer class="upload">
  <span class="droppable">${i18next.t(
    'dropFilesAnywhereToUpload'
  )}</span> ${i18next.t('or')}
  <span class="files">${i18next.t(
    'uploadFiles'
  )} <input type="file" multiple></span> ${i18next.t('or')}
  <a href="#" class="create-directory">${i18next.t('createNewDirectory')}</a>
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

        const directoryName = prompt('', i18next.t('directoryName'));

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
