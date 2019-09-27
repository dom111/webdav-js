import HTTP from './HTTP.js';
import Entry from './Entry.js';

const validDestination = (destination) => {
        const hostname = `${location.protocol}//${location.hostname}`,
            hostnameRegExp = new RegExp(`^${hostname}`)
        ;

        if (! destination.match(hostnameRegExp)) {
            if (destination.match(/^http/)) {
                throw new TypeError(`Invalid destination host: '${destination}'.`);
            }

            return `${hostname}${destination}`;
        }

        return destination;
    },
    responseToEntry = (response) => {
        const getTag = (doc, tag) => doc.querySelector(tag),
            getTagContent = (doc, tag) => {
                const node = getTag(doc, tag);

                return node ? node.textContent : '';
            }
        ;

        return new Entry({
            directory: !!getTag(response,'collection'),
            fullPath: getTagContent(response, 'href'),
            modified: Date.parse(getTagContent(response, 'getlastmodified')),
            size: parseInt(getTagContent(response, 'getcontentlength'), 10),
            mimeType: getTagContent(response, 'getcontenttype'),
            del: true
        });
    },
    cache = new Map()
;

export default class DAV {
    static async get(uri) {
        return HTTP.GET(uri);
    }

    static async list(uri, bypassCache) {
        if (! bypassCache) {
            const cached = cache.get(uri);

            if (cached) {
                return cached;
            }
        }

        const data = await HTTP.PROPFIND(uri, {
                headers: {
                    Depth: 1
                }
            }),
            parser = new DOMParser(),
            xml = parser.parseFromString(await data.text(), 'application/xml'),
            entries = Array.from(
                xml.querySelectorAll('response')
            ).map(responseToEntry)
        ;

        // the first entry is a stub for the directory itself, we can remove that for the root path...
        const parent = entries.shift();

        if (uri !== '/') {
            // ...but change the details for all others.
            entries.unshift(
                Entry.createParentEntry(parent)
            );
        }

        cache.set(uri, entries);

        return entries;
    }

    static async delete(uri) {
        return HTTP.DELETE(uri);
    }

    static async mkcol(dest) {
        return HTTP.MKCOL(dest)
    }

    static async copy(from, to) {
        return HTTP.COPY(from, {
            headers: {
                Destination: validDestination(to)
            }
        });
    }

    static async move(from, to) {
        return HTTP.MOVE(from, {
            headers: {
                Destination: validDestination(to)
            }
        });
    }

    static async upload(path, files) {
        for (const fileObject of files) {
            const targetFile = path + fileObject.name,
                pathEntries = await this.list(path),
                existingFile = pathEntries.filter((entry) => entry.name === fileObject.name)
            ;

            if (existingFile) {
                // TODO: nicer notification
                if (! confirm(`A file called '${existingFile.name}' already exists, would you like to overwrite it?`)) {
                    return false;
                }
            }

            HTTP.PUT(targetFile, {
                headers: {
                    'Content-Type': fileObject.type
                },
                body: fileObject
            });
        }
    }
};
