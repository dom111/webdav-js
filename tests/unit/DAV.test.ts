/**
 * @jest-environment jsdom
 */
import Collection from '../../src/lib/Collection';
import DAV, { RequestCache } from '../../src/lib/DAV';
import { DOMParser } from '@xmldom/xmldom';
import Entry from '../../src/lib/Entry';
import HTTP from '../../src/lib/HTTP';

describe('DAV', () => {
  const getSpies = (
    SpyHTTPReturns = {},
    SpyCacheReturns = {}
  ): [HTTP, RequestCache, Map<string, string | Collection>] => {
    const SpyHTTP = new HTTP(),
      SpyCache = new Map();

    [
      'GET',
      'HEAD',
      'PUT',
      'PROPFIND',
      'DELETE',
      'MKCOL',
      'COPY',
      'MOVE',
    ].forEach(
      (methodName) =>
        (SpyHTTP[methodName] = jest.fn(
          () =>
            new Promise((resolve) =>
              resolve(
                SpyHTTPReturns[methodName] ?? {
                  ok: true,
                  status: 200,
                  async text(): Promise<string> {
                    return '';
                  },
                }
              )
            )
        ))
    );

    ['delete', 'get', 'has', 'set'].forEach(
      (methodName) =>
        (SpyCache[methodName] = jest.fn(
          () => SpyCacheReturns[methodName] ?? null
        ))
    );

    const cache = new Map();

    cache.set('GET', SpyCache);
    cache.set('PROPFIND', SpyCache);

    return [SpyHTTP, cache, SpyCache];
  };

  if (typeof window === 'undefined') {
    global.location = {
      ...global.location,
      protocol: 'http:',
      host: 'localhost',
      hostname: 'localhost',
    };

    global.DOMParser = DOMParser;
  }

  it('should fire a HEAD request on check', () => {
    const [SpyHTTP, SpyCache] = getSpies(),
      dav = new DAV({}, SpyCache, SpyHTTP);

    dav.check('/checkHeadRequest');
    expect(SpyHTTP.HEAD).toHaveBeenCalledWith('/checkHeadRequest');
  });

  it('should fire a COPY request on copy', () => {
    const [SpyHTTP, SpyCache] = getSpies(),
      dav = new DAV({}, SpyCache, SpyHTTP);

    dav.copy(
      '/copySource',
      '/copyDestination',
      new Entry({
        fullPath: '/copySource',
      })
    );

    expect(SpyHTTP.COPY).toHaveBeenCalledWith('/copySource', {
      headers: {
        Destination: `${location.protocol}//${location.hostname}${
          location.port ? `:${location.port}` : ''
        }/copyDestination`,
        Overwrite: 'F',
      },
    });
  });

  it('should fire a DELETE request on del', () => {
    const [SpyHTTP, SpyCache] = getSpies(),
      dav = new DAV({}, SpyCache, SpyHTTP);

    dav.del('/checkDeleteRequest');
    expect(SpyHTTP.DELETE).toHaveBeenCalledWith('/checkDeleteRequest', {
      headers: { Depth: 'infinity' },
    });
  });

  it('should fire a GET request on get', () => {
    const [SpyHTTP, SpyCache] = getSpies(),
      dav = new DAV({}, SpyCache, SpyHTTP);

    dav.get('/checkGetRequest');
    expect(SpyHTTP.GET).toHaveBeenCalledWith('/checkGetRequest');
  });

  it('should fire a PROPFIND request and store cache on list', async () => {
    const [SpyHTTP, cache, SpyCache] = getSpies(
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
      dav = new DAV({}, cache, SpyHTTP),
      collection = await dav.list('/checkPropfindRequest');

    expect(SpyCache.has).toHaveBeenCalledWith('/checkPropfindRequest/');
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
    0;

    dav.createDirectory('/checkMkcolRequest');
    expect(SpyHTTP.MKCOL).toHaveBeenCalledWith('/checkMkcolRequest');
  });

  it('should fire a MOVE request on move', () => {
    const [SpyHTTP, SpyCache] = getSpies(),
      dav = new DAV({}, SpyCache, SpyHTTP);

    dav.move(
      '/moveSource',
      '/moveDestination',
      new Entry({
        fullPath: '/moveSource',
        directory: false,
      })
    );

    expect(SpyHTTP.MOVE).toHaveBeenCalledWith('/moveSource', {
      headers: {
        Destination: `${location.protocol}//${location.hostname}${
          location.port ? `:${location.port}` : ''
        }/moveDestination`,
        Overwrite: 'F',
      },
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
