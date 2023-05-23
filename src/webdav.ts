import './style.scss';

import Container from './components/Container';
import DAV from './lib/DAV';
import Footer from './components/Footer';
import Header from './components/Header';
import LanguageDetector from 'i18next-browser-languagedetector';
import List from './components/List';
import State from './lib/State';
import UI from './components/UI';
import de from '../translations/de.json';
import en from '../translations/en.json';
import pt from '../translations/pt.json';
import { use } from 'i18next';

use(LanguageDetector)
  .init({
    detection: {
      caches: [],
    },
    fallbackLng: 'en',
    resources: {
      de,
      en,
      pt,
    },
  })
  .then((): void => {
    const state = new State(document, window),
      dav = new DAV({
        bypassCheck: !!document.querySelector('[data-disable-check]'),
        sortDirectoriesFirst: !!document.querySelector(
          '[data-sort-directories-first]'
        ),
      }),
      container = new Container(),
      header = new Header(state),
      list = new List(dav, state),
      footer = new Footer(dav, state),
      ui = new UI(document.body, dav, state);

    container.append(header, list);
    ui.append(container, footer);
  });
