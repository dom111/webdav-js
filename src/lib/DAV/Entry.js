export default class Entry {
    #directory;
    #title;
    #fullPath;
    #name;
    #path;
    #extension;
    #modified;
    #size;
    #displaySize;
    #type;
    #mimeType;
    #del;

    constructor({directory, fullPath, title = '', modified, size = 0, mimeType = '', del = true}) {
      this.#directory = directory;
      this.#fullPath = fullPath;
      [this.#path, this.#name] = this.getFilename();
      this.#title = title;
      this.#modified = modified;
      this.#size = size;
      this.#mimeType = mimeType;
      this.#del = del;
    }

    getFilename(path = this.#fullPath) {
      path = path.replace(/\/$/, '').split(/\//);
      const file = path.pop();

      return [`${path.join('/')}/`, file];
    }

    update(properties = {}) {
      return new Entry({
        ...{
          directory: this.directory,
          fullPath: this.fullPath,
          modified: this.modified,
          size: this.size,
          mimeType: this.mimeType,
          del: this.del
        },
        ...properties
      });
    }

    get directory() {
      return this.#directory;
    }

    get title() {
      if (!this.#title) {
        this.#title = decodeURIComponent(this.#name);
      }

      return this.#title;
    }

    get name() {
      return this.#name;
    }

    get path() {
      return this.#path;
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

    get modified() {
      return this.#modified;
    }

    get size() {
      return this.#size;
    }

    get displaySize() {
      if (this.directory) {
        return '';
      }

      if (!this.#displaySize) {
        this.#displaySize = ['bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB']
          .reduce(
            (size, label) => (typeof size === 'string') ?
              size :
              (size < 1024) ?
                `${size.toFixed(2 * (label !== 'bytes'))} ${label}` :
                size / 1024,
            this.#size
          )
        ;
      }

      return  this.#displaySize;
    }

    get type() {
      if (!this.#type) {
        let type;

        const types = {
          text: /\.(?:te?xt|i?nfo|php|pl|cgi|faq|ini|htaccess|log|md|sql|sfv|conf|sh|pl|pm|py|rb|(?:s?c|sa)ss|js|java|coffee|[sx]?html?|xml)$/i,
          image: /\.(?:jpe?g|gif|a?png|svg)$/i,
          video: /\.(?:mp(?:e?g)?4|mov|avi|webm|ogv)$/i,
          audio: /\.(?:mp3|wav|ogg)$/i,
          font: /\.(?:woff2?|eot|[ot]tf)$/i
        };

        for (const [key, value] of Object.entries(types)) {
          if (this.name.match(value)) {
            return this.#type = key;
          }
        }

        if (this.#mimeType && (type = this.#mimeType.split('/').shift())) {
          return this.#type = type;
        }

        this.#type = 'unknown';
      }

      return this.#type;
    }

    get del() {
      return this.#del;
    }

    createParentEntry() {
      return this.update({
        fullPath: this.path,
        title: '&larr;'
      });
    }
}
