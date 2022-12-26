import joinPath, { pathAndName, trailingSlash } from './joinPath';
import Collection from './Collection';
import EventEmitter from '@dom111/typed-event-emitter/EventEmitter';
import { t } from 'i18next';

type EntryArgs = {
  copy?: boolean;
  directory?: boolean;
  fullPath?: string;
  title?: string;
  modified?: number;
  move?: boolean;
  size?: number;
  mimeType?: string;
  del?: boolean;
  rename?: boolean;
  placeholder?: boolean;
  uploadedSize?: number;
  collection?: Collection | null;
};

type EntryEvents = {
  updated: [];
};

const sizeToDisplaySize = (size: number): string => {
  return ['bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB'].reduce(
    (size: string | number, label) => {
      if (typeof size === 'string') {
        return size;
      }

      if (size < 1024) {
        return `${size.toFixed(2 * (label === 'bytes' ? 0 : 1))} ${label}`;
      }

      return size / 1024;
    },
    size
  ) as string;
}

export default class Entry extends EventEmitter<EntryEvents> {
  #copy: boolean;
  #del: boolean;
  #directory: boolean;
  #displaySize: string;
  #extension: string;
  #fullPath: string;
  #mimeType: string;
  #modified: Date;
  #move: boolean;
  #name: string;
  #path: string;
  #placeholder: boolean;
  #uploadedSize: number;
  #rename: boolean;
  #size: number;
  #title: string;
  #type: string;

  collection: Collection | null;

  constructor({
    fullPath,
    collection = null,
    copy = true,
    del = true,
    directory = false,
    mimeType = '',
    modified,
    move = true,
    placeholder = false,
    uploadedSize = 0,
    rename = true,
    size = 0,
    title = '',
  }: EntryArgs) {
    super();

    const [path, name] = this.getFilename(fullPath);

    const modifiedDate = new Date();
    modifiedDate.setTime(modified);

    this.#path = path;
    this.#name = name;
    this.#copy = copy;
    this.#directory = directory;
    this.#fullPath = fullPath;
    this.#title = title;
    this.#modified = modifiedDate;
    this.#move = move;
    this.#size = size;
    this.#mimeType = mimeType;
    this.#del = del;
    this.#rename = rename;
    this.#placeholder = placeholder;
    this.#uploadedSize = uploadedSize;
    this.collection = collection;
  }

  createParentEntry(): Entry {
    return this.update({
      fullPath: trailingSlash(this.path),
      title: '&larr;',
      copy: false,
      del: false,
      move: false,
      rename: false,
    });
  }

  getFilename(path: string): [string, string] {
    return pathAndName(path);
  }

  update(properties: EntryArgs = {}): Entry {
    const newEntry = new Entry({
      ...{
        directory: this.directory,
        fullPath: this.fullPath,
        modified: this.modified.getTime(),
        size: this.size,
        mimeType: this.mimeType,
        del: this.del,
        rename: this.rename,
        collection: this.collection,
      },
      ...properties,
    });

    this.emit('replaced', newEntry);

    return newEntry;
  }

  get copy(): boolean {
    return this.#copy;
  }

  get del(): boolean {
    return this.#del;
  }

  get directory(): boolean {
    return this.#directory;
  }

  get displaySize(): string {
    if (this.#directory) {
      return '';
    }

    if (!this.#displaySize) {
      this.#displaySize = sizeToDisplaySize(this.#size);
    }

    if (this.placeholder) {
      return t('uploadProgress', {
        interpolation: {
          escapeValue: false,
        },
        uploaded: sizeToDisplaySize(this.#uploadedSize),
        total: this.#displaySize,
      });
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

  get move(): boolean {
    return this.#move;
  }

  get name(): string {
    return this.#name;
  }

  set name(name: string) {
    this.#name = encodeURIComponent(name);
    this.#title = null;
    this.#type = null;
    this.#fullPath = joinPath(this.#path, this.#name);

    if (this.directory) {
      this.#fullPath = trailingSlash(this.#fullPath);
    }

    // regenerate these:
    this.title;
    this.type;

    this.emit('updated');
  }

  get path(): string {
    return this.#path;
  }

  get placeholder(): boolean {
    return this.#placeholder;
  }

  set placeholder(value: boolean) {
    this.#placeholder = value;
  }

  get uploadedSize(): number {
    return this.#uploadedSize;
  }

  set uploadedSize(value: number) {
    this.#uploadedSize = value;
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
      const types = {
        text: /\.(?:te?xt|i?nfo|php|cgi|faq|ini|htaccess|log|md|sql|sfv|conf|sh|pl|pm|py|rb|(?:s?c|sa)ss|js|java|coffee|[sx]?html?|xml)$/i,
        image: /\.(?:jpe?g|gif|a?png|svg)$/i,
        video: /\.(?:mp(?:e?g)?4|mov|avi|webm|ogv|mkv)$/i,
        audio: /\.(?:mp3|wav|ogg|flac|mka)$/i,
        font: /\.(?:woff2?|eot|[ot]tf)$/i,
        pdf: /\.pdf$/i,
      };

      for (const [key, value] of Object.entries(types)) {
        if (this.#name.match(value)) {
          return (this.#type = key);
        }
      }

      this.#type = 'unknown';
    }

    return this.#type;
  }
}
