# webdav-js

A simple way to administer a WebDAV filesystem from your browser.

The original aim for this project was to provide a bookmarklet for use when you want to administer a WebDAV server,
without the need for using a third party application.

The application has since been rewritten to not rely on jQuery and use more modern methods and provide a single runtime
file. Now that there's more separation between the interface code and the library code, I'd like to investigate using
other frontend approaches to see which I prefer (and also to weigh up the differences between the currently available
frameworks). There's still work to do around code separation andhopefully this will be something I can continue to work
on (as time allows) I feel it's at least as stable as the previous version.

## Tested in:

- Chrome
- Firefox
- Edge
- IE11 (I may drop support for this to reduce the package size in the future - unless anyone REALY needs it?)

## Implementations

### Bookmarklet:

`javascript:["https://cdn.jsdelivr.net/gh/dom111/webdav-js/assets/css/style-min.css","https://cdn.jsdelivr.net/gh/dom111/webdav-js/src/webdav-min.js"].forEach((function(e,s){/css$/.test(e)?((s=document.createElement("link")).href=e,s.rel="stylesheet"):(s=document.createElement("script")).src=e,document.head.appendChild(s)}));`

[or drag this link directly](javascript:%5B%22https%3A//cdn.jsdelivr.net/gh/dom111/webdav-js/assets/css/style-min.css%22%2C%22https%3A//cdn.jsdelivr.net/gh/dom111/webdav-js/src/webdav-min.js%22%5D.forEach%28%28function%28e%2Cs%29%7B/css%24/.test%28e%29%3F%28%28s%3Ddocument.createElement%28%22link%22%29%29.href%3De%2Cs.rel%3D%22stylesheet%22%29%3A%28s%3Ddocument.createElement%28%22script%22%29%29.src%3De%2Cdocument.head.appendChild%28s%29%7D%29%29%3B)

### Apache:

There is also an example for how you could set up Apache in the `examples/` directory (one using a locally hosted
version of the library, and one using a CDN).

Think you have another example implementation that would be good to showcase?
[Fork this repository](https://github.com/dom111/webdav-js/fork) and make a PR!

## Test the library

Included in the package is a `docker-compose.yml` file that can spawn an Alpine Linux Apache WebDAV server that uses the
example Apache configuration so you can see the library in action if you don't have a WebDAV server at your disposal.

To start it, run:

    docker-compose up

and navigate to `http://localhost:8080/`.

## Contributing

If you feel this can be improved (I'm certain it can!), please feel free to fork it and submit a PR.

To start making changes, ensure you install all the dependencies:

    yarn install # or npm install

After making changes, ensure you rebuild the application:

    yarn build # or npm run build

Once your changes have compiled you can test using the Docker container.

### Unit Tests

To run the unit tests:

    docker-compose run --workdir=/src --rm test yarn test
