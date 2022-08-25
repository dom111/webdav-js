import Collection from './Collection';
import EventObject from '../EventObject';
import joinPath from '../joinPath';

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
  #del: boolean;
  #directory: boolean;
  #displaySize: string;
  #extension: string;
  #fullPath: string;
  #mimeType: string;
  #modified: Date;
  #name: string;
  #path: string;
  #placeholder: boolean;
  #rename: boolean;
  #size: number;
  #title: string;
  #type: string;

  collection: Collection | null;

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

    const [path, name] = this.getFilename(fullPath);

    this.#path = path;
    this.#name = name;
    this.#directory = directory;
    this.#fullPath = fullPath;
    this.#title = title;
    this.#modified = modified;
    this.#size = size;
    this.#mimeType = mimeType;
    this.#del = del;
    this.#rename = rename;
    this.#placeholder = placeholder;
    this.collection = collection;
  }

  createParentEntry(): Entry {
    return this.update({
      fullPath: this.path,
      title: '&larr;',
      del: false,
      rename: false,
    });
  }

  getFilename(path: string): [string, string] {
    const pathParts = joinPath(path).split(/\//),
      file = pathParts.pop();

    return [joinPath(...pathParts), file];
  }

  update(properties: EntryArgs = {}): Entry {
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

  get del(): boolean {
    return this.#del;
  }

  get directory(): boolean {
    return this.#directory;
  }

  get displaySize(): string {
    if (this.directory) {
      return '';
    }

    if (!this.#displaySize) {
      this.#displaySize = ['bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB'].reduce(
        (size: string | number, label) => {
          if (typeof size === 'string') {
            return size;
          }

          if (size < 1024) {
            return `${size.toFixed(2 * (label === 'bytes' ? 0 : 1))} ${label}`;
          }

          return size / 1024;
        },
        this.#size
      ) as string;
    }

    return this.#displaySize;
  }

  get extension(): string {
    if (this.directory) {
      return '';
    }

    if (!this.#extension) {
      this.#extension = this.name.split('.').pop();
    }

    return this.#extension;
  }

  get fullPath(): string {
    return this.#fullPath;
  }

  get mimeType(): string {
    return this.#mimeType;
  }

  get modified(): Date {
    return this.#modified;
  }

  get name(): string {
    return this.#name;
  }

  get path(): string {
    return this.#path;
  }

  get placeholder(): boolean {
    return this.#placeholder;
  }

  set placeholder(value: boolean) {
    this.#placeholder = value;

    this.trigger('entry:update', this);
  }

  get rename(): boolean {
    return this.#rename;
  }

  get size(): number {
    return this.#size;
  }

  get title(): string {
    if (!this.#title) {
      this.#title = decodeURIComponent(this.#name);
    }

    return this.#title;
  }

  get type(): string {
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
