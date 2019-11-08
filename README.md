This is a WIP branch, to test, run:

    yarn install # or npm install
    yarn build # or npm run build
    docker-compose up

and navigate to `http://localhost:8080/`.

Before releasing v2.0.0 I'd like to:

- [x] Use `docker-compose` and automate all the `run-local` scripts
- [x] Fix upload...
- [x] Add missing functionality
- [X] Add unit tests
- [x] Add webpack/something to bundle everything
- [x] Handle errors from `fetch`
- [x] Handle errors from navigation (`history.back()`)
- [x] Run a `HEAD` for images/fonts/etc.
- [x] Add keyboard navigation (up/down arrow)
- [x] Dynamically update the list when uploading files with placeholders
- [x] Fix rename bug after successfully renaming a file (rename input box shows previous filename)
- [ ] Test other browsers

Beyond that:

- [ ] Add more unit tests
- [ ] Add end-to-end UI testing
- [ ] Allow uploading of directories ([#48](https://github.com/dom111/webdav-js/issues/48))
- [ ] Add functionality for copying and moving files and directories
- [ ] Support keyboard navigation whilst overlay is visible
- [ ] Add progress bar for file uploads
- [ ] Improve code in `item.js` - maybe split out the functionality into each action?
