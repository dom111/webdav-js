This is a WIP branch, to test, run:

    yarn install
    yarn run node-sass assets/scss/style.scss -o assets/css --output-style compressed && cp assets/css/style{,-min}.css
    docker-compose up -d

and navigate to `http://localhost:8080/`.

Currently I'm having problems writing files which I'm looking into.

TODO:
- [x] Use `docker-compose` and automate all the `run-local` scripts
- [ ] Add `docker-compose.yml` config for CDN
- [ ] Fix upload...
- [ ] Add missing functionality
- [ ] Add unit tests
- [ ] Allow uploading of directories
- [ ] Add webpack/something to bundle everything
- [ ] Test other browsers
