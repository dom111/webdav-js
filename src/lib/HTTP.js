import Toast from 'melba-toast';

// map convenience methods: HTTP.GET(url, props)
const defaultParams = {
  PROPFIND: {
    headers: {
      Depth: 1
    }
  }
};

export default Object.freeze(['GET', 'PUT', 'PROPFIND', 'DELETE', 'MKCOL', 'COPY', 'MOVE']
  .reduce((object, method) => ({
    ...object,
    [method]: (url, parameters = null) => fetch(url, {
      ...(defaultParams[method] || null),
      ...parameters,
      method
    })
    .then((response) => {
      if (!response.ok) {
        new Toast({
          content: `${method} ${url} failed: ${response.statusText} (${response.status})`,
          type: 'error'
        });

        return;
      }

      return response;
    })
  }), {}))
;
