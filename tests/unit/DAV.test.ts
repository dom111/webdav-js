import Collection from '../../src/lib/DAV/Collection';
import DAV from '../../src/lib/DAV';
import HTTP from '../../src/lib/HTTP';

// @ts-ignore
const MockHttp = jest.createMockFromModule('../../src/lib/HTTP').default;

describe('DAV', () => {
  // @ts-ignore
  console.log((MockHttp as HTTP).GET('', {}));

  const getSpies = (SpyHTTPReturns = {}, SpyCacheReturns = {}) => {
    const SpyHTTP = jasmine.createSpyObj('HTTP', [
        'GET',
        'HEAD',
        'PUT',
        'PROPFIND',
        'DELETE',
        'MKCOL',
        'COPY',
        'MOVE',
      ]),
      SpyCache = jasmine.createSpyObj('Cache', ['delete', 'get', 'has', 'set']);
    [
      [SpyHTTP, SpyHTTPReturns],
      [SpyCache, SpyCacheReturns],
    ].forEach(([object, returnValues]) =>
      Object.entries(returnValues).forEach(
        ([method, returnValue]) =>
          (object[method] = object[method].and.returnValue(returnValue))
      )
    );

    return [SpyHTTP, SpyCache];
  };

  it('should fire a HEAD request on check', () => {
    const [SpyHTTP, SpyCache] = getSpies(),
      dav = new DAV({}, SpyCache, SpyHTTP);
    dav.check('/checkHeadRequest');
    expect(SpyHTTP.HEAD).toHaveBeenCalledWith('/checkHeadRequest');
  });

  it('should fire a COPY request on copy', () => {
    const [SpyHTTP, SpyCache] = getSpies(),
      dav = new DAV({}, SpyCache, SpyHTTP);
    dav.copy('/copySource', '/copyDestination');
    expect(SpyHTTP.COPY).toHaveBeenCalledWith('/copySource', {
      headers: {
        Destination: `${location.protocol}//${location.hostname}${
          location.port ? `:${location.port}` : ''
        }/copyDestination`,
      },
    });
  });

  it('should fire a DELETE request on del', () => {
    const [SpyHTTP, SpyCache] = getSpies(),
      dav = new DAV({}, SpyCache, SpyHTTP);
    dav.del('/checkDeleteRequest');
    expect(SpyHTTP.DELETE).toHaveBeenCalledWith('/checkDeleteRequest');
  });

  it('should fire a GET request on get', () => {
    const [SpyHTTP, SpyCache] = getSpies(),
      dav = new DAV({}, SpyCache, SpyHTTP);
    dav.get('/checkGetRequest');
    expect(SpyHTTP.GET).toHaveBeenCalledWith('/checkGetRequest');
  });

  it('should fire a PROPFIND request and store cache on list', async () => {
    const [SpyHTTP, SpyCache] = getSpies(
        {
          HEAD: {
            ok: true,
          },
          PROPFIND: {
            text: () =>
              '<?xml version="1.0" encoding="utf-8"?><D:multistatus xmlns:D="DAV:"><D:response xmlns:lp1="DAV:" xmlns:lp2="http://apache.org/dav/props/"><D:href>/Directory%20name/</D:href><D:propstat><D:prop><lp1:resourcetype><D:collection/></lp1:resourcetype><lp1:creationdate>2019-11-06T16:29:46Z</lp1:creationdate><lp1:getlastmodified>Wed, 06 Nov 2019 16:29:46 GMT</lp1:getlastmodified><lp1:getetag>"6-596b00e926ba3"</lp1:getetag><D:supportedlock><D:lockentry><D:lockscope><D:exclusive/></D:lockscope><D:locktype><D:write/></D:locktype></D:lockentry><D:lockentry><D:lockscope><D:shared/></D:lockscope><D:locktype><D:write/></D:locktype></D:lockentry></D:supportedlock><D:lockdiscovery/><D:getcontenttype>httpd/unix-directory</D:getcontenttype></D:prop><D:status>HTTP/1.1 200 OK</D:status></D:propstat></D:response></D:multistatus>',
          },
        },
        {
          get: false,
        }
      ),
      dav = new DAV({}, SpyCache, SpyHTTP),
      collection = await dav.list('/checkPropfindRequest');
    expect(SpyCache.get).toHaveBeenCalledWith('/checkPropfindRequest/');
    expect(SpyHTTP.HEAD).toHaveBeenCalledWith('/checkPropfindRequest/');
    expect(SpyHTTP.PROPFIND).toHaveBeenCalledWith('/checkPropfindRequest/');
    expect(collection).toBeInstanceOf(Collection);
    expect(SpyCache.set).toHaveBeenCalledWith(
      '/checkPropfindRequest/',
      collection
    );
  });

  it('should fire an MKCOL request on mkcol', () => {
    const [SpyHTTP, SpyCache] = getSpies(),
      dav = new DAV({}, SpyCache, SpyHTTP);
    dav.mkcol('/checkMkcolRequest');
    expect(SpyHTTP.MKCOL).toHaveBeenCalledWith('/checkMkcolRequest');
  });

  it('should fire a MOVE request on move', () => {
    const [SpyHTTP, SpyCache] = getSpies(),
      dav = new DAV({}, SpyCache, SpyHTTP);
    dav.move('/moveSource', '/moveDestination');

    expect(SpyHTTP.MOVE).toHaveBeenCalledWith('/moveSource', {
      headers: {
        Destination: `${location.protocol}//${location.hostname}${
          location.port ? `:${location.port}` : ''
        }/moveDestination`,
      },
    });
  });

  it('should fire a PUT request on upload', () => {
    const [SpyHTTP, SpyCache] = getSpies(),
      dav = new DAV({}, SpyCache, SpyHTTP),
      file = new File([''], 'uploadTest', {
        type: 'text/plain',
      });
    dav.upload('/path/', file);
    expect(SpyHTTP.PUT).toHaveBeenCalledWith('/path/uploadTest', {
      headers: {
        'Content-Type': file.type,
      },
      body: file,
    });
  });

  it('should not fire a HEAD request on list when `bypassCheck` is set', async () => {
    const [SpyHTTP, SpyCache] = getSpies(
        {
          HEAD: {
            ok: true,
          },
          PROPFIND: {
            text: () =>
              '<?xml version="1.0" encoding="utf-8"?><D:multistatus xmlns:D="DAV:"><D:response xmlns:lp1="DAV:" xmlns:lp2="http://apache.org/dav/props/"><D:href>/Directory%20name/</D:href><D:propstat><D:prop><lp1:resourcetype><D:collection/></lp1:resourcetype><lp1:creationdate>2019-11-06T16:29:46Z</lp1:creationdate><lp1:getlastmodified>Wed, 06 Nov 2019 16:29:46 GMT</lp1:getlastmodified><lp1:getetag>"6-596b00e926ba3"</lp1:getetag><D:supportedlock><D:lockentry><D:lockscope><D:exclusive/></D:lockscope><D:locktype><D:write/></D:locktype></D:lockentry><D:lockentry><D:lockscope><D:shared/></D:lockscope><D:locktype><D:write/></D:locktype></D:lockentry></D:supportedlock><D:lockdiscovery/><D:getcontenttype>httpd/unix-directory</D:getcontenttype></D:prop><D:status>HTTP/1.1 200 OK</D:status></D:propstat></D:response></D:multistatus>',
          },
        },
        {
          get: false,
        }
      ),
      dav = new DAV(
        {
          bypassCheck: true,
        },
        SpyCache,
        SpyHTTP
      );
    await dav.list('/checkPropfindRequest');

    expect(SpyHTTP.HEAD).not.toHaveBeenCalledWith('/checkPropfindRequest/');
  });
});
