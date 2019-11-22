import EventObject from './EventObject';

const defaultParams = {
  PROPFIND: {
    headers: {
      Depth: 1
    }
  }
};

export default class HTTP extends EventObject {}

// map convenience methods: HTTP.GET(url, props)
['GET', 'HEAD', 'PUT', 'PROPFIND', 'DELETE', 'MKCOL', 'COPY', 'MOVE'].forEach(
  (method) => {
    HTTP.prototype[method] = function(url, parameters) {
      return fetch(url, {
        ...(defaultParams[method] || null),
        ...parameters,
        method
      })
        .then((response) => {
          if (! response.ok) {
            this.trigger('error', {
              method,
              url,
              response
            });

            return;
          }

          return response;
        });
    };
  }
);
