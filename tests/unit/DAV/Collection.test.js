import Entry from './../../../src/lib/DAV/Entry.js';
import Collection from './../../../src/lib/DAV/Collection.js';

describe('Collection', () => {
  const directory = {
      directory: true,
      fullPath: '/path/to/',
      modified: new Date()
    },
    file1 = {
      directory: false,
      fullPath: '/path/to/file2.txt',
      modified: new Date(),
      size: 54321,
      mimeType: 'text/plain'
    },
    entries = [
      directory,
      file1,
     {
        directory: false,
        fullPath: '/path/to/file1.txt',
        modified: new Date(),
        size: 12345,
        mimeType: 'text/plain'
      }
    ],
    collection = new Collection(entries),
    collectionEntries = collection.map((entry) => entry)
  ;

  it('should the expected path from the first entry', () => {
    expect(collection.path).toBe('/path/to');
  });

  it('should create a new parent entry from the original first item', () => {
    expect(collectionEntries[0].fullPath).not.toBe(entries[0].fullPath);
  });

  it('should sort the entries by name', () => {
    expect(collectionEntries[1].fullPath).toBe(entries[2].fullPath);
  });

  it('should be possible to filter the entries', () => {
    expect(collection.filter((entry) => entry.name === 'file1.txt').length).toBe(1);
  });

  it('should be possible to add a new Entry', () => {
    collection.add(
      new Entry({
        ...file1,
        fullPath: '/path/to/file3.txt'
      })
    );

    expect(collection.filter((entry) => entry.name === 'file3.txt').length).toBe(1);
  });

  it('should be sort the entries alphabetically after adding a new Entry', () => {
    collection.add(
      new Entry({
        ...file1,
        fullPath: '/path/to/file0.txt'
      })
    ).filter((entry, i) => {
      if (entry.name === 'file0.txt') {
        expect(i).toBe(1);
      }
    });
  });

  it('should be possible to remove an Entry', () => {
    const [file0] = collection.filter((entry) => entry.name === 'file0.txt');

    expect(
      collection.remove(file0)
        .filter((entry) => entry.name === 'file0.txt')
        .length
    ).toBe(0);
  });
});
