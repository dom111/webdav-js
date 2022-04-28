import EventObject from '../EventObject';
import joinPath from '../joinPath';
import Collection from './Collection';

type EntryArgs = {
  directory?: boolean;
  fullPath?: string;
  title?: string;
  modified?: Date;
  size?: number;
  mimeType?: string;
  del?: boolean;
  rename?: boolean;
  placeholder?: boolean;
  collection?: Collection | null;
};

export default class Entry extends EventObject {
  #del;
  #directory;
  #displaySize;
  #extension;
  #fullPath;
  #mimeType;
  #modified;
  #name;
  #path;
  #placeholder;
  #rename;
  #size;
  #title;
  #type;

  collection;

  constructor({
    directory = false,
    fullPath,
    title = '',
    modified,
    size = 0,
    mimeType = '',
    del = true,
    rename = true,
    placeholder = false,
    collection = null,
  }: EntryArgs) {
    super();

    this.#directory = directory;
    this.#fullPath = fullPath;
    [this.#path, this.#name] = this.getFilename();
    this.#title = title;
    this.#modified = modified;
    this.#size = size;
    this.#mimeType = mimeType;
    this.#del = del;
    this.#rename = rename;
    this.#placeholder = placeholder;
    this.collection = collection;
  }

  createParentEntry() {
    return this.update({
      fullPath: this.path,
      title: '&larr;',
      del: false,
      rename: false,
    });
  }

  getFilename(path = this.#fullPath) {
    path = joinPath(path).split(/\//);
    const file = path.pop();

    return [joinPath(...path), file];
  }

  update(properties: EntryArgs = {}) {
    return new Entry({
      ...{
        directory: this.directory,
        fullPath: this.fullPath,
        modified: this.modified,
        size: this.size,
        mimeType: this.mimeType,
        del: this.del,
        rename: this.rename,
        collection: this.collection,
      },
      ...properties,
    });
  }

  get del() {
    return this.#del;
  }

  get directory() {
    return this.#directory;
  }

  get displaySize() {
    if (this.directory) {
      return '';
    }

    if (!this.#displaySize) {
      this.#displaySize = ['bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB'].reduce(
        (size, label) =>
          typeof size === 'string'
            ? size
            : size < 1024
            ? `${size.toFixed(2 * (label === 'bytes' ? 0 : 1))} ${label}`
            : size / 1024,
        this.#size
      );
    }

    return this.#displaySize;
  }

  get extension() {
    if (this.directory) {
      return '';
    }

    if (!this.#extension) {
      this.#extension = this.name.split('.').pop();
    }

    return this.#extension;
  }

  get fullPath() {
    return this.#fullPath;
  }

  get mimeType() {
    return this.#mimeType;
  }

  get modified() {
    return this.#modified;
  }

  get name() {
    return this.#name;
  }

  get path() {
    return this.#path;
  }

  get placeholder() {
    return this.#placeholder;
  }

  set placeholder(value) {
    this.#placeholder = value;

    this.trigger('entry:update', this);
  }

  get rename() {
    return this.#rename;
  }

  get size() {
    return this.#size;
  }

  get title() {
    if (!this.#title) {
      this.#title = decodeURIComponent(this.#name);
    }

    return this.#title;
  }

  get type() {
    if (!this.#type) {
      let type;

      const types = {
        text: /\.(?:te?xt|i?nfo|php|cgi|faq|ini|htaccess|log|md|sql|sfv|conf|sh|pl|pm|py|rb|(?:s?c|sa)ss|js|java|coffee|[sx]?html?|xml)$/i,
        image: /\.(?:jpe?g|gif|a?png|svg)$/i,
        video: /\.(?:mp(?:e?g)?4|mov|avi|webm|ogv|mkv)$/i,
        audio: /\.(?:mp3|wav|ogg|flac|mka)$/i,
        font: /\.(?:woff2?|eot|[ot]tf)$/i,
        pdf: /\.pdf/i,
      };

      for (const [key, value] of Object.entries(types)) {
        if (this.name.match(value)) {
          return (this.#type = key);
        }
      }

      if (this.#mimeType && (type = this.#mimeType.split('/').shift())) {
        return (this.#type = type);
      }

      this.#type = 'unknown';
    }

    return this.#type;
  }
}
