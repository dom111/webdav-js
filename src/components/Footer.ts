import Element, { on, s } from '@dom111/element';
import joinPath, { trailingSlash } from '../lib/joinPath';
import DAV from '../lib/DAV';
import Entry from '../lib/Entry';
import State from '../lib/State';
import handleFileUpload from '../lib/handleFileUpload';
import { success } from 'melba-toast';
import { t } from 'i18next';

export default class Footer extends Element {
  #dav: DAV;
  #state: State;

  constructor(dav: DAV, state: State) {
    super(
      s(`<footer class="upload">
  <span class="droppable">${t('dropFilesAnywhereToUpload')}</span> ${t('or')}
  <span class="files">${t(
    'uploadFiles'
  )} <input type="file" multiple></span> ${t('or')}
  <a href="#" class="create-directory">${t('createNewDirectory')}</a>
</footer>`)
    );

    this.#dav = dav;
    this.#state = state;

    this.bindEvents();
  }

  private bindEvents(): void {
    const input = this.query('input[type="file"]') as HTMLInputElement,
      createDirectoryLink = this.query(
        '.create-directory'
      ) as HTMLAnchorElement;

    on(input, 'change', async (): Promise<void> => {
      for (const file of input.files) {
        handleFileUpload(this.#dav, this.#state, file);
      }

      this.#state.update();

      input.value = null;
    });

    on(
      createDirectoryLink,
      'click',
      async (event: MouseEvent): Promise<void> => {
        event.preventDefault();

        const directoryName = prompt('', t('directoryName'));

        if (!directoryName) {
          return;
        }

        this.handleCreateDirectory(
          trailingSlash(joinPath(location.pathname, directoryName)),
          directoryName
        );
      }
    );
  }

  async handleCreateDirectory(fullPath: string, directoryName: string) {
    const result = await this.#dav.createDirectory(fullPath);

    if (!result.ok) {
      return;
    }

    success(
      t('successfullyCreated', {
        interpolation: {
          escapeValue: false,
        },
        directoryName,
      })
    );

    const collection = this.#state.getCollection();

    collection.add(
      new Entry({
        directory: true,
        fullPath,
        modified: Date.now(),
        collection,
      })
    );

    this.#state.update();
  }
}
