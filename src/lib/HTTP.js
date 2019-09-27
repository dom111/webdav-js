// map convenience methods: HTTP.GET(url, props)
export default ['GET', 'PUT', 'PROPFIND', 'DELETE', 'MKCOL', 'COPY', 'MOVE']
    .reduce((object, method) => ({
        ...object,
        [method]: (url, parameters = {}) => fetch(url, {
            ...parameters,
            method
        }).catch((error) => {
            // TODO: improve this - notify properly
            console.error(error);

            if (method === 'PROPFIND') {
                history.back();
            }
            else {
                window.reload();
            }
        })
    }), {})
;
