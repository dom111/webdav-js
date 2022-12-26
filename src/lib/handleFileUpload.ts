import DAV from './DAV';
import Entry from './Entry';
import State from './State';
import joinPath from './joinPath';
import { success, error } from 'melba-toast';
import { t } from 'i18next';

const XHRPutFile = (
  url: string,
  file: File,
  onProgress: (progress: number) => void
): Promise<XMLHttpRequest> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.upload.onprogress = (e) => onProgress(e.loaded);
    xhr.onloadend = () => resolve(xhr);
    xhr.open('PUT', url, true);
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.send(file);
  });
};

export const handleFileUpload = async (
  dav: DAV,
  state: State,
  file: File
): Promise<void> => {
  const collection = await dav.list(state.getPath(), true);

  if (!collection) {
    return;
  }

  state.setCollection(collection);

  const [existingFile] = collection.filter(
    (entry: Entry): boolean => entry.name === file.name
  );

  if (existingFile) {
    // TODO: nicer notification
    if (
      !confirm(
        t('overwriteFileConfirmation', {
          file: existingFile.title,
        })
      )
    ) {
      return;
    }

    collection.remove(existingFile);
  }

  const placeholder = new Entry({
    fullPath: joinPath(state.getPath(), file.name),
    modified: Date.now(),
    size: file.size,
    mimeType: file.type,
    placeholder: true,
    collection,
  });

  collection.add(placeholder);

  const xhr = await XHRPutFile(
    joinPath(location.pathname, file.name),
    file,
    (uploaded: number) => {
      placeholder.uploaded = uploaded;
      placeholder.emit('updated');
    }
  );

  const ok = xhr.status >= 200 && xhr.status < 300;

  if (!ok) {
    collection.remove(placeholder);
    state.update();

    error(
      t('failure', {
        interpolation: {
          escapeValue: false,
        },
        method: 'PUT',
        url: xhr.responseURL,
        statusText: xhr.statusText,
        status: xhr.status,
      })
    );

    return;
  }

  placeholder.placeholder = false;

  state.update();

  success(
    t('successfullyUploaded', {
      interpolation: {
        escapeValue: false,
      },
      file: file.name,
    })
  );
};

export default handleFileUpload;
