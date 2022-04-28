import Entry from './../../../src/lib/DAV/Entry';

describe('Entry', () => {
  const directory = new Entry({
      directory: true,
      fullPath: '/path/to/',
      modified: new Date(),
    }),
    file = new Entry({
      directory: false,
      fullPath: '/path/to/file.txt',
      modified: new Date(),
      size: 54321,
      mimeType: 'text/plain',
    }),
    atFile = new Entry({
      directory: false,
      fullPath: '/%40',
      modified: new Date(),
      size: 54321,
      mimeType: 'text/plain',
    });
  // directory
  it('should strip the trailing slash for directories', () => {
    expect(directory.path).toBe('/path');
    expect(directory.name).toBe('to');
  });

  it('should return an empty size for directories', () => {
    expect(directory.displaySize).toBe('');
  });

  it('should return a new object on update', () => {
    expect(directory.update()).not.toBe(directory);
  });

  it('should create the expected parent object', () => {
    const parent = directory.createParentEntry();

    expect(parent.fullPath).toBe(directory.path);
    expect(parent.title).toBe('&larr;');
  });

  it('should be possible to change the placeholder status', () => {
    expect(file.placeholder).toBe(false);
    file.placeholder = true;
    expect(file.placeholder).toBe(true);
  });

  // file
  it('should return the expected path', () => {
    expect(file.path).toBe('/path/to');
  });

  it('should return the expected filename', () => {
    expect(file.name).toBe('file.txt');
  });

  it('should return the expected extension', () => {
    expect(file.extension).toBe('txt');
  });

  it('should return the expected type', () => {
    expect(file.type).toBe('text');
  });

  it('should return the expected size string', () => {
    expect(file.displaySize).toBe('53.05 KiB');
  });

  // atFile
  it('should correctly decode filenames', () => {
    expect(atFile.name).toBe('%40');
    expect(atFile.title).toBe('@');
  });
});
