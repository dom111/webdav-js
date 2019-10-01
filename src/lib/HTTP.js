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
        }).catch((error) => {
            // TODO: improve this - notify properly
            console.error(error);
        })
    }), {}))
;
