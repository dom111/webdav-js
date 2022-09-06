import { leadingAndTrailingSlash, trimSlashes } from '../../lib/joinPath';
import DataProvider from './DataProvider';
import Node from './Node';
import Response from '../../lib/Response';

interface WebDAVOptions {
  debug: boolean;
  depth: number;
}

export class WebDAV implements DataProvider {
  #cache: Map<string, Promise<Node[]>> = new Map();
  #options: WebDAVOptions = {
    debug: true,
    depth: 2,
  };

  constructor(options: Partial<WebDAVOptions> = {}) {
    this.#options = {
      ...this.#options,
      ...options,
    };
  }

  async getChildren(
    node: Node,
    bypassCache: boolean = false,
    depth: number = this.#options.depth
  ): Promise<Node[] | null> {
    if (depth === 0) {
      return null;
    }

    const path =
      node.fullPath().length === 0
        ? '/'
        : leadingAndTrailingSlash(node.fullPath().join('/'));

    if (!this.#cache.has(path) || bypassCache) {
      this.#cache.set(
        path,
        fetch(path, {
          method: 'PROPFIND',
          headers: {
            Depth: '1',
          },
        })
          .then(async (response) => {
            if (!response.ok) {
              if (this.#options.debug) {
                console.error(response);
              }

              return [];
            }

            const davResponse = new Response(
                await response.text()
              ).responseToPrimitives(),
              directories = davResponse
                .filter((entry) => entry.directory && entry.fullPath !== path)
                .sort((a, b) => (a.fullPath < b.fullPath ? -1 : 1)),
              children = directories.map((entry) => {
                const fullPath = trimSlashes(entry.fullPath).split('/');

                const name = decodeURIComponent(fullPath.slice(0).pop()),
                  childNode = new Node(fullPath, name);

                this.getChildren(childNode, bypassCache, depth - 1);

                return childNode;
              });

            node.setChildren(children);

            return children;
          })
          .catch((e) => {
            if (this.#options.debug) {
              console.error(e);
            }

            return [];
          })
      );
    }

    return this.#cache.get(path);
  }
}

export default WebDAV;
