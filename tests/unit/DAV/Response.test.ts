import Collection from '../../../src/lib/Collection';
import Response from '../../../src/lib/Response';

describe('Response', () => {
  test.todo('No DOMParser implementation in Node');
  // const responseText = `<?xml version="1.0" encoding="utf-8"?><D:multistatus xmlns:D="DAV:"><D:response xmlns:lp1="DAV:" xmlns:lp2="http://apache.org/dav/props/"><D:href>/path/to/</D:href><D:propstat><D:prop><lp1:resourcetype><D:collection/></lp1:resourcetype><lp1:creationdate>2019-11-07T10:40:00Z</lp1:creationdate><lp1:getlastmodified>Thu, 07 Nov 2019 10:40:00 GMT</lp1:getlastmodified><lp1:getetag>"23-596bf4994c6f6"</lp1:getetag><D:supportedlock><D:lockentry><D:lockscope><D:exclusive/></D:lockscope><D:locktype><D:write/></D:locktype></D:lockentry><D:lockentry><D:lockscope><D:shared/></D:lockscope><D:locktype><D:write/></D:locktype></D:lockentry></D:supportedlock><D:lockdiscovery/><D:getcontenttype>httpd/unix-directory</D:getcontenttype></D:prop><D:status>HTTP/1.1 200 OK</D:status></D:propstat></D:response><D:response xmlns:lp1="DAV:" xmlns:lp2="http://apache.org/dav/props/"><D:href>/path/to/file</D:href><D:propstat><D:prop><lp1:resourcetype/><lp1:creationdate>2019-11-07T10:39:54Z</lp1:creationdate><lp1:getcontentlength>0</lp1:getcontentlength><lp1:getlastmodified>Thu, 07 Nov 2019 10:39:54 GMT</lp1:getlastmodified><lp1:getetag>"0-596bf4936570f"</lp1:getetag><lp2:executable>F</lp2:executable><D:supportedlock><D:lockentry><D:lockscope><D:exclusive/></D:lockscope><D:locktype><D:write/></D:locktype></D:lockentry><D:lockentry><D:lockscope><D:shared/></D:lockscope><D:locktype><D:write/></D:locktype></D:lockentry></D:supportedlock><D:lockdiscovery/></D:prop><D:status>HTTP/1.1 200 OK</D:status></D:propstat></D:response><D:response xmlns:lp1="DAV:" xmlns:lp2="http://apache.org/dav/props/"><D:href>/path/to/directory/</D:href><D:propstat><D:prop><lp1:resourcetype><D:collection/></lp1:resourcetype><lp1:creationdate>2019-11-07T10:40:00Z</lp1:creationdate><lp1:getlastmodified>Thu, 07 Nov 2019 10:40:00 GMT</lp1:getlastmodified><lp1:getetag>"6-596bf4994c6f6"</lp1:getetag><D:supportedlock><D:lockentry><D:lockscope><D:exclusive/></D:lockscope><D:locktype><D:write/></D:locktype></D:lockentry><D:lockentry><D:lockscope><D:shared/></D:lockscope><D:locktype><D:write/></D:locktype></D:lockentry></D:supportedlock><D:lockdiscovery/><D:getcontenttype>httpd/unix-directory</D:getcontenttype></D:prop><D:status>HTTP/1.1 200 OK</D:status></D:propstat></D:response></D:multistatus>`,
  //   response = new Response(responseText);
  // it('should return a valid Collection object that contains the expected entries', () => {
  //   const collection = response.collection(),
  //     entries = collection.map((entry) => entry),
  //     [, directory, file] = entries;
  //   expect(collection).toBeInstanceOf(Collection);
  //   expect(collection.path).toBe('/path/to');
  //   expect(entries.length).toBe(3);
  //   expect(directory.directory).toBeTruthy();
  //   expect(directory.title).toBe('directory');
  //   expect(file.directory).toBeFalsy();
  //   expect(file.title).toBe('file');
  // });
});
