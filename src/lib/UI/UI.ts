import DAV from '../DAV';
import EventObject from '../EventObject';
import LanguageDetector from 'i18next-browser-languagedetector';
import Unimplemented from '../Unimplemented';
import de from '../../../translations/de.json';
import en from '../../../translations/en.json';
import i18next from 'i18next';
import pt from '../../../translations/pt.json';

type UIOptions = {
  bypassCheck?: boolean;
  sortDirectoriesFirst?: boolean;
};

export default class UI extends EventObject {
  #container;
  #dav;
  #options;

  constructor(
    container,
    options: UIOptions = {},
    dav = new DAV({
      bypassCheck: options.bypassCheck ?? false,
      sortDirectoriesFirst: options.sortDirectoriesFirst ?? false,
    })
  ) {
    super();

    if (!(container instanceof HTMLElement)) {
      throw new TypeError(`Invalid container element: '${container}'.`);
    }

    this.#container = container;
    this.#dav = dav;
    this.#options = options;

    i18next.use(LanguageDetector).init({
      detection: {
        caches: [],
      },
      fallbackLng: 'en',
      resources: {
        de,
        en,
        pt,
      },
    });
  }

  get options() {
    // return a clone so these cannot be changed
    return {
      ...this.#options,
    };
  }

  get dav(): DAV {
    return this.#dav;
  }

  get container() {
    return this.#container;
  }

  render() {
    throw new Unimplemented("'render' must be implemented in the child class.");
  }
}
