// map convenience methods: HTTP.GET(url, props)
const defaultParams = {
  PROPFIND: {
    headers: {
      Depth: 1
    }
  }
};

export default Object.freeze(['GET', 'HEAD', 'PUT', 'PROPFIND', 'DELETE', 'MKCOL', 'COPY', 'MOVE']
  .reduce((object, method) => ({
    ...object,
    [method]: (url, parameters = null) => fetch(url, {
      ...(defaultParams[method] || null),
      ...parameters,
      method
    })
    .then((response) => {
      if (!response.ok) {
        document.dispatchEvent(
          new CustomEvent('webdav:http-error', {
            detail: {
              method,
              url,
              response
            }
          })
        );

        return;
      }

      return response;
    })
  }), {}))
;
